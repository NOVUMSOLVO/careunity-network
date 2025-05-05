import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  MessageSquare,
  LogOut,
  CheckCircle,
  CalendarClock,
  AlertTriangle,
  Briefcase,
  Home,
  Map,
  Navigation,
  Heart,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string | null;
  // Add any other user fields you need
}

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  id: string;
  path: string;
}

export function Sidebar() {
  const [location] = useLocation();
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
  
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: <BarChart3 className="h-5 w-5" />, id: 'dashboard', path: '/' },
    { name: 'Service Users', icon: <Users className="h-5 w-5" />, id: 'service-users', path: '/service-users' },
    { name: 'Care Plans', icon: <ClipboardList className="h-5 w-5" />, id: 'care-plans', path: '/care-plans' },
    { name: 'Calendar', icon: <Calendar className="h-5 w-5" />, id: 'calendar', path: '/calendar' },
    { name: 'Care Allocation', icon: <CalendarClock className="h-5 w-5" />, id: 'care-allocation', path: '/care-allocation' },
    { name: 'Staff Management', icon: <Briefcase className="h-5 w-5" />, id: 'staff-management', path: '/staff-management' },
    { name: 'RBAC Management', icon: <ShieldCheck className="h-5 w-5" />, id: 'rbac-management', path: '/rbac-management' },
    { name: 'Permissions', icon: <Lock className="h-5 w-5" />, id: 'permissions-management', path: '/permissions-management' },
    { name: 'Route Optimizer', icon: <Navigation className="h-5 w-5" />, id: 'route-optimizer', path: '/route-optimizer' },
    { name: 'Family Portal', icon: <Heart className="h-5 w-5" />, id: 'family-portal', path: '/family-portal' },
    { name: 'Incident Reporting', icon: <AlertTriangle className="h-5 w-5" />, id: 'incident-reporting', path: '/incident-reporting' },
    { name: 'Reports', icon: <FileText className="h-5 w-5" />, id: 'reports', path: '/reports' },
    { name: 'Messages', icon: <MessageSquare className="h-5 w-5" />, id: 'messages', path: '/messages' },
    { name: 'CQC Compliance', icon: <CheckCircle className="h-5 w-5" />, id: 'cqc-compliance', path: '/cqc-compliance' }
  ];

  const handleLogout = () => {
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    })
    .then(response => {
      if (response.ok) {
        // Redirect to login page
        window.location.href = '/auth';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
  };

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
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Logo and app name */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600 dark:bg-primary-800">
        <div className="rounded-full bg-white p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="ml-2 text-xl font-semibold text-white">CareUnity</span>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.path || 
                           (item.path !== '/' && location.startsWith(item.path));
            
            return (
              <Link
                key={item.id}
                href={item.path}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-colors duration-150 ease-in-out',
                  isActive 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100 border-primary-500' 
                    : 'text-gray-600 border-transparent dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <span className={cn(
                  'mr-3 text-lg',
                  isActive
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-500'
                )}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User profile area */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group">
          <div className="flex items-center">
            <AvatarWithStatus
              src={user?.profileImage || ''}
              alt={user?.fullName || 'User'}
              fallback={initials}
              size="md"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Guest'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="ml-2 text-gray-400 hover:text-gray-500"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
