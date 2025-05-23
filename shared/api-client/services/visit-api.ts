/**
 * Visit API service
 * Provides methods for interacting with the visits API endpoints
 */

import { ApiClient } from '../core';
import { ApiResponse, PaginationParams } from '../../types/api';

// Visit status type
export type VisitStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'missed';

// Visit priority type
export type VisitPriority = 'low' | 'normal' | 'high';

// Visit type
export interface Visit {
  id: number;
  serviceUserId: number;
  caregiverId?: number;
  date: string;
  startTime: string;
  endTime: string;
  status: VisitStatus;
  notes?: string;
  tasks?: string;
  priority: VisitPriority;
  visitType: string;
  completedAt?: string;
  completedBy?: number;
  feedback?: string;
  feedbackRating?: number;
  serviceUser?: {
    id: number;
    fullName: string;
  };
  caregiver?: {
    id: number;
    fullName: string;
  };
}

// Create visit request
export interface CreateVisitRequest {
  serviceUserId: number;
  caregiverId?: number;
  date: string;
  startTime: string;
  endTime: string;
  status?: VisitStatus;
  notes?: string;
  tasks?: string;
  priority?: VisitPriority;
  visitType: string;
}

// Update visit request
export interface UpdateVisitRequest {
  caregiverId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: VisitStatus;
  notes?: string;
  tasks?: string;
  priority?: VisitPriority;
  visitType?: string;
}

// Complete visit request
export interface CompleteVisitRequest {
  notes?: string;
  feedback?: string;
  feedbackRating?: number;
}

// Cancel visit request
export interface CancelVisitRequest {
  reason: string;
}

// Visit query params
export interface VisitQueryParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  caregiverId?: number;
  serviceUserId?: number;
  status?: VisitStatus;
  visitType?: string;
}

/**
 * Visit API methods
 */
export class VisitApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/visits') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all visits
   */
  async getAll(params?: VisitQueryParams): Promise<ApiResponse<Visit[]>> {
    return this.client.get<Visit[]>(this.baseUrl, { params: params as any });
  }
  
  /**
   * Get a visit by ID
   */
  async getById(id: number): Promise<ApiResponse<Visit>> {
    return this.client.get<Visit>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Create a new visit
   */
  async create(data: CreateVisitRequest): Promise<ApiResponse<Visit>> {
    return this.client.post<Visit>(this.baseUrl, data);
  }
  
  /**
   * Update a visit
   */
  async update(id: number, data: UpdateVisitRequest): Promise<ApiResponse<Visit>> {
    return this.client.put<Visit>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Complete a visit
   */
  async complete(id: number, data: CompleteVisitRequest): Promise<ApiResponse<Visit>> {
    return this.client.post<Visit>(`${this.baseUrl}/${id}/complete`, data);
  }
  
  /**
   * Cancel a visit
   */
  async cancel(id: number, reason: string): Promise<ApiResponse<Visit>> {
    return this.client.post<Visit>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
  
  /**
   * Get visits for a service user
   */
  async getForServiceUser(serviceUserId: number, params?: { date?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Visit[]>> {
    return this.client.get<Visit[]>(this.baseUrl, { 
      params: { 
        serviceUserId,
        ...params
      } as any 
    });
  }
  
  /**
   * Get visits for a caregiver
   */
  async getForCaregiver(caregiverId: number, params?: { date?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Visit[]>> {
    return this.client.get<Visit[]>(this.baseUrl, { 
      params: { 
        caregiverId,
        ...params
      } as any 
    });
  }
}
