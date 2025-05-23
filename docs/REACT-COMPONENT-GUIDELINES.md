# React Component Structure Guidelines

## Component Organization

We've adopted a component-based architecture using React to ensure better code organization, reusability, and maintainability.

### Directory Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   ├── pages/           # Page components
│   └── providers/       # Context providers
├── hooks/               # Custom React hooks
├── services/            # API and service functions
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── assets/              # Static assets
```

### Component Best Practices

1. **Single Responsibility**: Each component should have a single responsibility
2. **Component Size**: Keep components small and focused on specific tasks
3. **Reusability**: Design components to be reusable when possible
4. **Props**: Use TypeScript interfaces for prop definitions
5. **State Management**: Use React hooks for state management (useState, useReducer, useContext)

### Code Style

- Use functional components with hooks
- Use TypeScript for type safety
- Follow the Airbnb React/JSX Style Guide
- Use named exports for components

### Example Component

```tsx
import React from 'react';

interface ButtonProps {
  variant: 'primary' | 'secondary';
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  label,
  onClick 
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

## PWA Capabilities

Our React application maintains Progressive Web App (PWA) capabilities, including:

1. Offline functionality
2. Service worker for caching
3. Mobile responsiveness
4. Fast load times
5. Installation capability

These PWA features are implemented using modern web APIs and optimized for mobile devices.
