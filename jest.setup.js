/**
 * Jest Setup
 * 
 * This file contains setup code for Jest tests.
 */

// Import testing libraries
import '@testing-library/jest-dom';

// Mock browser APIs
if (typeof window !== 'undefined') {
  // Mock localStorage
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem: function(key) {
        return store[key] || null;
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
      removeItem: function(key) {
        delete store[key];
      },
      clear: function() {
        store = {};
      }
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  });
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock navigator.serviceWorker
  Object.defineProperty(window.navigator, 'serviceWorker', {
    value: {
      register: jest.fn().mockResolvedValue({
        scope: '/',
        active: {
          postMessage: jest.fn(),
        },
        installing: {
          addEventListener: jest.fn(),
          state: 'installed',
        },
        waiting: null,
        addEventListener: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        unregister: jest.fn().mockResolvedValue(true),
      }),
      ready: Promise.resolve({
        active: {
          postMessage: jest.fn(),
        },
        update: jest.fn().mockResolvedValue(undefined),
        unregister: jest.fn().mockResolvedValue(true),
      }),
      controller: {
        postMessage: jest.fn(),
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getRegistrations: jest.fn().mockResolvedValue([]),
    },
  });
  
  // Mock navigator.onLine
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  });
}

// Global test timeout
jest.setTimeout(10000);

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React.createFactory()') ||
     args[0].includes('Warning: Using UNSAFE_'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
