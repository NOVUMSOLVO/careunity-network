// User related types
export enum UserRole {
  CAREGIVER = 'caregiver',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SERVICE_USER = 'serviceuser',
  FAMILY = 'family'
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
}

// Service User related types
export interface ServiceUser {
  id: number;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  emergencyContact: string;
  emergencyPhone: string;
  careNeeds: string[];
  preferredTimes?: string[];
  preferredCarers?: number[];
  notes?: string;
  status: 'active' | 'inactive' | 'pending';
  profileImage?: string;
}

// Care Plan related types
export interface CarePlan {
  id: number;
  serviceUserId: number;
  title: string;
  description?: string;
  startDate: string;
  reviewDate: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  goals: Goal[];
}

export interface Goal {
  id: number;
  carePlanId: number;
  title: string;
  description?: string;
  startDate: string;
  targetDate?: string;
  status: string;
  progressPercentage: number;
  tasks?: Task[];
}

export interface Task {
  id: number;
  goalId: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: number;
}

// Appointment related types
export interface Appointment {
  id: number;
  serviceUserId: number;
  caregiverId?: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  visitType: string;
}

// Note related types
export interface Note {
  id: number;
  serviceUserId: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  category: string;
  isPrivate: boolean;
}

// Risk Assessment related types
export interface RiskAssessment {
  id: number;
  serviceUserId: number;
  assessorId: number;
  title: string;
  description: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigationSteps: string[];
  reviewDate: string;
  status: 'active' | 'archived';
}

// Community Resource related types
export interface CommunityResource {
  id: number;
  name: string;
  description: string;
  category: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  locationId?: number;
  isFree: boolean;
  pricing?: string;
  fundingOptions?: string[];
  eligibilityCriteria?: Record<string, any>;
  languages?: string[];
  accessibilityFeatures?: string[];
  serviceArea?: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  reviewCount: number;
  lastUpdated: string;
}

// Authentication related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// AI Allocation related types
export interface AllocationRequest {
  serviceUserId: number;
  date: string;
  startTime: string;
  endTime: string;
  visitType: string;
  requiredSkills?: string[];
  preferredCarers?: number[];
}

export interface AllocationSuggestion {
  caregiverId: number;
  caregiverName: string;
  matchScore: number;
  reasonCodes: string[];
  availability: boolean;
  distance?: number;
  travelTime?: number;
}
