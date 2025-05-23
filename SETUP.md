# CareUnity Setup Guide

This guide will help you set up the CareUnity application with all the enhancements we've made.

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Docker and Docker Compose (optional, for containerized setup)
- PostgreSQL (if not using Docker)

## Option 1: Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CareUnityNetwork
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Additional Dependencies

```bash
npm install rate-limiter-flexible ioredis sharp
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careunity
SESSION_SECRET=your_very_strong_and_random_session_secret
```

### 5. Set Up the Database

If you have PostgreSQL installed locally:

```bash
createdb careunity
npm run db:migrate
```

### 6. Run the Application

```bash
npm run dev
```

## Option 2: Docker Setup (Recommended)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CareUnityNetwork
```

### 2. Start the Docker Containers

```bash
docker-compose up -d
```

This will:
- Build the Docker image for the application
- Start the application container
- Start a PostgreSQL container
- Set up the necessary environment variables

### 3. Run Database Migrations

```bash
docker-compose exec app npm run db:migrate
```

### 4. Access the Application

The application will be available at http://localhost:5000

## Testing the Enhancements

### 1. Testing Infrastructure

Run the end-to-end tests:

```bash
npm run test:e2e
```

Run the visual regression tests:

```bash
npx playwright test e2e-tests/visual-regression.spec.ts
```

### 2. Performance Monitoring

Access the performance dashboard:

```
http://localhost:5000/api/v2/performance/metrics
```

### 3. API Documentation

Run the API examples integration script:

```bash
npm run docs:api:examples
```

Access the API documentation:

```
http://localhost:5000/api/docs
```

### 4. Mobile Optimizations

Test the mobile optimizations:

```bash
npm run test:mobile-optimizations
```

## Troubleshooting

### Missing Dependencies

If you encounter errors about missing dependencies, install them using npm:

```bash
npm install <dependency-name>
```

### Database Connection Issues

If you have issues connecting to the database:

1. Check that PostgreSQL is running
2. Verify the DATABASE_URL environment variable
3. Ensure the database exists

### Port Conflicts

If port 5000 is already in use:

1. Change the PORT environment variable
2. Update the port mapping in docker-compose.yml

## Directory Structure

```
CareUnityNetwork/
├── client/                  # Frontend code
│   └── src/
│       ├── components/      # React components
│       │   └── mobile/      # Mobile-optimized components
│       ├── hooks/           # React hooks
│       └── pages/           # Page components
├── server/                  # Backend code
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   └── services/            # Business logic
├── shared/                  # Shared code
│   ├── schema/              # Database schema
│   ├── types/               # TypeScript types
│   └── validation/          # Validation schemas
├── e2e-tests/               # End-to-end tests
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

## Next Steps

After setting up the application, you can:

1. Explore the performance dashboard
2. Test the mobile-optimized components
3. Review the API documentation
4. Run the end-to-end tests

## Support

If you encounter any issues, please contact the development team or open an issue on GitHub.
