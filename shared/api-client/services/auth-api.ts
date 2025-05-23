/**
 * Authentication API client
 */

import { ApiClient } from '../core';
import { 
  LoginCredentials, 
  RegistrationData, 
  User, 
  AuthResponse 
} from '../../types/auth';
import { ApiResponse } from '../../types/api';

/**
 * Authentication API methods
 */
export class AuthApi {
  private client: ApiClient;
  
  constructor(client: ApiClient) {
    this.client = client;
  }
  
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.client.post<AuthResponse>('/api/auth/login', credentials);
  }
  
  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<ApiResponse<AuthResponse>> {
    return this.client.post<AuthResponse>('/api/auth/register', data);
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.client.post<void>('/api/auth/logout');
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.client.get<User>('/api/auth/me');
  }
  
  /**
   * Request a password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return this.client.post<void>('/api/auth/request-password-reset', { email });
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.post<void>('/api/auth/reset-password', { token, newPassword });
  }
}
