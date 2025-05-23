/**
 * Service User API client
 */

import { ApiClient } from '../core';
import { 
  ServiceUser, 
  CreateServiceUser, 
  UpdateServiceUser, 
  ServiceUserWithCarePlans 
} from '../../types/service-user';
import { ApiResponse } from '../../types/api';
import { PaginatedResponse, PaginationParams, SearchQuery } from '../../types/common';

/**
 * Service User API methods
 */
export class ServiceUserApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/service-users') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all service users
   */
  async getAll(params?: PaginationParams): Promise<ApiResponse<ServiceUser[]>> {
    return this.client.get<ServiceUser[]>(this.baseUrl, { params: params as any });
  }
  
  /**
   * Get paginated service users
   */
  async getPaginated(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ServiceUser>>> {
    return this.client.get<PaginatedResponse<ServiceUser>>(`${this.baseUrl}/paginated`, { params: params as any });
  }
  
  /**
   * Get a service user by ID
   */
  async getById(id: number): Promise<ApiResponse<ServiceUser>> {
    return this.client.get<ServiceUser>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get a service user with their care plans
   */
  async getWithCarePlans(id: number): Promise<ApiResponse<ServiceUserWithCarePlans>> {
    return this.client.get<ServiceUserWithCarePlans>(`${this.baseUrl}/${id}/with-care-plans`);
  }
  
  /**
   * Create a new service user
   */
  async create(data: CreateServiceUser): Promise<ApiResponse<ServiceUser>> {
    return this.client.post<ServiceUser>(this.baseUrl, data);
  }
  
  /**
   * Update a service user
   */
  async update(id: number, data: UpdateServiceUser): Promise<ApiResponse<ServiceUser>> {
    return this.client.patch<ServiceUser>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Delete a service user
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Search service users
   */
  async search(query: string): Promise<ApiResponse<ServiceUser[]>> {
    return this.client.get<ServiceUser[]>(`${this.baseUrl}/search`, { params: { query } });
  }
}
