/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from './offline-indicator';
import * as useOfflineHook from '@/hooks/use-offline'; // Import to mock

// Mock the useOffline hook
vi.mock('@/hooks/use-offline', () => ({
  useOffline: vi.fn(),
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('renders nothing when online and showOnlineStatus is false (default)', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(false);
    render(<OfflineIndicator />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Assuming the indicator has a role like status or alert
    // More specific check: query by text or test id if available, or check if container is empty
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "Online" badge when online and showOnlineStatus is true', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(false);
    render(<OfflineIndicator showOnlineStatus={true} variant="badge" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Online').closest('div')).toHaveClass('bg-green-100 text-green-800');
  });

  it('renders "Offline" badge when offline', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
    render(<OfflineIndicator variant="badge" />); // showOnlineStatus is irrelevant when offline
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Offline').closest('div')).toHaveClass('bg-red-100 text-red-800');
  });

  it('renders minimal "Online" icon when online, showOnlineStatus is true, and variant is minimal', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(false);
    render(<OfflineIndicator showOnlineStatus={true} variant="minimal" />);
    // Check for the presence of the Wifi icon (assuming it has a title or specific class if not directly text)
    // For Lucide icons, they are often SVGs. We can check the parent div's class.
    const { container } = render(<OfflineIndicator showOnlineStatus={true} variant="minimal" />);
    const iconDiv = container.querySelector('.flex.items-center');
    expect(iconDiv).toHaveClass('text-green-500');
    expect(iconDiv?.querySelector('svg')).toBeInTheDocument(); // Check if an SVG is rendered
  });

  it('renders minimal "Offline" icon when offline and variant is minimal', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
    render(<OfflineIndicator variant="minimal" />);
    const { container } = render(<OfflineIndicator variant="minimal" />);
    const iconDiv = container.querySelector('.flex.items-center');
    expect(iconDiv).toHaveClass('text-red-500');
    expect(iconDiv?.querySelector('svg')).toBeInTheDocument(); // Check if an SVG is rendered
  });

  it('renders "Online" banner when online, showOnlineStatus is true, and variant is banner', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(false);
    render(<OfflineIndicator showOnlineStatus={true} variant="banner" />);
    expect(screen.getByText(/You're back online/)).toBeInTheDocument();
    expect(screen.getByText(/You're back online/).closest('div')).toHaveClass('bg-green-500');
  });

  it('renders "Offline" banner when offline and variant is banner', () => {
    vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
    render(<OfflineIndicator variant="banner" />);
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
    expect(screen.getByText(/You're offline/).closest('div')).toHaveClass('bg-red-500');
  });

  // Test for OfflineWrapper (basic cases)
  describe('OfflineWrapper', () => {
    it('renders children when online', () => {
      vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(false);
      render(
        <OfflineIndicator.OfflineWrapper>
          <div>Online Content</div>
        </OfflineIndicator.OfflineWrapper>
      );
      expect(screen.getByText('Online Content')).toBeInTheDocument();
    });

    it('renders default fallback when offline and requiresOnline is true (default)', () => {
      vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
      render(
        <OfflineIndicator.OfflineWrapper>
          <div>Online Content</div>
        </OfflineIndicator.OfflineWrapper>
      );
      expect(screen.queryByText('Online Content')).not.toBeInTheDocument();
      expect(screen.getByText('This content requires an internet connection.')).toBeInTheDocument();
      expect(screen.getByText('You\'re offline')).toBeInTheDocument(); // Fallback title
    });

    it('renders custom fallback when offline and provided', () => {
      vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
      render(
        <OfflineIndicator.OfflineWrapper fallback={<div>Custom Fallback</div>}>
          <div>Online Content</div>
        </OfflineIndicator.OfflineWrapper>
      );
      expect(screen.queryByText('Online Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    });

    it('renders children when offline but requiresOnline is false', () => {
      vi.spyOn(useOfflineHook, 'useOffline').mockReturnValue(true);
      render(
        <OfflineIndicator.OfflineWrapper requiresOnline={false}>
          <div>Offline Available Content</div>
        </OfflineIndicator.OfflineWrapper>
      );
      expect(screen.getByText('Offline Available Content')).toBeInTheDocument();
    });
  });
});

// Add a simple export to make this a module if it isn't already
export {};
