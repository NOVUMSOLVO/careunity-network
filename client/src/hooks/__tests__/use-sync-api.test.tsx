/**
 * Unit tests for the useSyncApi hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useSyncApi } from '../../hooks/use-sync-api';
import { SyncProvider } from '../../contexts/sync-context';
import { apiClient } from '../../lib/api-client';

// Mock SyncContext
vi.mock('../../contexts/sync-context', () => {
  const actual = vi.importActual('../../contexts/sync-context');
  return {
    ...actual,
    useSync: () => ({
      isOnline: true,
      queueOperation: vi.fn().mockResolvedValue('test-operation-id'),
    }),
  };
});

// Mock apiClient
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Test component that uses the useSyncApi hook
function TestComponent() {
  const { get, post, put, patch, delete: del, isLoading, error } = useSyncApi();
  
  const handleGet = () => {
    get('/api/test');
  };
  
  const handlePost = () => {
    post('/api/test', { test: 'data' });
  };
  
  const handlePut = () => {
    put('/api/test/1', { test: 'data' }, {}, 'test', '1');
  };
  
  const handlePatch = () => {
    patch('/api/test/1', { test: 'data' }, {}, 'test', '1');
  };
  
  const handleDelete = () => {
    del('/api/test/1', {}, 'test', '1');
  };
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error ? error.message : 'No Error'}</div>
      
      <button data-testid="get-button" onClick={handleGet}>
        Get
      </button>
      
      <button data-testid="post-button" onClick={handlePost}>
        Post
      </button>
      
      <button data-testid="put-button" onClick={handlePut}>
        Put
      </button>
      
      <button data-testid="patch-button" onClick={handlePatch}>
        Patch
      </button>
      
      <button data-testid="delete-button" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}

describe('useSyncApi', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock apiClient methods
    apiClient.get.mockResolvedValue({ data: { test: 'get' }, error: null });
    apiClient.post.mockResolvedValue({ data: { test: 'post' }, error: null });
    apiClient.put.mockResolvedValue({ data: { test: 'put' }, error: null });
    apiClient.patch.mockResolvedValue({ data: { test: 'patch' }, error: null });
    apiClient.delete.mockResolvedValue({ data: { test: 'delete' }, error: null });
  });
  
  // Test GET request
  it('should make a GET request', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the get button
    fireEvent.click(screen.getByTestId('get-button'));
    
    // Check that apiClient.get was called
    expect(apiClient.get).toHaveBeenCalledWith('/api/test', {});
    
    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
  
  // Test POST request
  it('should make a POST request when online', async () => {
    // Mock useSync to return isOnline: true
    vi.mocked(useSyncApi).mockReturnValue({
      isOnline: true,
      queueOperation: vi.fn().mockResolvedValue('test-operation-id'),
    });
    
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the post button
    fireEvent.click(screen.getByTestId('post-button'));
    
    // Check that apiClient.post was called
    expect(apiClient.post).toHaveBeenCalledWith('/api/test', { test: 'data' }, {});
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
  
  // Test PUT request
  it('should make a PUT request when online', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the put button
    fireEvent.click(screen.getByTestId('put-button'));
    
    // Check that apiClient.put was called
    expect(apiClient.put).toHaveBeenCalledWith('/api/test/1', { test: 'data' }, {});
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
  
  // Test PATCH request
  it('should make a PATCH request when online', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the patch button
    fireEvent.click(screen.getByTestId('patch-button'));
    
    // Check that apiClient.patch was called
    expect(apiClient.patch).toHaveBeenCalledWith('/api/test/1', { test: 'data' }, {});
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
  
  // Test DELETE request
  it('should make a DELETE request when online', async () => {
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Check that apiClient.delete was called
    expect(apiClient.delete).toHaveBeenCalledWith('/api/test/1', {});
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
  
  // Test error handling
  it('should handle errors', async () => {
    // Mock apiClient.get to return an error
    apiClient.get.mockResolvedValue({
      data: null,
      error: { message: 'Test error' },
    });
    
    render(
      <SyncProvider>
        <TestComponent />
      </SyncProvider>
    );
    
    // Click the get button
    fireEvent.click(screen.getByTestId('get-button'));
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('error')).toHaveTextContent('Test error');
    });
  });
});
