# CareUnity Developer Guide

This guide provides comprehensive information for developers working on the CareUnity platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Mobile App Development](#mobile-app-development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

CareUnity is a full-stack application with the following components:

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React with TypeScript
- **Mobile App**: React Native with Expo
- **Authentication**: JWT-based authentication
- **API**: RESTful API with OpenAPI specification
- **ML Models**: TensorFlow.js for AI-powered allocation

### System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Web Frontend   │     │  Mobile App     │     │  Admin Portal   │
│  (React)        │     │  (React Native) │     │  (React)        │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         │                       │                       │
         │                       │                       │
┌────────▼───────────────────────▼───────────────────────▼────────┐
│                                                                  │
│                         API Gateway                              │
│                                                                  │
└────────┬───────────────────────┬───────────────────────┬────────┘
         │                       │                       │
         │                       │                       │
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │
│  Core Services  │     │  ML Services    │     │  Integration    │
│                 │     │                 │     │  Services       │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │
│  PostgreSQL     │     │  Redis Cache    │     │  External       │
│  Database       │     │                 │     │  Systems        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Development Environment Setup

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL (v14 or later)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/careunity.git
cd careunity
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your local configuration.

4. Set up the database:

```bash
npm run db:setup
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Mobile App Setup

1. Navigate to the mobile app directory:

```bash
cd mobile-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start the Expo development server:

```bash
npm start
```

5. Use the Expo Go app on your mobile device to scan the QR code, or press 'a' to open in an Android emulator or 'i' for iOS simulator.

## Project Structure

```
careunity/
├── client/                 # Web frontend
│   ├── public/             # Static assets
│   ├── src/                # React components and logic
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client services
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── package.json        # Frontend dependencies
│
├── mobile-app/             # React Native mobile app
│   ├── src/                # App source code
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API client services
│   │   └── utils/          # Utility functions
│   └── package.json        # Mobile app dependencies
│
├── server/                 # Backend server
│   ├── db/                 # Database configuration
│   ├── middleware/         # Express middleware
│   ├── ml-models/          # Machine learning models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── index.ts            # Server entry point
│
├── shared/                 # Shared code between client and server
│   ├── schema.ts           # Database schema
│   ├── types/              # TypeScript type definitions
│   └── validation/         # Validation schemas
│
├── e2e-tests/              # End-to-end tests
│
├── docs/                   # Documentation
│
├── scripts/                # Utility scripts
│
└── package.json            # Root dependencies
```

## Backend Development

### API Development

The backend API follows RESTful principles and is implemented using Express.js.

#### Adding a New Endpoint

1. Create a new route file in `server/routes/` or add to an existing one.
2. Define the route handler functions.
3. Add validation using Zod schemas.
4. Register the route in `server/routes/index.ts`.

Example:

```typescript
// server/routes/example-route.ts
import express from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { ensureAuthenticated } from '../middleware/auth';

const router = express.Router();

// Define validation schema
const exampleSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

// Add route with validation and authentication
router.post('/', ensureAuthenticated, validateBody(exampleSchema), async (req, res, next) => {
  try {
    // Implementation
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### Database Operations

CareUnity uses Drizzle ORM for database operations:

```typescript
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Query example
const user = await db.select().from(users).where(eq(users.id, userId));

// Insert example
const newUser = await db.insert(users).values({
  username: 'newuser',
  email: 'user@example.com',
}).returning();

// Update example
await db.update(users)
  .set({ email: 'updated@example.com' })
  .where(eq(users.id, userId));

// Delete example
await db.delete(users).where(eq(users.id, userId));
```

### Authentication

Authentication is implemented using JWT tokens:

```typescript
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

// Generate token
const token = jwt.sign(
  { id: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token (in middleware)
const decoded = jwt.verify(token, JWT_SECRET);
```

## Frontend Development

### Component Development

CareUnity uses React with TypeScript for the frontend:

```tsx
import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';

interface ExampleFormProps {
  onSubmit: (data: { name: string }) => void;
}

const ExampleForm: React.FC<ExampleFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button type="submit" variant="contained">Submit</Button>
    </form>
  );
};

export default ExampleForm;
```

### API Integration

The frontend communicates with the backend using Axios:

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api/v2';

// Create API client
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example API call
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
```

## Mobile App Development

### React Native Components

The mobile app uses React Native with Expo:

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface LoginScreenProps {
  onLogin: (credentials: { username: string; password: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    onLogin({ username, password });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

### Offline Support

The mobile app includes offline support using AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Save data for offline use
export const cacheData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Retrieve cached data
export const getCachedData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

// Check network status
export const isOnline = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};
```

## Testing

### Unit Testing

CareUnity uses Jest for unit testing:

```typescript
import { sum } from './math';

describe('sum function', () => {
  it('adds two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
});
```

### End-to-End Testing

End-to-end tests use Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');
  
  // Fill the login form
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Check that we're redirected to the dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Check that the user is logged in
  await expect(page.locator('text=Welcome, Test User')).toBeVisible();
});
```

## Deployment

### Production Build

To create a production build:

```bash
# Web app
npm run build

# Mobile app
cd mobile-app
npm run build:android
npm run build:ios
```

### Deployment Scripts

Deployment scripts are located in the `scripts/` directory:

- `deploy.js`: Deploys the application to the production server
- `setup-environments.js`: Sets up environment variables for different environments

### CI/CD Pipeline

CareUnity uses GitHub Actions for CI/CD:

- `.github/workflows/main.yml`: Main workflow for the web app
- `.github/workflows/mobile.yml`: Workflow for the mobile app

## Contributing Guidelines

### Code Style

CareUnity follows the Airbnb JavaScript Style Guide with some modifications:

- Use TypeScript for type safety
- Use functional components with hooks for React
- Use async/await for asynchronous code
- Use meaningful variable and function names

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Format

Follow the conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or modifying tests
- chore: Changes to the build process or auxiliary tools
