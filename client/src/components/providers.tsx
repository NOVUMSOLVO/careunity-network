import React, { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the application with all necessary providers
 * Simplified for troubleshooting
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <div className="providers">
      {children}
    </div>
  );
}