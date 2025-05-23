import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  BarChart3,
  Users,
  ClipboardList,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  MessageSquarePlus,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-mobile';

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  id: string;
  path: string;
  badge?: number | string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function MobileNav() {
  const [location] = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const { orientation } = useDevice();

  // Primary navigation items
  const primaryNavItems: NavigationItem[] = [
    { name: 'Dashboard', icon: <BarChart3 className="text-lg" />, id: 'dashboard', path: '/' },
    { name: 'Service Users', icon: <Users className="text-lg" />, id: 'service-users', path: '/service-users' },
    { name: 'Visits', icon: <Clock className="text-lg" />, id: 'visits', path: '/visits', badge: 3, badgeColor: 'primary' },
    { name: 'Care Plans', icon: <ClipboardList className="text-lg" />, id: 'care-plans', path: '/care-plans' },
  ];

  // Secondary navigation items (shown in the "More" menu)
  const secondaryNavItems: NavigationItem[] = [
    { name: 'Calendar', icon: <Calendar className="text-lg" />, id: 'calendar', path: '/calendar' },
    { name: 'Feedback', icon: <MessageSquarePlus className="text-lg" />, id: 'feedback', path: '/feedback' },
    { name: 'Tasks', icon: <CheckCircle className="text-lg" />, id: 'tasks', path: '/tasks', badge: 5, badgeColor: 'error' },
  ];

  // Handle scroll to hide/show navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down (but only if we've scrolled down a bit)
      if (currentScrollY > 100) {
        setIsNavHidden(currentScrollY > lastScrollY);
      } else {
        setIsNavHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close more menu when location changes
  useEffect(() => {
    setShowMore(false);
  }, [location]);

  // Render a navigation item
  const renderNavItem = (item: NavigationItem, isActive: boolean) => (
    <Link
      key={item.id}
      href={item.path}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'transition-colors duration-200 active:scale-95',
        isActive
          ? 'text-primary dark:text-primary-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
      )}
    >
      <div className="relative">
        {item.icon}
        {item.badge && (
          <span className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center',
            'min-w-[18px] h-[18px] text-[10px] font-bold text-white rounded-full px-1',
            {
              'bg-primary': item.badgeColor === 'primary',
              'bg-secondary': item.badgeColor === 'secondary',
              'bg-green-500': item.badgeColor === 'success',
              'bg-yellow-500': item.badgeColor === 'warning',
              'bg-red-500': item.badgeColor === 'error' || !item.badgeColor,
            }
          )}>
            {item.badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">{item.name}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-primary transform -translate-x-1/2" />
      )}
    </Link>
  );

  // Calculate number of visible items based on orientation
  const visibleItems = orientation === 'landscape' ? primaryNavItems : primaryNavItems.slice(0, 4);
  const moreButton = orientation === 'landscape' ? null : (
    <button
      className={cn(
        'flex flex-col items-center justify-center',
        'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300',
        'transition-colors duration-200 active:scale-95',
        showMore && 'text-primary dark:text-primary-400'
      )}
      onClick={() => setShowMore(!showMore)}
    >
      {showMore ? <X className="text-lg" /> : <Menu className="text-lg" />}
      <span className="text-xs mt-1">More</span>
    </button>
  );

  return (
    <>
      {/* Main navigation bar */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-20",
          "transition-transform duration-300",
          isNavHidden && "translate-y-full"
        )}
      >
        <div className={cn(
          "grid h-16",
          orientation === 'landscape' ? "grid-cols-6" : "grid-cols-5"
        )}>
          {visibleItems.map((item) => {
            const isActive = location === item.path ||
                           (item.path !== '/' && location.startsWith(item.path));
            return renderNavItem(item, isActive);
          })}

          {/* More button for portrait mode */}
          {moreButton}

          {/* Additional items for landscape mode */}
          {orientation === 'landscape' && secondaryNavItems.slice(0, 2).map((item) => {
            const isActive = location === item.path ||
                           (item.path !== '/' && location.startsWith(item.path));
            return renderNavItem(item, isActive);
          })}
        </div>
      </div>

      {/* More menu (shown when "More" is clicked) */}
      {showMore && (
        <div className="fixed bottom-16 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-10 animate-swipe-right">
          <div className="grid grid-cols-3 py-4">
            {secondaryNavItems.map((item) => {
              const isActive = location === item.path ||
                             (item.path !== '/' && location.startsWith(item.path));
              return renderNavItem(item, isActive);
            })}
          </div>
        </div>
      )}

      {/* Overlay for more menu */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden animate-fade-in"
          onClick={() => setShowMore(false)}
        />
      )}
    </>
  );
}
