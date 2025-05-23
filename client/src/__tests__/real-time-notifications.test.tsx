/**
 * Real-time Notifications Tests
 * 
 * This file contains tests for the real-time notifications component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RealTimeNotifications, { NotificationType } from '../components/notifications/real-time-notifications';
import { useWebSocket } from '../contexts/websocket-context';
import { useOffline } from '../contexts/offline-context';

// Mock the WebSocket context
jest.mock('../contexts/websocket-context', () => {
  const originalModule = jest.requireActual('../contexts/websocket-context');
  
  return {
    ...originalModule,
    useWebSocket: jest.fn(),
  };
});

// Mock the Offline context
jest.mock('../contexts/offline-context', () => {
  const originalModule = jest.requireActual('../contexts/offline-context');
  
  return {
    ...originalModule,
    useOffline: jest.fn(),
  };
});

describe('RealTimeNotifications', () => {
  // Mock subscribe function
  const mockSubscribe = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useWebSocket to return connected status
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: null,
    });
    
    // Mock useOffline to return online status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
    });
    
    // Mock Notification API
    global.Notification = jest.fn() as any;
    global.Notification.permission = 'granted';
    global.Notification.requestPermission = jest.fn().mockResolvedValue('granted');
    
    // Mock document.visibilityState
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });
  
  test('should render notification toggle button', () => {
    render(<RealTimeNotifications />);
    
    expect(screen.getByRole('button', { name: /🔔/ })).toBeInTheDocument();
  });
  
  test('should subscribe to notifications channel when connected', () => {
    render(<RealTimeNotifications />);
    
    expect(mockSubscribe).toHaveBeenCalledWith('notifications', expect.any(Function));
  });
  
  test('should not subscribe to notifications channel when offline', () => {
    // Mock useOffline to return offline status
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
    });
    
    render(<RealTimeNotifications />);
    
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
  
  test('should not subscribe to notifications channel when disconnected', () => {
    // Mock useWebSocket to return disconnected status
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: false,
      subscribe: mockSubscribe,
      lastMessage: null,
    });
    
    render(<RealTimeNotifications />);
    
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
  
  test('should show notification panel when toggle button is clicked', () => {
    render(<RealTimeNotifications />);
    
    // Click the toggle button
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Check if notification panel is shown
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });
  
  test('should handle new notification from WebSocket', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications />);
    
    // Click the toggle button to show notifications
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Check if notification is shown
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification')).toBeInTheDocument();
  });
  
  test('should show unread count badge', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications showUnreadCount={true} />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications showUnreadCount={true} />);
    
    // Check if unread count badge is shown
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  test('should mark notification as read when clicked', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications />);
    
    // Click the toggle button to show notifications
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Click the notification
    fireEvent.click(screen.getByText('Test Notification'));
    
    // Check if unread count badge is not shown
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
  
  test('should remove notification when close button is clicked', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications />);
    
    // Click the toggle button to show notifications
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Click the close button
    fireEvent.click(screen.getByText('×'));
    
    // Check if notification is removed
    expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });
  
  test('should mark all notifications as read when "Mark all as read" button is clicked', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications />);
    
    // Click the toggle button to show notifications
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Click the "Mark all as read" button
    fireEvent.click(screen.getByText('Mark all as read'));
    
    // Check if unread count badge is not shown
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
  
  test('should clear all notifications when "Clear all" button is clicked', () => {
    // Render component
    const { rerender } = render(<RealTimeNotifications />);
    
    // Mock lastMessage with a notification
    (useWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      lastMessage: {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test notification',
          type: NotificationType.INFO,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Re-render component with new props
    rerender(<RealTimeNotifications />);
    
    // Click the toggle button to show notifications
    fireEvent.click(screen.getByRole('button', { name: /🔔/ }));
    
    // Click the "Clear all" button
    fireEvent.click(screen.getByText('Clear all'));
    
    // Check if all notifications are removed
    expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });
});
