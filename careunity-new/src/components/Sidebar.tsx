import React from 'react';
import { useLanguage } from '../contexts/language-context';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'serviceUsers', label: t('serviceUsers'), icon: '👥' },
    { id: 'visits', label: t('visits'), icon: '🗓️' },
    { id: 'reports', label: t('reports'), icon: '📝' },
    { id: 'settings', label: t('settings'), icon: '⚙️' },
    { id: 'profile', label: t('profile'), icon: '👤' },
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={currentPage === item.id ? 'active' : ''}
                onClick={() => setCurrentPage(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
