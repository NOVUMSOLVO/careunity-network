import React from 'react';
import { Link, Route, Switch } from 'wouter';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity</h1>
        
        <p className="text-gray-700 mb-4">
          Welcome to the CareUnity care management platform. This is a simple application with no complex dependencies.
        </p>
        
        <div className="flex justify-center mt-6">
          <Link href="/test">
            <a className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Go to Test Page
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TestPage() {
  const [message, setMessage] = React.useState('Click the button to test API');

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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Test Page</h1>
        
        <p className="text-gray-700 mb-4">
          This is a test page to verify that React and API connections are working correctly.
        </p>
        
        <div className="flex justify-center mt-6 flex-wrap gap-2">
          <button 
            onClick={() => alert('React events are working!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
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
        
        <div className="mt-6 text-center">
          <Link href="/">
            <a className="text-indigo-600 hover:underline">
              Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/test" component={TestPage} />
    </Switch>
  );
}

export default App;
