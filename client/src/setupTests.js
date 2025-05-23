/**
 * Setup file for Jest tests
 * 
 * This file is run before each test file.
 */

// Add testing library extensions
import '@testing-library/jest-dom';

// Mock browser APIs that are not available in jsdom
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
  
  start() {}
  stop() {}
  addEventListener() {}
  removeEventListener() {}
}

class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
  }
}

// Mock window.SpeechRecognition
window.SpeechRecognition = window.SpeechRecognition || MockSpeechRecognition;
window.webkitSpeechRecognition = window.webkitSpeechRecognition || MockSpeechRecognition;

// Mock window.speechSynthesis
window.speechSynthesis = window.speechSynthesis || {
  speak: () => {},
  cancel: () => {},
  pause: () => {},
  resume: () => {},
  getVoices: () => []
};

// Mock window.SpeechSynthesisUtterance
window.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || MockSpeechSynthesisUtterance;

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  };
};

// Mock window.IntersectionObserver
window.IntersectionObserver = window.IntersectionObserver || class {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.localStorage
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

// Mock window.indexedDB
const indexedDBMock = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null
  })
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock
});

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    headers: {
      get: () => null
    }
  })
);

// Mock window.navigator
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock window.URL.revokeObjectURL
window.URL.revokeObjectURL = jest.fn();

// Mock ResizeObserver
window.ResizeObserver = window.ResizeObserver || class {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};
