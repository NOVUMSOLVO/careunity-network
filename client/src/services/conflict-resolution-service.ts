/**
 * Conflict Resolution Service
 * 
 * This service handles conflict resolution for offline data synchronization.
 * It provides strategies for resolving conflicts between local and server data.
 */

import { SyncOperation, SyncOperationStatus } from '@shared/types/sync';
import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/db';
import { getLocalTimestamp, getServerTimestamp } from '@/lib/timestamp';

// Conflict resolution strategies
export enum ConflictStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
  LAST_WRITE_WINS = 'last_write_wins'
}

// Conflict types
export enum ConflictType {
  CREATE_CREATE = 'create_create', // Both client and server created the same resource
  UPDATE_UPDATE = 'update_update', // Both client and server updated the same resource
  DELETE_UPDATE = 'delete_update', // Client deleted, server updated
  UPDATE_DELETE = 'update_delete', // Client updated, server deleted
  DELETE_DELETE = 'delete_delete'  // Both client and server deleted the same resource
}

// Conflict data
export interface ConflictData {
  type: ConflictType;
  resourceId: string;
  resourceType: string;
  clientData: any;
  serverData: any;
  clientTimestamp: number;
  serverTimestamp: number;
  operationId: string;
}

// Conflict resolution result
export interface ConflictResolutionResult {
  resolved: boolean;
  strategy: ConflictStrategy;
  resolvedData?: any;
  error?: string;
}

/**
 * Conflict Resolution Service
 */
export class ConflictResolutionService {
  // Default strategy for each conflict type
  private defaultStrategies: Record<ConflictType, ConflictStrategy> = {
    [ConflictType.CREATE_CREATE]: ConflictStrategy.MERGE,
    [ConflictType.UPDATE_UPDATE]: ConflictStrategy.MERGE,
    [ConflictType.DELETE_UPDATE]: ConflictStrategy.SERVER_WINS,
    [ConflictType.UPDATE_DELETE]: ConflictStrategy.CLIENT_WINS,
    [ConflictType.DELETE_DELETE]: ConflictStrategy.SERVER_WINS
  };

  // Custom strategies for specific resource types
  private customStrategies: Record<string, Record<ConflictType, ConflictStrategy>> = {
    'visits': {
      [ConflictType.UPDATE_UPDATE]: ConflictStrategy.MERGE,
      [ConflictType.DELETE_UPDATE]: ConflictStrategy.SERVER_WINS,
      [ConflictType.UPDATE_DELETE]: ConflictStrategy.CLIENT_WINS,
      [ConflictType.CREATE_CREATE]: ConflictStrategy.MERGE,
      [ConflictType.DELETE_DELETE]: ConflictStrategy.SERVER_WINS
    },
    'notes': {
      [ConflictType.UPDATE_UPDATE]: ConflictStrategy.LAST_WRITE_WINS,
      [ConflictType.DELETE_UPDATE]: ConflictStrategy.MANUAL,
      [ConflictType.UPDATE_DELETE]: ConflictStrategy.CLIENT_WINS,
      [ConflictType.CREATE_CREATE]: ConflictStrategy.MERGE,
      [ConflictType.DELETE_DELETE]: ConflictStrategy.SERVER_WINS
    }
  };

  /**
   * Detect conflict type based on operation and server response
   */
  detectConflictType(operation: SyncOperation, serverResponse: any): ConflictType {
    const { method } = operation;
    const serverStatus = serverResponse?.status;

    if (method === 'POST' && serverStatus === 409) {
      return ConflictType.CREATE_CREATE;
    } else if (method === 'PUT' || method === 'PATCH') {
      if (serverStatus === 404) {
        return ConflictType.UPDATE_DELETE;
      } else if (serverStatus === 409) {
        return ConflictType.UPDATE_UPDATE;
      }
    } else if (method === 'DELETE') {
      if (serverStatus === 404) {
        return ConflictType.DELETE_DELETE;
      } else if (serverStatus === 409) {
        return ConflictType.DELETE_UPDATE;
      }
    }

    // Default to UPDATE_UPDATE if we can't determine the type
    return ConflictType.UPDATE_UPDATE;
  }

