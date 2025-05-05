import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TestPage from './test-page';

// Direct entry point that doesn't use providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestPage />
  </React.StrictMode>
);