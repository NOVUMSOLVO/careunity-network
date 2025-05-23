import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../contexts/auth-context';

// Mock the API module
jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    changePassword: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { authApi } from '../../services/api';

describe('Auth Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with unauthenticated state', async () => {
    // Mock AsyncStorage to return no token
    AsyncStorage.getItem.mockResolvedValue(null);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for the useEffect to complete
    await waitForNextUpdate();

    // Check initial state
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should authenticate user on successful login', async () => {
    // Mock successful login response
    const mockUser = {
      id: 1,
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'care_worker',
    };

    authApi.login.mockResolvedValue({
      data: { token: 'test-token', user: mockUser },
      error: null,
    });

    AsyncStorage.setItem.mockResolvedValue(undefined);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial useEffect
    await waitForNextUpdate();

    // Perform login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    // Verify login was called with correct params
    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Verify token was stored
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    
    // Verify state was updated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle login errors', async () => {
    // Mock login error
    authApi.login.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial useEffect
    await waitForNextUpdate();

    // Perform login
    await act(async () => {
      await result.current.login('wrong@example.com', 'wrongpassword');
    });

    // Verify login was attempted
    expect(authApi.login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    
    // Verify token was not stored
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    
    // Verify state reflects error
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should log out user correctly', async () => {
    // Set up initial authenticated state
    AsyncStorage.getItem.mockResolvedValue('test-token');
    authApi.getCurrentUser.mockResolvedValue({
      data: {
        id: 1,
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'care_worker',
      },
      error: null,
    });

    authApi.logout.mockResolvedValue({ data: { success: true }, error: null });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial useEffect to complete (authenticated)
    await waitForNextUpdate();

    // Verify initial authenticated state
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();

    // Perform logout
    await act(async () => {
      await result.current.logout();
    });

    // Verify logout was called
    expect(authApi.logout).toHaveBeenCalled();
      // Verify token was removed
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
    
    // Verify state reflects logout
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
  
  it('should change password successfully', async () => {
    // Set up initial authenticated state
    AsyncStorage.getItem.mockResolvedValue('test-token');
    authApi.getCurrentUser.mockResolvedValue({
      data: {
        id: 1,
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'care_worker',
      },
      error: null,
    });
    
    // Mock successful password change
    authApi.changePassword.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial useEffect to complete (authenticated)
    await waitForNextUpdate();

    // Change password
    await act(async () => {
      await result.current.changePassword('oldPassword', 'newPassword');
    });

    // Verify changePassword was called with correct parameters
    expect(authApi.changePassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
    
    // Verify user remains authenticated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle password change errors', async () => {
    // Set up initial authenticated state
    AsyncStorage.getItem.mockResolvedValue('test-token');
    authApi.getCurrentUser.mockResolvedValue({
      data: {
        id: 1,
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'care_worker',
      },
      error: null,
    });
    
    // Mock failed password change
    authApi.changePassword.mockResolvedValue({
      data: null,
      error: { message: 'Current password is incorrect' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial useEffect to complete (authenticated)
    await waitForNextUpdate();

    // Attempt to change password
    await act(async () => {
      try {
        await result.current.changePassword('wrongPassword', 'newPassword');
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify changePassword was called
    expect(authApi.changePassword).toHaveBeenCalledWith('wrongPassword', 'newPassword');
    
    // Verify error is set
    expect(result.current.error).toBe('Current password is incorrect');
    
    // Verify user remains authenticated despite password change failure
    expect(result.current.isAuthenticated).toBe(true);
  });
});
