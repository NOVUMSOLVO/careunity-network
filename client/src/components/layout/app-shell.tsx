import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { MobileHeader } from './mobile-header';
import { DesktopHeader } from './desktop-header';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 flex z-40 lg:hidden
        ${sidebarOpen ? 'visible' : 'invisible'}
        transition-visibility ease-linear duration-300
      `}>
        {/* Overlay */}
        <div 
          className={`
            fixed inset-0 bg-gray-600 bg-opacity-75
            ${sidebarOpen ? 'opacity-100' : 'opacity-0'}
            transition-opacity ease-linear duration-300
          `}
          onClick={closeSidebar}
        />
        
        {/* Sidebar */}
        <div className={`
          relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition ease-in-out duration-300 transform
        `}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Sidebar />
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {isMobile ? (
          <MobileHeader onOpenSidebar={openSidebar} />
        ) : (
          <DesktopHeader />
        )}
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}