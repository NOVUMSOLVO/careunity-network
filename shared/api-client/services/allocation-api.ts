/**
 * Allocation API service
 * Provides methods for interacting with the allocation API endpoints
 */

import { ApiClient } from '../core';
import { ApiResponse, PaginationParams } from '../../types/api';
import { 
  Visit, 
  Caregiver, 
  AllocationRequest, 
  AllocationResult, 
  MLAllocationRequest, 
  MLAllocationResult,
  PredictVisitsRequest,
  VisitPrediction,
  WorkloadPrediction,
  AllocationExplanation
} from '../../types/allocation';

/**
 * Allocation API methods
 */
export class AllocationApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/allocation') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get unallocated visits
   */
  async getUnallocated(params?: { start?: string; end?: string }): Promise<ApiResponse<Visit[]>> {
    return this.client.get<Visit[]>(`${this.baseUrl}/unallocated`, { params: params as any });
  }
  
  /**
   * Get allocated visits
   */
  async getAllocated(params?: { start?: string; end?: string }): Promise<ApiResponse<Visit[]>> {
    return this.client.get<Visit[]>(`${this.baseUrl}/allocated`, { params: params as any });
  }
  
  /**
   * Get available caregivers
   */
  async getCaregivers(params?: { date?: string }): Promise<ApiResponse<Caregiver[]>> {
    return this.client.get<Caregiver[]>(`${this.baseUrl}/caregivers`, { params: params as any });
  }
  
  /**
   * Get allocation suggestions
   */
  async getSuggestions(visitIds: number[]): Promise<ApiResponse<Record<number, AllocationResult[]>>> {
    return this.client.post<Record<number, AllocationResult[]>>(`${this.baseUrl}/suggest`, { visitIds });
  }
  
  /**
   * Run allocation algorithm
   */
  async runAllocation(request: AllocationRequest): Promise<ApiResponse<AllocationResult[]>> {
    return this.client.post<AllocationResult[]>(`${this.baseUrl}/run`, request);
  }
  
  /**
   * Manually allocate a visit
   */
  async manualAllocate(visitId: number, caregiverId: number): Promise<ApiResponse<{ success: boolean; visitId: number; caregiverId: number }>> {
    return this.client.post<{ success: boolean; visitId: number; caregiverId: number }>(`${this.baseUrl}/manual`, { visitId, caregiverId });
  }
  
  /**
   * Calculate optimal routes for a caregiver
   */
  async calculateRoutes(caregiverId: number, date: string): Promise<ApiResponse<{
    caregiverId: number;
    date: string;
    startLocation: any;
    visits: any[];
    totalDistance: number;
    estimatedTravelTime: number;
  }>> {
    return this.client.post<any>(`${this.baseUrl}/routes`, { caregiverId, date });
  }
  
  /**
   * Get allocation metrics
   */
  async getMetrics(): Promise<ApiResponse<{
    totalVisits: number;
    allocatedVisits: number;
    unallocatedVisits: number;
    allocationRate: number;
  }>> {
    return this.client.get<any>(`${this.baseUrl}/metrics`);
  }
  
  /**
   * Predict future visits based on historical patterns
   */
  async predictVisits(request: PredictVisitsRequest): Promise<ApiResponse<VisitPrediction[]>> {
    return this.client.post<VisitPrediction[]>(`${this.baseUrl}/predict-visits`, request);
  }
  
  /**
   * Predict caregiver workload
   */
  async predictWorkload(request: PredictVisitsRequest): Promise<ApiResponse<WorkloadPrediction[]>> {
    return this.client.post<WorkloadPrediction[]>(`${this.baseUrl}/predict-workload`, request);
  }
  
  /**
   * Run ML-enhanced allocation algorithm
   */
  async runMlAllocation(request: MLAllocationRequest, autoAllocate: boolean = false): Promise<ApiResponse<MLAllocationResult[]>> {
    return this.client.post<MLAllocationResult[]>(
      `${this.baseUrl}/ml-allocation${autoAllocate ? '?autoAllocate=true' : ''}`, 
      request
    );
  }
  
  /**
   * Get AI explanations for allocation decisions
   */
  async getExplanation(visitId: number): Promise<ApiResponse<AllocationExplanation>> {
    return this.client.get<AllocationExplanation>(`${this.baseUrl}/explanations/${visitId}`);
  }
}
