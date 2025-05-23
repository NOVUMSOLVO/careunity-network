import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple component that just renders some text
function DebugComponent() {
  console.log('DebugComponent rendering');
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#4338ca' }}>Debug Component</h1>
      <p>If you can see this text, React is working correctly.</p>
      <button 
        onClick={() => alert('React event handler working!')}
        style={{
          backgroundColor: '#4338ca',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
    </div>
  );
}

// Log information about the DOM
console.log('Document ready state:', document.readyState);
console.log('Root element exists:', !!document.getElementById('root'));

// Wait for the DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  console.log('Initializing app');
  console.log('Root element exists (in initApp):', !!document.getElementById('root'));
  
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    console.log('Mounting React app to root element');
    try {
      createRoot(rootElement).render(
        <React.StrictMode>
          <DebugComponent />
        </React.StrictMode>
      );
      console.log('React app mounted successfully');
    } catch (error) {
      console.error('Error mounting React app:', error);
      
      // If React fails, try to at least show some content
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #e11d48;">React Error</h1>
          <p>There was an error mounting the React application:</p>
          <pre style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; overflow: auto;">${error?.toString()}</pre>
        </div>
      `;
    }
  } else {
    console.error('Root element not found!');
    
    // If root element doesn't exist, create one and append to body
    console.log('Creating root element');
    const newRoot = document.createElement('div');
    newRoot.id = 'debug-root';
    document.body.appendChild(newRoot);
    
    console.log('Mounting React app to newly created root element');
    try {
      createRoot(newRoot).render(
        <React.StrictMode>
          <DebugComponent />
        </React.StrictMode>
      );
      console.log('React app mounted successfully to new root');
    } catch (error) {
      console.error('Error mounting React app to new root:', error);
      
      // If React fails, try to at least show some content
      newRoot.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #e11d48;">React Error</h1>
          <p>There was an error mounting the React application to the new root:</p>
          <pre style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; overflow: auto;">${error?.toString()}</pre>
        </div>
      `;
    }
  }
}
