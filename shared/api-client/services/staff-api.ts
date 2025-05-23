/**
 * Staff API client
 */

import { ApiClient } from '../core';
import { 
  Staff, 
  CreateStaff, 
  UpdateStaff 
} from '../../types/staff';
import { ApiResponse } from '../../types/api';
import { PaginatedResponse, PaginationParams, SearchQuery } from '../../types/common';

/**
 * Staff API methods
 */
export class StaffApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/staff') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all staff members
   */
  async getAll(params?: PaginationParams): Promise<ApiResponse<Staff[]>> {
    return this.client.get<Staff[]>(this.baseUrl, { params: params as any });
  }
  
  /**
   * Get paginated staff members
   */
  async getPaginated(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Staff>>> {
    return this.client.get<PaginatedResponse<Staff>>(`${this.baseUrl}/paginated`, { params: params as any });
  }
  
  /**
   * Get a staff member by ID
   */
  async getById(id: number): Promise<ApiResponse<Staff>> {
    return this.client.get<Staff>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get staff members by role
   */
  async getByRole(role: string): Promise<ApiResponse<Staff[]>> {
    return this.client.get<Staff[]>(`${this.baseUrl}/role/${role}`);
  }
  
  /**
   * Create a new staff member
   */
  async create(data: CreateStaff): Promise<ApiResponse<Staff>> {
    return this.client.post<Staff>(this.baseUrl, data);
  }
  
  /**
   * Update a staff member
   */
  async update(id: number, data: UpdateStaff): Promise<ApiResponse<Staff>> {
    return this.client.patch<Staff>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Delete a staff member
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Search staff members
   */
  async search(query: string): Promise<ApiResponse<Staff[]>> {
    return this.client.get<Staff[]>(`${this.baseUrl}/search`, { params: { query } });
  }
}
