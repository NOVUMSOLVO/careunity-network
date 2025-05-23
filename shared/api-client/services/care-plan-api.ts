/**
 * Care Plan API client
 */

import { ApiClient } from '../core';
import { 
  CarePlan, 
  CreateCarePlan, 
  UpdateCarePlan, 
  CarePlanWithGoalsAndTasks,
  Goal,
  CreateGoal,
  UpdateGoal,
  Task,
  CreateTask,
  UpdateTask
} from '../../types/care-plan';
import { ApiResponse } from '../../types/api';
import { PaginatedResponse, PaginationParams } from '../../types/common';

/**
 * Care Plan API methods
 */
export class CarePlanApi {
  private client: ApiClient;
  private baseUrl: string;
  
  constructor(client: ApiClient, baseUrl: string = '/api/care-plans') {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all care plans
   */
  async getAll(serviceUserId?: number, params?: PaginationParams): Promise<ApiResponse<CarePlan[]>> {
    const url = serviceUserId 
      ? `/api/service-users/${serviceUserId}/care-plans` 
      : this.baseUrl;
    return this.client.get<CarePlan[]>(url, { params: params as any });
  }
  
  /**
   * Get paginated care plans
   */
  async getPaginated(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<CarePlan>>> {
    return this.client.get<PaginatedResponse<CarePlan>>(`${this.baseUrl}/paginated`, { params: params as any });
  }
  
  /**
   * Get a care plan by ID
   */
  async getById(id: number): Promise<ApiResponse<CarePlan>> {
    return this.client.get<CarePlan>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get a care plan with its goals and tasks
   */
  async getWithGoalsAndTasks(id: number): Promise<ApiResponse<CarePlanWithGoalsAndTasks>> {
    return this.client.get<CarePlanWithGoalsAndTasks>(`${this.baseUrl}/${id}/with-goals-and-tasks`);
  }
  
  /**
   * Create a new care plan
   */
  async create(data: CreateCarePlan): Promise<ApiResponse<CarePlan>> {
    return this.client.post<CarePlan>(this.baseUrl, data);
  }
  
  /**
   * Update a care plan
   */
  async update(id: number, data: UpdateCarePlan): Promise<ApiResponse<CarePlan>> {
    return this.client.patch<CarePlan>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Delete a care plan
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Get all goals for a care plan
   */
  async getGoals(carePlanId: number): Promise<ApiResponse<Goal[]>> {
    return this.client.get<Goal[]>(`${this.baseUrl}/${carePlanId}/goals`);
  }
  
  /**
   * Create a new goal for a care plan
   */
  async createGoal(carePlanId: number, data: CreateGoal): Promise<ApiResponse<Goal>> {
    return this.client.post<Goal>(`${this.baseUrl}/${carePlanId}/goals`, data);
  }
  
  /**
   * Update a goal
   */
  async updateGoal(goalId: number, data: UpdateGoal): Promise<ApiResponse<Goal>> {
    return this.client.patch<Goal>(`/api/goals/${goalId}`, data);
  }
  
  /**
   * Delete a goal
   */
  async deleteGoal(goalId: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/api/goals/${goalId}`);
  }
  
  /**
   * Get all tasks for a goal
   */
  async getTasks(goalId: number): Promise<ApiResponse<Task[]>> {
    return this.client.get<Task[]>(`/api/goals/${goalId}/tasks`);
  }
  
  /**
   * Create a new task for a goal
   */
  async createTask(goalId: number, data: CreateTask): Promise<ApiResponse<Task>> {
    return this.client.post<Task>(`/api/goals/${goalId}/tasks`, data);
  }
  
  /**
   * Update a task
   */
  async updateTask(taskId: number, data: UpdateTask): Promise<ApiResponse<Task>> {
    return this.client.patch<Task>(`/api/tasks/${taskId}`, data);
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/api/tasks/${taskId}`);
  }
  
  /**
   * Complete a task
   */
  async completeTask(taskId: number): Promise<ApiResponse<Task>> {
    return this.client.post<Task>(`/api/tasks/${taskId}/complete`, {});
  }
}
