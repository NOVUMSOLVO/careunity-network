import axios from 'axios';
import { 
  User, 
  ServiceUser, 
  CarePlan, 
  Appointment, 
  Note, 
  RiskAssessment, 
  CommunityResource,
  LoginCredentials,
  AuthResponse,
  AllocationRequest,
  AllocationSuggestion
} from '../types';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Users API calls
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },
  update: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Service Users API calls
export const serviceUsersApi = {
  getAll: async (): Promise<ServiceUser[]> => {
    const response = await api.get<ServiceUser[]>('/service-users');
    return response.data;
  },
  getById: async (id: number): Promise<ServiceUser> => {
    const response = await api.get<ServiceUser>(`/service-users/${id}`);
    return response.data;
  },
  create: async (userData: Partial<ServiceUser>): Promise<ServiceUser> => {
    const response = await api.post<ServiceUser>('/service-users', userData);
    return response.data;
  },
  update: async (id: number, userData: Partial<ServiceUser>): Promise<ServiceUser> => {
    const response = await api.put<ServiceUser>(`/service-users/${id}`, userData);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/service-users/${id}`);
  },
};

// Care Plans API calls
export const carePlansApi = {
  getAll: async (): Promise<CarePlan[]> => {
    const response = await api.get<CarePlan[]>('/care-plans');
    return response.data;
  },
  getById: async (id: number): Promise<CarePlan> => {
    const response = await api.get<CarePlan>(`/care-plans/${id}`);
    return response.data;
  },
  getByServiceUser: async (serviceUserId: number): Promise<CarePlan[]> => {
    const response = await api.get<CarePlan[]>(`/service-users/${serviceUserId}/care-plans`);
    return response.data;
  },
  create: async (carePlanData: Partial<CarePlan>): Promise<CarePlan> => {
    const response = await api.post<CarePlan>('/care-plans', carePlanData);
    return response.data;
  },
  update: async (id: number, carePlanData: Partial<CarePlan>): Promise<CarePlan> => {
    const response = await api.put<CarePlan>(`/care-plans/${id}`, carePlanData);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/care-plans/${id}`);
  },
};

// Appointments API calls
export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },
  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },
  getByServiceUser: async (serviceUserId: number): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/service-users/${serviceUserId}/appointments`);
    return response.data;
  },
  getByCaregiver: async (caregiverId: number): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/users/${caregiverId}/appointments`);
    return response.data;
  },
  create: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', appointmentData);
    return response.data;
  },
  update: async (id: number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};

// AI Allocation API calls
export const allocationApi = {
  getSuggestions: async (request: AllocationRequest): Promise<AllocationSuggestion[]> => {
    const response = await api.post<AllocationSuggestion[]>('/allocation/suggestions', request);
    return response.data;
  },
  allocate: async (appointmentId: number, caregiverId: number): Promise<Appointment> => {
    const response = await api.post<Appointment>(`/allocation/allocate`, { appointmentId, caregiverId });
    return response.data;
  },
  optimizeRoute: async (caregiverId: number, date: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/allocation/optimize-route/${caregiverId}?date=${date}`);
    return response.data;
  }
};

export default api;
