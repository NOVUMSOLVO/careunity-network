import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { VoiceCommandButton } from '@/components/voice/voice-command-button';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string | null;
  // Add any other user fields you need
}

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

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
          <div className="mr-2">
            <VoiceCommandButton />
          </div>
          <div className="mr-2">
            <NotificationCenter />
          </div>

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
