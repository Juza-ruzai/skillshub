import '@testing-library/jest-dom'

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
        VITE_FILE_BASE_URL: 'http://localhost:8000/api/v1/files',
      },
    },
  },
  writable: true,
})
