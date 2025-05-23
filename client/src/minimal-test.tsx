import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// This is a minimal React component with no dependencies on other parts of the app
function MinimalTest() {
  const [message, setMessage] = useState('App is working!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity Test</h1>
        
        <p className="text-gray-700 mb-4">
          This is a minimal React component to test if the app can render correctly.
        </p>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setMessage('React events are working!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Test React
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Initialize React without any providers
// This is the most basic way to render a React application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <MinimalTest />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}
