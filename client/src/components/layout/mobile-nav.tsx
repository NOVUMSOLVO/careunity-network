import React from 'react';
import { useLocation, Link } from 'wouter';
import {
  BarChart3,
  Users,
  ClipboardList,
  Calendar,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [location] = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', icon: <BarChart3 className="text-lg" />, id: 'dashboard', path: '/' },
    { name: 'Care Coord.', icon: <CheckCircle className="text-lg" />, id: 'coordinator-dashboard', path: '/coordinator-dashboard' },
    { name: 'Service Users', icon: <Users className="text-lg" />, id: 'service-users', path: '/service-users' },
    { name: 'Care Plans', icon: <ClipboardList className="text-lg" />, id: 'care-plans', path: '/care-plans' },
    { name: 'More', icon: <MoreHorizontal className="text-lg" />, id: 'more', path: '/more' }
  ];
  
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-10">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = location === item.path || 
                         (item.path !== '/' && location.startsWith(item.path));
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
