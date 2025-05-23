# CareUnity Network API Documentation

## Overview

The CareUnity Network API provides RESTful endpoints for managing healthcare data and operations. All endpoints require authentication unless otherwise specified.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "username": "user",
      "fullName": "User Name",
      "role": "care_worker"
    }
  }
}
```

## Core Endpoints

### Users

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

### Service Users

#### List Service Users
```http
GET /api/service-users
Authorization: Bearer <token>
```

#### Get Service User
```http
GET /api/service-users/:id
Authorization: Bearer <token>
```

#### Create Service User
```http
POST /api/service-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "uniqueId": "string",
  "fullName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "address": "string",
  "phoneNumber": "string",
  "emergencyContact": "string"
}
```

### Care Plans

#### List Care Plans
```http
GET /api/care-plans
Authorization: Bearer <token>
```

#### Get Care Plan
```http
GET /api/care-plans/:id
Authorization: Bearer <token>
```

#### Create Care Plan
```http
POST /api/care-plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceUserId": 1,
  "title": "string",
  "summary": "string",
  "startDate": "YYYY-MM-DD",
  "status": "active"
}
```

### Appointments

#### List Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceUserId": 1,
  "caregiverId": 1,
  "title": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "visitType": "string"
}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Pagination

List endpoints support pagination:

```http
GET /api/service-users?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## Health Check

```http
GET /api/health
```

Returns the API health status (no authentication required).

## Interactive Documentation

When running in development mode, interactive API documentation is available at:
- Swagger UI: `http://localhost:3000/api/docs`

For more detailed information, please refer to the interactive documentation.
