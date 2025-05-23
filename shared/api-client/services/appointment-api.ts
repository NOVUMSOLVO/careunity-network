/**
 * Appointment API client
 */

import { ApiClient } from '../core';
import { 
  Appointment, 
  CreateAppointment, 
  UpdateAppointment 
} from '../../types/appointment';
import { ApiResponse } from '../../types/api';
import { PaginatedResponse, PaginationParams } from '../../types/common';

/**
 * Appointment API methods
 */
export class AppointmentApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/appointments') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all appointments
   */
  async getAll(params?: PaginationParams): Promise<ApiResponse<Appointment[]>> {
    return this.client.get<Appointment[]>(this.baseUrl, { params: params as any });
  }
  
  /**
   * Get paginated appointments
   */
  async getPaginated(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return this.client.get<PaginatedResponse<Appointment>>(`${this.baseUrl}/paginated`, { params: params as any });
  }
  
  /**
   * Get an appointment by ID
   */
  async getById(id: number): Promise<ApiResponse<Appointment>> {
    return this.client.get<Appointment>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get appointments by service user ID
   */
  async getByServiceUser(serviceUserId: number): Promise<ApiResponse<Appointment[]>> {
    return this.client.get<Appointment[]>(`${this.baseUrl}/service-user/${serviceUserId}`);
  }
  
  /**
   * Get appointments by caregiver ID
   */
  async getByCaregiver(caregiverId: number): Promise<ApiResponse<Appointment[]>> {
    return this.client.get<Appointment[]>(`${this.baseUrl}/caregiver/${caregiverId}`);
  }
  
  /**
   * Create a new appointment
   */
  async create(data: CreateAppointment): Promise<ApiResponse<Appointment>> {
    return this.client.post<Appointment>(this.baseUrl, data);
  }
  
  /**
   * Update an appointment
   */
  async update(id: number, data: UpdateAppointment): Promise<ApiResponse<Appointment>> {
    return this.client.patch<Appointment>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Delete an appointment
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Update appointment status
   */
  async updateStatus(id: number, status: string): Promise<ApiResponse<Appointment>> {
    return this.client.patch<Appointment>(`${this.baseUrl}/${id}/status`, { status });
  }
}
