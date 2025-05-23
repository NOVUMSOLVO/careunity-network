/**
 * Shared API types
 */

import { z } from 'zod';

/**
 * API error codes
 */
export const apiErrorCodeEnum = [
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'validation_error',
  'internal_error',
] as const;

/**
 * API error schema
 */
export const apiErrorSchema = z.object({
  error: z.enum(apiErrorCodeEnum),
  message: z.string(),
  details: z.any().optional(),
});

/**
 * API error type
 */
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * API response schema
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: apiErrorSchema.nullable(),
    status: z.number(),
  });

/**
 * API response type
 */
export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  status: number;
};

/**
 * API client options
 */
export interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  onUnauthorized?: () => void;
  onError?: (error: ApiError) => void;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
}

/**
 * API adapter interface
 */
export interface ApiAdapter {
  request<T>(
    method: string,
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;
}