  /**
   * Get the appropriate conflict resolution strategy
   */
  getStrategy(conflict: ConflictData): ConflictStrategy {
    const { type, resourceType } = conflict;

    // Check if we have a custom strategy for this resource type
    if (this.customStrategies[resourceType] && this.customStrategies[resourceType][type]) {
      return this.customStrategies[resourceType][type];
    }

    // Fall back to default strategy
    return this.defaultStrategies[type];
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflict: ConflictData, strategy?: ConflictStrategy): Promise<ConflictResolutionResult> {
    // Use provided strategy or get the appropriate one
    const resolutionStrategy = strategy || this.getStrategy(conflict);

    try {
      switch (resolutionStrategy) {
        case ConflictStrategy.CLIENT_WINS:
          return this.resolveClientWins(conflict);
        case ConflictStrategy.SERVER_WINS:
          return this.resolveServerWins(conflict);
        case ConflictStrategy.MERGE:
          return this.resolveMerge(conflict);
        case ConflictStrategy.LAST_WRITE_WINS:
          return this.resolveLastWriteWins(conflict);
        case ConflictStrategy.MANUAL:
          return {
            resolved: false,
            strategy: ConflictStrategy.MANUAL,
            error: 'Manual resolution required'
          };
        default:
          return {
            resolved: false,
            strategy: resolutionStrategy,
            error: 'Unknown resolution strategy'
          };
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return {
        resolved: false,
        strategy: resolutionStrategy,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Resolve conflict with client data winning
   */
  private async resolveClientWins(conflict: ConflictData): Promise<ConflictResolutionResult> {
    const { resourceType, resourceId, clientData, operationId } = conflict;

    // For client wins, we force the server to accept our data
    try {
      // Make the API call with force flag
      const response = await apiClient.put(`/api/v2/${resourceType}/${resourceId}`, {
        ...clientData,
        _force: true,
        _conflictResolution: true
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Mark the operation as resolved
      await db.syncOperations.update(operationId, {
        status: SyncOperationStatus.COMPLETED,
        resolvedAt: new Date().toISOString(),
        resolutionStrategy: ConflictStrategy.CLIENT_WINS
      });

      return {
        resolved: true,
        strategy: ConflictStrategy.CLIENT_WINS,
        resolvedData: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resolve conflict with server data winning
   */
  private async resolveServerWins(conflict: ConflictData): Promise<ConflictResolutionResult> {
    const { operationId } = conflict;

    // For server wins, we simply accept the server's data and mark our operation as resolved
    try {
      // Mark the operation as resolved
      await db.syncOperations.update(operationId, {
        status: SyncOperationStatus.COMPLETED,
        resolvedAt: new Date().toISOString(),
        resolutionStrategy: ConflictStrategy.SERVER_WINS
      });

      return {
        resolved: true,
        strategy: ConflictStrategy.SERVER_WINS,
        resolvedData: conflict.serverData
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resolve conflict by merging client and server data
   */
  private async resolveMerge(conflict: ConflictData): Promise<ConflictResolutionResult> {
    const { resourceType, resourceId, clientData, serverData, operationId } = conflict;

    try {
      // Merge the data
      const mergedData = this.mergeData(clientData, serverData);

      // Send the merged data to the server
      const response = await apiClient.put(`/api/v2/${resourceType}/${resourceId}`, {
        ...mergedData,
        _force: true,
        _conflictResolution: true
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Mark the operation as resolved
      await db.syncOperations.update(operationId, {
        status: SyncOperationStatus.COMPLETED,
        resolvedAt: new Date().toISOString(),
        resolutionStrategy: ConflictStrategy.MERGE
      });

      return {
        resolved: true,
        strategy: ConflictStrategy.MERGE,
        resolvedData: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resolve conflict with last write winning
   */
  private async resolveLastWriteWins(conflict: ConflictData): Promise<ConflictResolutionResult> {
    const { clientTimestamp, serverTimestamp } = conflict;

    // Determine which timestamp is more recent
    if (clientTimestamp > serverTimestamp) {
      return this.resolveClientWins(conflict);
    } else {
      return this.resolveServerWins(conflict);
    }
  }

  /**
   * Merge client and server data
   */
  private mergeData(clientData: any, serverData: any): any {
    // Start with server data as the base
    const mergedData = { ...serverData };

    // Merge in client data, giving preference to client values for fields that were explicitly changed
    Object.keys(clientData).forEach(key => {
      // Skip metadata fields
      if (key.startsWith('_')) {
        return;
      }

      // If the client has a different value than the server, use the client's value
      if (clientData[key] !== serverData[key]) {
        mergedData[key] = clientData[key];
      }
    });

    return mergedData;
  }
}
