import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// This is a completely minimal React component with no dependencies on other files
function MinimalApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity Minimal Page</h1>
        
        <p className="text-gray-700 mb-4">
          This is an ultra-minimal React component with no dependencies on any providers.
        </p>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => alert('React works!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Test React
          </button>
        </div>
      </div>
    </div>
  );
}

// Direct rendering with no providers
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>
);