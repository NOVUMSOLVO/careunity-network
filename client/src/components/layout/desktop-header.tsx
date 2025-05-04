import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function DesktopHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Generate initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'NA';
    
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <div className="relative z-10 flex-shrink-0 h-16 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5 ml-3 text-gray-400" />
              </div>
              <Input 
                id="search-field" 
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm bg-gray-50 dark:bg-gray-700 rounded-md" 
                placeholder="Search" 
                type="search" 
                name="search"
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>

          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full text-gray-500 dark:text-gray-300 flex items-center">
            <Link href="/profile">
              <Button
                variant="ghost"
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">Open user menu</span>
                <AvatarWithStatus
                  src={user?.profileImage || ''}
                  alt={user?.fullName || 'User'}
                  fallback={initials}
                  size="md"
                />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
