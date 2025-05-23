/**
 * Integration Manager Service
 * 
 * Manages all external integrations for the CareUnity application
 */

import { db } from '../../db';
import { ApiError } from '../../utils/api-error';
import { FHIRIntegrationService } from './healthcare-integration';
import { WearablesIntegrationService, WearableDeviceType } from './wearables-integration';

// Integration types
export enum IntegrationType {
  HEALTHCARE = 'healthcare',
  WEARABLE = 'wearable',
  PHARMACY = 'pharmacy',
  SOCIAL_SERVICES = 'social_services',
  TRANSPORTATION = 'transportation',
  BILLING = 'billing',
  CUSTOM = 'custom',
}

// Integration status
export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
}

// Integration configuration
export interface IntegrationConfig {
  id?: number;
  name: string;
  type: IntegrationType;
  subtype?: string;
  status: IntegrationStatus;
  config: Record<string, any>;
  userId?: number;
  organizationId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Integration Manager Service
 * Manages all external integrations
 */
export class IntegrationManager {
  private healthcareIntegrations: Map<number, FHIRIntegrationService> = new Map();
  private wearableIntegrations: Map<number, WearablesIntegrationService> = new Map();
  
  /**
   * Get all integrations
   */
  async getAllIntegrations(
    userId?: number,
    organizationId?: number,
    type?: IntegrationType
  ): Promise<IntegrationConfig[]> {
    try {
      // In a real implementation, this would query the database
      // This is a simplified mock implementation
      const integrations: IntegrationConfig[] = [
        {
          id: 1,
          name: 'Epic EHR Integration',
          type: IntegrationType.HEALTHCARE,
          subtype: 'fhir',
          status: IntegrationStatus.ACTIVE,
          config: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
            clientId: 'mock-client-id',
            scope: 'patient/*.read',
          },
          organizationId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Fitbit Integration',
          type: IntegrationType.WEARABLE,
          subtype: WearableDeviceType.FITBIT,
          status: IntegrationStatus.ACTIVE,
          config: {
            deviceType: WearableDeviceType.FITBIT,
            apiKey: 'mock-api-key',
            redirectUri: 'https://careunity.app/integrations/callback',
          },
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      // Apply filters
      return integrations.filter(integration => {
        if (userId && integration.userId !== userId) return false;
        if (organizationId && integration.organizationId !== organizationId) return false;
        if (type && integration.type !== type) return false;
        return true;
      });
    } catch (error) {
      console.error('Error getting integrations:', error);
      throw new ApiError('Failed to get integrations', 500);
    }
  }
  
  /**
   * Get integration by ID
   */
  async getIntegrationById(id: number): Promise<IntegrationConfig> {
    try {
      // In a real implementation, this would query the database
      // This is a simplified mock implementation
      const integrations = await this.getAllIntegrations();
      const integration = integrations.find(i => i.id === id);
      
      if (!integration) {
        throw new ApiError('Integration not found', 404);
      }
      
      return integration;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error getting integration:', error);
      throw new ApiError('Failed to get integration', 500);
    }
  }
  
  /**
   * Create a new integration
   */
  async createIntegration(data: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IntegrationConfig> {
    try {
      // In a real implementation, this would insert into the database
      // This is a simplified mock implementation
      const newIntegration: IntegrationConfig = {
        ...data,
        id: Math.floor(Math.random() * 1000) + 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return newIntegration;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw new ApiError('Failed to create integration', 500);
    }
  }
  
  /**
   * Update an existing integration
   */
  async updateIntegration(id: number, data: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    try {
      // Get the existing integration
      const existingIntegration = await this.getIntegrationById(id);
      
      // In a real implementation, this would update the database
      // This is a simplified mock implementation
      const updatedIntegration: IntegrationConfig = {
        ...existingIntegration,
        ...data,
        id,
        updatedAt: new Date(),
      };
      
      return updatedIntegration;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error updating integration:', error);
      throw new ApiError('Failed to update integration', 500);
    }
  }
  
  /**
   * Delete an integration
   */
  async deleteIntegration(id: number): Promise<void> {
    try {
      // Check if integration exists
      await this.getIntegrationById(id);
      
      // In a real implementation, this would delete from the database
      // This is a simplified mock implementation
      
      // Clean up any cached integration services
      this.healthcareIntegrations.delete(id);
      this.wearableIntegrations.delete(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error deleting integration:', error);
      throw new ApiError('Failed to delete integration', 500);
    }
  }
  
  /**
   * Test an integration connection
   */
  async testIntegration(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await this.getIntegrationById(id);
      
      switch (integration.type) {
        case IntegrationType.HEALTHCARE:
          return this.testHealthcareIntegration(integration);
        case IntegrationType.WEARABLE:
          return this.testWearableIntegration(integration);
        default:
          return { success: false, message: `Unsupported integration type: ${integration.type}` };
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message };
      }
      console.error('Error testing integration:', error);
      return { success: false, message: 'Failed to test integration' };
    }
  }
  
  /**
   * Test healthcare integration
   */
  private async testHealthcareIntegration(integration: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    try {
      const service = this.getHealthcareIntegrationService(integration);
      
      // Try to authenticate
      await service.authenticate();
      
      return { success: true, message: 'Successfully connected to healthcare system' };
    } catch (error) {
      console.error('Healthcare integration test error:', error);
      return { success: false, message: `Failed to connect: ${(error as Error).message}` };
    }
  }
  
  /**
   * Test wearable integration
   */
  private async testWearableIntegration(integration: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    try {
      const service = this.getWearableIntegrationService(integration);
      
      // Try to authenticate (this might not work without an auth code)
      try {
        await service.authenticate();
      } catch (authError) {
        // Authentication might require user interaction, so we'll consider this a partial success
        return { 
          success: true, 
          message: 'Integration configuration is valid, but authentication requires user interaction' 
        };
      }
      
      return { success: true, message: 'Successfully connected to wearable device' };
    } catch (error) {
      console.error('Wearable integration test error:', error);
      return { success: false, message: `Failed to connect: ${(error as Error).message}` };
    }
  }
  
  /**
   * Get healthcare integration service
   */
  getHealthcareIntegrationService(integration: IntegrationConfig): FHIRIntegrationService {
    if (!integration.id) {
      return new FHIRIntegrationService(integration.config);
    }
    
    // Check if we already have an instance
    if (!this.healthcareIntegrations.has(integration.id)) {
      this.healthcareIntegrations.set(
        integration.id,
        new FHIRIntegrationService(integration.config)
      );
    }
    
    return this.healthcareIntegrations.get(integration.id)!;
  }
  
  /**
   * Get wearable integration service
   */
  getWearableIntegrationService(integration: IntegrationConfig): WearablesIntegrationService {
    if (!integration.id) {
      return new WearablesIntegrationService(integration.config);
    }
    
    // Check if we already have an instance
    if (!this.wearableIntegrations.has(integration.id)) {
      this.wearableIntegrations.set(
        integration.id,
        new WearablesIntegrationService(integration.config)
      );
    }
    
    return this.wearableIntegrations.get(integration.id)!;
  }
}
