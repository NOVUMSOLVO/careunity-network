import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'linear-gradient(to right, #6366f1, #8b5cf6)'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          color: '#4f46e5'
        }}>
          CareUnity Test Page
        </h1>
        <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
          If you can see this page, the application is loading correctly.
        </p>
        <div style={{ marginBottom: '1.5rem' }}>
          <button style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}>
            Test Button
          </button>
        </div>
        <div style={{
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.25rem',
          color: '#374151',
          fontSize: '0.875rem'
        }}>
          Server status: Checking...
        </div>
      </div>
    </div>
  );
};

export default TestPage;