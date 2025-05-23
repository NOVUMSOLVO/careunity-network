# CareUnity Network

A modern, scalable care management platform designed for healthcare providers. This repository contains the foundational framework and public components of the CareUnity Network system.

![CareUnity Logo](generated-icon.png)

## Overview

CareUnity Network is a comprehensive healthcare management platform that provides:

- **Modern Web Interface**: React-based responsive design
- **Mobile Support**: Cross-platform mobile application
- **Real-time Communication**: WebSocket integration
- **Secure Authentication**: Multi-factor authentication support
- **Scalable Architecture**: Microservices-ready design
- **API-First Design**: RESTful APIs with comprehensive documentation

## Features

### Core Platform
- **User Management**: Role-based access control with secure authentication
- **Dashboard Interface**: Responsive web dashboard with real-time updates
- **Mobile Application**: Cross-platform mobile app built with React Native
- **API Gateway**: RESTful APIs with comprehensive documentation
- **Real-time Communication**: WebSocket integration for live updates

### Technical Capabilities
- **Offline Support**: Service worker implementation for offline functionality
- **Multi-language**: Internationalization support (i18n)
- **Accessibility**: WCAG 2.1 compliant interface design
- **Performance**: Optimized for mobile and desktop environments
- **Security**: Enterprise-grade security with multi-factor authentication

### Integration Ready
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis integration for performance optimization
- **Monitoring**: Built-in performance and health monitoring
- **Deployment**: Docker and PM2 configuration included

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **React Query** for state management
- **Wouter** for routing
- **i18next** for internationalization
- **Service Workers** for offline capabilities

### Mobile
- **React Native** with Expo
- **Cross-platform** (iOS and Android)
- **Push Notifications** with Expo
- **Offline-first** architecture

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **WebSocket** for real-time features
- **JWT Authentication** with 2FA
- **Redis** for caching

### DevOps & Deployment
- **PM2** for process management
- **Docker** containerization support
- **Vite** for build tooling
- **Vitest** for testing

## Installation and Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/NOVUMSOLVO/careunity-network.git
   cd careunity-network
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```text
careunity-network/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Application pages
│   └── package.json
├── mobile-app/            # React Native mobile app
│   ├── src/
│   │   ├── components/    # Mobile UI components
│   │   ├── navigation/    # Navigation setup
│   │   └── screens/       # Screen components
│   └── package.json
├── server/                # Backend Express server
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   └── db/                # Database configuration
├── shared/                # Shared types and utilities
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run lint` - Run linting
- `npm run db:migrate` - Run database migrations

## Deployment

The application supports multiple deployment options:

- **Docker**: Use the included Dockerfile for containerized deployment
- **PM2**: Production process management with ecosystem.config.js
- **Cloud Platforms**: Compatible with AWS, Azure, Google Cloud
- **Traditional Hosting**: Any Node.js hosting service with PostgreSQL

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or support:

- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Contact: [support@novumsolvo.com](mailto:support@novumsolvo.com)

---

**CareUnity Network** - Built with ❤️ by [NOVUMSOLVO](https://github.com/NOVUMSOLVO)