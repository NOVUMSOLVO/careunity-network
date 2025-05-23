import React, { useState } from 'react';
import './App.css';

// Import contexts (these will be created in separate files)
import { AccessibilityProvider } from './contexts/accessibility-context';
import { LanguageProvider } from './contexts/language-context';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <div className="App">
          <Header />
          <div className="app-container">
            <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />
            <main className="main-content">
              {renderPage()}
            </main>
          </div>
        </div>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}

export default App;
