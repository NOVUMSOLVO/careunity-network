import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  ConflictResolutionService, 
  ConflictType, 
  ConflictStrategy, 
  ConflictData 
} from '../conflict-resolution-service';
import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    put: vi.fn(),
  }
}));

vi.mock('@/lib/db', () => ({
  db: {
    syncOperations: {
      update: vi.fn(),
    }
  }
}));

describe('ConflictResolutionService', () => {
  let service: ConflictResolutionService;
  let mockConflictData: ConflictData;
  
  beforeEach(() => {
    service = new ConflictResolutionService();
    
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup mock conflict data
    mockConflictData = {
      type: ConflictType.UPDATE_UPDATE,
      resourceId: '123',
      resourceType: 'visits',
      clientData: { 
        id: '123', 
        status: 'completed', 
        notes: 'Client notes',
        updatedAt: '2023-01-01T12:00:00Z'
      },
      serverData: { 
        id: '123', 
        status: 'in-progress', 
        notes: 'Server notes',
        updatedAt: '2023-01-01T11:00:00Z'
      },
      clientTimestamp: 1672574400000, // 2023-01-01T12:00:00Z
      serverTimestamp: 1672570800000, // 2023-01-01T11:00:00Z
      operationId: 'op-123'
    };
    
    // Setup API client mock
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { id: '123', status: 'completed', notes: 'Merged notes' },
      error: null
    });
    
    // Setup DB mock
    vi.mocked(db.syncOperations.update).mockResolvedValue(undefined);
  });
  
  describe('detectConflictType', () => {
    it('should detect CREATE_CREATE conflict', () => {
      const operation = { method: 'POST', url: '/api/v2/visits' };
      const serverResponse = { status: 409 };
      
      const result = service.detectConflictType(operation, serverResponse);
      
      expect(result).toBe(ConflictType.CREATE_CREATE);
    });
    
    it('should detect UPDATE_UPDATE conflict', () => {
      const operation = { method: 'PUT', url: '/api/v2/visits/123' };
      const serverResponse = { status: 409 };
      
      const result = service.detectConflictType(operation, serverResponse);
      
      expect(result).toBe(ConflictType.UPDATE_UPDATE);
    });
    
    it('should detect UPDATE_DELETE conflict', () => {
      const operation = { method: 'PUT', url: '/api/v2/visits/123' };
      const serverResponse = { status: 404 };
      
      const result = service.detectConflictType(operation, serverResponse);
      
      expect(result).toBe(ConflictType.UPDATE_DELETE);
    });
    
    it('should detect DELETE_DELETE conflict', () => {
      const operation = { method: 'DELETE', url: '/api/v2/visits/123' };
      const serverResponse = { status: 404 };
      
      const result = service.detectConflictType(operation, serverResponse);
      
      expect(result).toBe(ConflictType.DELETE_DELETE);
    });
    
    it('should detect DELETE_UPDATE conflict', () => {
      const operation = { method: 'DELETE', url: '/api/v2/visits/123' };
      const serverResponse = { status: 409 };
      
      const result = service.detectConflictType(operation, serverResponse);
      
      expect(result).toBe(ConflictType.DELETE_UPDATE);
    });
  });
  
  describe('getStrategy', () => {
    it('should return custom strategy for specific resource type and conflict type', () => {
      const conflict = {
        ...mockConflictData,
        resourceType: 'visits',
        type: ConflictType.UPDATE_UPDATE
      };
      
      const result = service.getStrategy(conflict);
      
      expect(result).toBe(ConflictStrategy.MERGE);
    });
    
    it('should return default strategy when no custom strategy exists', () => {
      const conflict = {
        ...mockConflictData,
        resourceType: 'unknown-resource',
        type: ConflictType.UPDATE_UPDATE
      };
      
      const result = service.getStrategy(conflict);
      
      expect(result).toBe(ConflictStrategy.MERGE); // Default for UPDATE_UPDATE
    });
  });
  
  describe('resolveConflict', () => {
    it('should resolve conflict with CLIENT_WINS strategy', async () => {
      const result = await service.resolveConflict(
        mockConflictData, 
        ConflictStrategy.CLIENT_WINS
      );
      
      expect(result.resolved).toBe(true);
      expect(result.strategy).toBe(ConflictStrategy.CLIENT_WINS);
      
      // Check if API was called with client data
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v2/visits/123',
        expect.objectContaining({
          ...mockConflictData.clientData,
          _force: true,
          _conflictResolution: true
        })
      );
      
      // Check if operation was marked as resolved
      expect(db.syncOperations.update).toHaveBeenCalledWith(
        'op-123',
        expect.objectContaining({
          status: 'COMPLETED',
          resolutionStrategy: ConflictStrategy.CLIENT_WINS
        })
      );
    });
    
    it('should resolve conflict with SERVER_WINS strategy', async () => {
      const result = await service.resolveConflict(
        mockConflictData, 
        ConflictStrategy.SERVER_WINS
      );
      
      expect(result.resolved).toBe(true);
      expect(result.strategy).toBe(ConflictStrategy.SERVER_WINS);
      
      // Check if API was NOT called
      expect(apiClient.put).not.toHaveBeenCalled();
      
      // Check if operation was marked as resolved
      expect(db.syncOperations.update).toHaveBeenCalledWith(
        'op-123',
        expect.objectContaining({
          status: 'COMPLETED',
          resolutionStrategy: ConflictStrategy.SERVER_WINS
        })
      );
    });
    
    it('should resolve conflict with MERGE strategy', async () => {
      const result = await service.resolveConflict(
        mockConflictData, 
        ConflictStrategy.MERGE
      );
      
      expect(result.resolved).toBe(true);
      expect(result.strategy).toBe(ConflictStrategy.MERGE);
      
      // Check if API was called with merged data
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v2/visits/123',
        expect.objectContaining({
          id: '123',
          status: 'completed', // From client
          notes: 'Client notes', // From client
          _force: true,
          _conflictResolution: true
        })
      );
      
      // Check if operation was marked as resolved
      expect(db.syncOperations.update).toHaveBeenCalledWith(
        'op-123',
        expect.objectContaining({
          status: 'COMPLETED',
          resolutionStrategy: ConflictStrategy.MERGE
        })
      );
    });
    
    it('should resolve conflict with LAST_WRITE_WINS strategy (client wins)', async () => {
      const result = await service.resolveConflict(
        mockConflictData, 
        ConflictStrategy.LAST_WRITE_WINS
      );
      
      expect(result.resolved).toBe(true);
      expect(result.strategy).toBe(ConflictStrategy.LAST_WRITE_WINS);
      
      // Client timestamp is more recent, so client should win
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v2/visits/123',
        expect.objectContaining({
          ...mockConflictData.clientData,
          _force: true,
          _conflictResolution: true
        })
      );
    });
    
    it('should resolve conflict with LAST_WRITE_WINS strategy (server wins)', async () => {
      // Modify conflict data so server timestamp is more recent
      const serverWinsConflict = {
        ...mockConflictData,
        clientTimestamp: 1672570800000, // 2023-01-01T11:00:00Z
        serverTimestamp: 1672574400000  // 2023-01-01T12:00:00Z
      };
      
      const result = await service.resolveConflict(
        serverWinsConflict, 
        ConflictStrategy.LAST_WRITE_WINS
      );
      
      expect(result.resolved).toBe(true);
      expect(result.strategy).toBe(ConflictStrategy.LAST_WRITE_WINS);
      
      // Server timestamp is more recent, so server should win
      expect(apiClient.put).not.toHaveBeenCalled();
    });
    
    it('should return unresolved for MANUAL strategy', async () => {
      const result = await service.resolveConflict(
        mockConflictData, 
        ConflictStrategy.MANUAL
      );
      
      expect(result.resolved).toBe(false);
      expect(result.strategy).toBe(ConflictStrategy.MANUAL);
      expect(result.error).toBe('Manual resolution required');
      
      // No API calls or DB updates should happen
      expect(apiClient.put).not.toHaveBeenCalled();
      expect(db.syncOperations.update).not.toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      // Setup API to return an error
      vi.mocked(apiClient.put).mockResolvedValue({
        data: null,
        error: { message: 'API Error' }
      });
      
      try {
        await service.resolveConflict(
          mockConflictData, 
          ConflictStrategy.CLIENT_WINS
        );
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(db.syncOperations.update).not.toHaveBeenCalled();
      }
    });
  });
});
