import React, { ReactNode, useState } from 'react';
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
  Briefcase 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { href: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { href: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
    { href: '/service-users', icon: <Users size={20} />, label: 'Service Users' },
    { href: '/care-plans', icon: <FilePlus size={20} />, label: 'Care Plans' },
    { href: '/care-allocation', icon: <Users2 size={20} />, label: 'Care Allocation' },
    { href: '/staff-management', icon: <Briefcase size={20} />, label: 'Staff Management' },
    { href: '/incident-reporting', icon: <AlertTriangle size={20} />, label: 'Incident Reporting' },
    { href: '/cqc-compliance', icon: <BarChart3 size={20} />, label: 'CQC Compliance' },
    { href: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { href: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-20 md:hidden">
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
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed z-20 inset-y-0 left-0 w-64 transition duration-300 transform bg-indigo-700 overflow-y-auto md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-center h-16 bg-indigo-800">
          <h2 className="text-white text-2xl font-semibold">CareUnity</h2>
        </div>
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-100 rounded-lg hover:bg-indigo-600 transition-colors ${
                    location === item.href ? 'bg-indigo-800 font-medium' : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow h-16 flex items-center justify-end px-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Caregiver
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}