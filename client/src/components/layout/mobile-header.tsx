import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  const { user } = useAuth();
  
  // Generate initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'NA';
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpenSidebar} 
          className="text-gray-500 focus:outline-none focus:text-gray-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center">
          <div className="rounded-full bg-primary-600 p-1 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-primary-600 font-semibold text-lg">CareUnity</span>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 focus:outline-none focus:text-gray-700 mr-4"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Link href="/profile">
            <AvatarWithStatus
              src={user?.profileImage || ''}
              alt={user?.fullName || 'User'}
              fallback={initials}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
