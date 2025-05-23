/**
 * Feedback types for the CareUnity application
 */

// Feedback category values
export const feedbackCategoryValues = [
  'general',
  'ui',
  'feature_request',
  'bug_report',
  'performance',
  'accessibility',
  'security',
  'data_quality',
  'ml_model',
  'other'
] as const;

// Feedback status values
export const feedbackStatusValues = [
  'new',
  'in_review',
  'planned',
  'in_progress',
  'completed',
  'declined',
  'duplicate'
] as const;

// Feedback priority values
export const feedbackPriorityValues = [
  'low',
  'medium',
  'high',
  'critical'
] as const;

// Feedback source values
export const feedbackSourceValues = [
  'in_app',
  'email',
  'support_ticket',
  'user_interview',
  'survey',
  'usability_test',
  'other'
] as const;

// Type definitions
export type FeedbackCategory = typeof feedbackCategoryValues[number];
export type FeedbackStatus = typeof feedbackStatusValues[number];
export type FeedbackPriority = typeof feedbackPriorityValues[number];
export type FeedbackSource = typeof feedbackSourceValues[number];

// Feedback interface
export interface Feedback {
  id: number;
  userId: number;
  category: FeedbackCategory;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  source: FeedbackSource;
  createdAt: string;
  updatedAt: string;
  assignedTo?: number;
  relatedFeature?: string;
  screenshots?: string[];
  tags?: string[];
  upvotes: number;
  parentId?: number;
  isPublic: boolean;
}

// Feedback submission interface
export interface FeedbackSubmission {
  category: FeedbackCategory;
  title: string;
  description: string;
  priority?: FeedbackPriority;
  source?: FeedbackSource;
  relatedFeature?: string;
  screenshots?: string[];
  tags?: string[];
  isPublic?: boolean;
}

// Feedback response interface
export interface FeedbackResponse {
  id: number;
  feedbackId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isOfficial: boolean;
}

// Feedback stats interface
export interface FeedbackStats {
  total: number;
  byCategory: Record<FeedbackCategory, number>;
  byStatus: Record<FeedbackStatus, number>;
  byPriority: Record<FeedbackPriority, number>;
  topRequested: {
    id: number;
    title: string;
    upvotes: number;
  }[];
  recentlyCompleted: {
    id: number;
    title: string;
    completedAt: string;
  }[];
}
