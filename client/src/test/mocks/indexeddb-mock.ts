/**
 * Mock implementation of IndexedDB for testing
 */

import { vi } from 'vitest';

// Mock IDBDatabase
export const mockIDBDatabase = {
  createObjectStore: vi.fn().mockReturnValue({
    createIndex: vi.fn(),
  }),
  transaction: vi.fn(),
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn().mockReturnValue(true),
  },
};

// Mock IDBTransaction
export const mockIDBTransaction = {
  objectStore: vi.fn(),
  complete: Promise.resolve(),
  commit: vi.fn(),
  abort: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

// Mock IDBObjectStore
export const mockIDBObjectStore = {
  add: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  put: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  delete: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  clear: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  get: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getAll: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getAllKeys: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  count: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  index: vi.fn(),
  createIndex: vi.fn(),
  deleteIndex: vi.fn(),
  openCursor: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  openKeyCursor: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getAllFromIndex: vi.fn().mockResolvedValue([]),
};

// Mock IDBIndex
export const mockIDBIndex = {
  get: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getKey: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getAll: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  getAllKeys: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  count: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  openCursor: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  openKeyCursor: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
};

// Mock IDBCursor
export const mockIDBCursor = {
  advance: vi.fn(),
  continue: vi.fn(),
  delete: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  update: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  key: 'test-key',
  primaryKey: 'test-primary-key',
  value: { id: 'test-id', data: 'test-data' },
  direction: 'next',
  source: mockIDBObjectStore,
};

// Helper function to create a mock IDBRequest
export function createMockIDBRequest() {
  return {
    result: null,
    error: null,
    source: null,
    transaction: null,
    readyState: 'pending',
    onsuccess: null,
    onerror: null,
  };
}

// Mock IndexedDB
export const mockIndexedDB = {
  open: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    request.result = mockIDBDatabase;
    
    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded(new Event('upgradeneeded'));
      }
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    
    return request;
  }),
  deleteDatabase: vi.fn().mockImplementation(() => {
    const request = createMockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
  cmp: vi.fn().mockReturnValue(0),
  databases: vi.fn().mockResolvedValue([]),
};

// Setup mock connections between objects
mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);

// Export a function to reset all mocks
export function resetIndexedDBMocks() {
  vi.resetAllMocks();
  
  // Restore default mock implementations
  mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
  mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
  mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);
}
