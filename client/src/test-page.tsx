import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity Test Page</h1>
        
        <p className="text-gray-700 mb-4">
          This is a simple React test page to verify that Vite and React are working correctly.
        </p>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => alert('React event handlers are working!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Test React
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Server status:</h2>
          <div id="server-status" className="text-gray-600">Not checked yet</div>
          
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/api/healthcheck');
                const data = await response.json();
                document.getElementById('server-status')!.innerText = 
                  `Success! Server responded with: ${JSON.stringify(data)}`;
              } catch (err) {
                document.getElementById('server-status')!.innerText = 
                  `Error: ${err instanceof Error ? err.message : String(err)}`;
              }
            }}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Check Server
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestPage />
  </React.StrictMode>
);