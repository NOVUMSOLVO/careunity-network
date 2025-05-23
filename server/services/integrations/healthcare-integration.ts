/**
 * Healthcare Integration Service
 * 
 * Provides integration with healthcare systems using HL7/FHIR standards
 */

import axios from 'axios';
import { ApiError } from '../../utils/api-error';

// FHIR resource types
type FHIRResourceType = 
  | 'Patient'
  | 'Practitioner'
  | 'Organization'
  | 'Observation'
  | 'Condition'
  | 'MedicationRequest'
  | 'Appointment'
  | 'CarePlan';

// FHIR integration configuration
interface FHIRConfig {
  baseUrl: string;
  authToken?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}

/**
 * FHIR Integration Service
 * Handles communication with FHIR-compliant healthcare systems
 */
export class FHIRIntegrationService {
  private config: FHIRConfig;
  private authToken?: string;
  
  constructor(config: FHIRConfig) {
    this.config = config;
    this.authToken = config.authToken;
  }
  
  /**
   * Authenticate with the FHIR server using OAuth2
   */
  async authenticate(): Promise<string> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new ApiError('FHIR client credentials not configured', 500);
    }
    
    try {
      const tokenUrl = `${this.config.baseUrl}/token`;
      const response = await axios.post(tokenUrl, {
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: this.config.scope || 'patient/*.read',
      });
      
      this.authToken = response.data.access_token;
      return this.authToken;
    } catch (error) {
      console.error('FHIR authentication error:', error);
      throw new ApiError('Failed to authenticate with FHIR server', 500);
    }
  }
  
  /**
   * Get authorization headers for FHIR requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.authToken) {
      await this.authenticate();
    }
    
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };
  }
  
  /**
   * Search for FHIR resources
   */
  async search<T>(
    resourceType: FHIRResourceType,
    params: Record<string, string>
  ): Promise<T[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.config.baseUrl}/${resourceType}`;
      
      const response = await axios.get(url, {
        headers,
        params,
      });
      
      return response.data.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error(`FHIR search error for ${resourceType}:`, error);
      throw new ApiError(`Failed to search ${resourceType} resources`, 500);
    }
  }
  
  /**
   * Get a specific FHIR resource by ID
   */
  async getResource<T>(resourceType: FHIRResourceType, id: string): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.config.baseUrl}/${resourceType}/${id}`;
      
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(`FHIR get resource error for ${resourceType}/${id}:`, error);
      throw new ApiError(`Failed to get ${resourceType} resource`, 500);
    }
  }
  
  /**
   * Create a new FHIR resource
   */
  async createResource<T>(resourceType: FHIRResourceType, data: any): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.config.baseUrl}/${resourceType}`;
      
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`FHIR create resource error for ${resourceType}:`, error);
      throw new ApiError(`Failed to create ${resourceType} resource`, 500);
    }
  }
  
  /**
   * Update an existing FHIR resource
   */
  async updateResource<T>(resourceType: FHIRResourceType, id: string, data: any): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.config.baseUrl}/${resourceType}/${id}`;
      
      const response = await axios.put(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`FHIR update resource error for ${resourceType}/${id}:`, error);
      throw new ApiError(`Failed to update ${resourceType} resource`, 500);
    }
  }
  
  /**
   * Delete a FHIR resource
   */
  async deleteResource(resourceType: FHIRResourceType, id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.config.baseUrl}/${resourceType}/${id}`;
      
      await axios.delete(url, { headers });
    } catch (error) {
      console.error(`FHIR delete resource error for ${resourceType}/${id}:`, error);
      throw new ApiError(`Failed to delete ${resourceType} resource`, 500);
    }
  }
  
  /**
   * Get patient data by ID
   */
  async getPatient(id: string): Promise<any> {
    return this.getResource<any>('Patient', id);
  }
  
  /**
   * Search for patients by name
   */
  async searchPatientsByName(name: string): Promise<any[]> {
    return this.search<any>('Patient', { name });
  }
  
  /**
   * Get patient's conditions
   */
  async getPatientConditions(patientId: string): Promise<any[]> {
    return this.search<any>('Condition', { patient: patientId });
  }
  
  /**
   * Get patient's medications
   */
  async getPatientMedications(patientId: string): Promise<any[]> {
    return this.search<any>('MedicationRequest', { patient: patientId });
  }
  
  /**
   * Get patient's care plans
   */
  async getPatientCarePlans(patientId: string): Promise<any[]> {
    return this.search<any>('CarePlan', { patient: patientId });
  }
  
  /**
   * Get patient's appointments
   */
  async getPatientAppointments(patientId: string): Promise<any[]> {
    return this.search<any>('Appointment', { patient: patientId });
  }
  
  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: any): Promise<any> {
    return this.createResource<any>('Appointment', appointmentData);
  }
  
  /**
   * Create a new observation (e.g., vital signs)
   */
  async createObservation(observationData: any): Promise<any> {
    return this.createResource<any>('Observation', observationData);
  }
}
