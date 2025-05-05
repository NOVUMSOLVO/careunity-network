import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// This is a simple React application with minimal dependencies
// It doesn't rely on any providers, hooks, or complex code

function SimpleApp() {
  const [message, setMessage] = useState('Click the button to test API');

  const testApi = async () => {
    setMessage('Testing API connection...');
    try {
      const response = await fetch('/api/healthcheck');
      const data = await response.json();
      setMessage(`API response: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity</h1>
        
        <p className="text-gray-700 mb-4">
          This is a simple React component with minimal dependencies.
        </p>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => alert('React events are working!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-2"
          >
            Test React
          </button>
          
          <button 
            onClick={testApi}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Test API
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
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);