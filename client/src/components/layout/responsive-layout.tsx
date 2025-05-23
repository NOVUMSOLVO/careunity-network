/**
 * Responsive Layout Component
 *
 * This component provides a responsive layout that adapts to different screen sizes.
 */

import React, { useState, useEffect } from 'react';
import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if the screen is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visible on desktop, hidden on mobile unless toggled */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Backdrop - only visible when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        {isMobile ? (
          <MobileHeader onOpenSidebar={toggleSidebar} />
        ) : (
          <DesktopHeader />
        )}

        {/* Main content area */}
        <main className={cn(
          "flex-1 overflow-y-auto p-4 lg:p-6",
          isMobile && "pb-20" // Add padding at the bottom for mobile navigation
        )}>
          {children}
        </main>

        {/* Mobile navigation */}
        {isMobile && <MobileNav />}

        {/* Feedback button */}
        <FeedbackButton position="bottom-right" />
      </div>
    </div>
  );
}
