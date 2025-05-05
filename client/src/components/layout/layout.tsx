import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Calendar, 
  Users, 
  FilePlus, 
  Users2, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  AlertTriangle,
  Briefcase,
  ShieldCheck,
  FileText,
  Globe,
  Activity,
  Navigation,
  Heart,
  ClipboardList,
  CheckCircle,
  Lock,
  Bell,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

interface LayoutProps {
  children: ReactNode;
}

// Navigation item type definition
type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  group: 'overview' | 'care' | 'admin' | 'compliance' | 'advanced' | 'user';
  mobileVisible?: boolean;
  role?: 'admin' | 'manager' | 'caregiver' | 'all';
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<string>('caregiver');

  // Handle responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // All navigation items with logical grouping
  const navItems: NavItem[] = [
    // Overview and Planning
    { href: '/', icon: <Home size={20} />, label: 'Dashboard', group: 'overview', mobileVisible: true, role: 'all' },
    { href: '/calendar', icon: <Calendar size={20} />, label: 'Calendar', group: 'overview', mobileVisible: true, role: 'all' },
    
    // Service User Management
    { href: '/service-users', icon: <Users size={20} />, label: 'Service Users', group: 'care', mobileVisible: true, role: 'all' },
    { href: '/care-plans', icon: <ClipboardList size={20} />, label: 'Care Plans', group: 'care', mobileVisible: true, role: 'all' },
    { href: '/care-allocation', icon: <Users2 size={20} />, label: 'Care Allocation', group: 'care', mobileVisible: false, role: 'manager' },
    
    // Staff and Administration
    { href: '/staff-management', icon: <Briefcase size={20} />, label: 'Staff Management', group: 'admin', mobileVisible: false, role: 'manager' },
    { href: '/rbac-management', icon: <ShieldCheck size={20} />, label: 'Access Control', group: 'admin', mobileVisible: false, role: 'admin' },
    { href: '/permissions-management', icon: <Lock size={20} />, label: 'Permissions', group: 'admin', mobileVisible: false, role: 'admin' },
    
    // Compliance and Reporting
    { href: '/incident-reporting', icon: <AlertTriangle size={20} />, label: 'Incidents', group: 'compliance', mobileVisible: true, role: 'all' },
    { href: '/cqc-compliance', icon: <CheckCircle size={20} />, label: 'CQC Compliance', group: 'compliance', mobileVisible: false, role: 'manager' },
    { href: '/reports', icon: <FileText size={20} />, label: 'Reports', group: 'compliance', mobileVisible: false, role: 'manager' },
    
    // Advanced Features
    { href: '/predictive-health', icon: <Activity size={20} />, label: 'Predictive Health', group: 'advanced', mobileVisible: false, role: 'manager' },
    { href: '/healthcare-integration', icon: <Globe size={20} />, label: 'Healthcare Integration', group: 'advanced', mobileVisible: false, role: 'manager' },
    { href: '/community-resources', icon: <Home size={20} />, label: 'Community Resources', group: 'advanced', mobileVisible: true, role: 'all' },
    { href: '/route-optimizer', icon: <Navigation size={20} />, label: 'Route Optimizer', group: 'advanced', mobileVisible: true, role: 'all' },
    { href: '/family-portal', icon: <Heart size={20} />, label: 'Family Portal', group: 'advanced', mobileVisible: false, role: 'manager' },
    
    // User Tools and Settings
    { href: '/messages', icon: <MessageSquare size={20} />, label: 'Messages', group: 'user', mobileVisible: true, role: 'all' },
    { href: '/alerts', icon: <Bell size={20} />, label: 'Alerts', group: 'user', mobileVisible: true, role: 'all' },
    { href: '/settings', icon: <Settings size={20} />, label: 'Settings', group: 'user', mobileVisible: true, role: 'all' },
    { href: '/help', icon: <HelpCircle size={20} />, label: 'Help', group: 'user', mobileVisible: true, role: 'all' },
  ];

  // Filter nav items based on device and role
  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      const roleMatches = item.role === 'all' || item.role === currentRole;
      const deviceMatches = !isMobile || (isMobile && item.mobileVisible);
      
      return roleMatches && deviceMatches;
    });
  };

  // Group nav items by category (filtered for device and role)
  const overviewItems = filterNavItems(navItems.filter(item => item.group === 'overview'));
  const careItems = filterNavItems(navItems.filter(item => item.group === 'care'));
  const adminItems = filterNavItems(navItems.filter(item => item.group === 'admin'));
  const complianceItems = filterNavItems(navItems.filter(item => item.group === 'compliance'));
  const advancedItems = filterNavItems(navItems.filter(item => item.group === 'advanced'));
  const userItems = filterNavItems(navItems.filter(item => item.group === 'user'));

  // Navigation link component
  const NavLink = ({ item }: { item: NavItem }) => (
    <li>
      <Link 
        href={item.href}
        className={`flex items-center px-4 py-2 text-gray-100 rounded-lg hover:bg-indigo-600 transition-colors ${
          location === item.href ? 'bg-indigo-800 font-medium' : ''
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <span className="mr-3">{item.icon}</span>
        <span className={isMobile ? "text-sm" : ""}>{item.label}</span>
      </Link>
    </li>
  );

  // Section component (don't render if no items)
  const NavSection = ({ title, items }: { title: string, items: NavItem[] }) => {
    if (items.length === 0) return null;
    
    return (
      <div>
        <h3 className="text-xs uppercase font-semibold text-indigo-200 tracking-wider px-3 mb-2">
          {title}
        </h3>
        <ul className="space-y-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>
      </div>
    );
  };

  // Mobile bottom navigation bar
  const MobileBottomNav = () => {
    const mobileNavItems = navItems.filter(item => 
      item.mobileVisible && (item.role === 'all' || item.role === currentRole)
    ).slice(0, 5); // Limit to 5 items for mobile
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-indigo-800 shadow-lg z-10 sm:hidden">
        <div className="flex justify-around">
          {mobileNavItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 ${location === item.href ? 'text-white' : 'text-indigo-200'}`}
            >
              <span className="p-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-20 sm:hidden">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-10 w-10 rounded-md bg-white shadow text-gray-500 focus:outline-none"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar for mobile (overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed z-20 inset-y-0 left-0 w-64 transition duration-300 transform bg-indigo-700 overflow-y-auto sm:relative sm:translate-x-0`}
      >
        <div className="flex items-center justify-center h-16 bg-indigo-800">
          <h2 className="text-white text-2xl font-semibold">CareUnity</h2>
        </div>
        
        <div className="mt-4 px-4">
          <div className="bg-indigo-600 rounded-lg p-2 mb-4 flex items-center">
            <Smartphone className="h-5 w-5 text-indigo-200 mr-2" />
            <span className="text-white text-sm">
              {isMobile ? "Mobile View" : isTablet ? "Tablet View" : "Desktop View"}
            </span>
          </div>
        </div>
        
        <nav className="px-2 py-4">
          <div className="space-y-6">
            <NavSection title="Dashboard" items={overviewItems} />
            <NavSection title="Care Management" items={careItems} />
            <NavSection title="Administration" items={adminItems} />
            <NavSection title="Compliance & Reporting" items={complianceItems} />
            <NavSection title="Advanced Features" items={advancedItems} />
            <NavSection title="User" items={userItems} />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow h-16 flex items-center justify-between px-6">
          <div className="sm:hidden"></div> {/* Placeholder for mobile layout */}
          
          <div className="hidden sm:block">
            {/* Breadcrumb for tablet/desktop */}
            <div className="text-sm text-gray-600">
              {location === '/' ? 'Dashboard' : 
                location.split('/').map((part, index, array) => {
                  if (!part) return null;
                  const path = array.slice(0, index + 1).join('/');
                  const formattedPart = part.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  
                  return (
                    <span key={path}>
                      {index > 0 && <span className="mx-2">/</span>}
                      {index === array.length - 1 ? 
                        <span className="font-medium text-gray-900">{formattedPart}</span> : 
                        <Link href={path} className="text-indigo-600 hover:text-indigo-800">{formattedPart}</Link>
                      }
                    </span>
                  );
                })
              }
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Offline indicator */}
            <OfflineIndicator showOnlineStatus={true} />
            
            <div className="hidden sm:block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 pb-16 sm:pb-6">
          {children}
        </main>
        
        {/* Mobile bottom navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
}