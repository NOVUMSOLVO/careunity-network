# CareUnity API Reference

This document provides a comprehensive reference for the CareUnity API endpoints.

## Base URL

All API endpoints are relative to the base URL of your CareUnity installation:

```
https://your-careunity-instance.com/api/v2
```

## Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Token) for authentication.

### Obtaining a Token

To obtain a token, send a POST request to the `/auth/login` endpoint:

```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

The response will include a token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "your_username",
    "fullName": "Your Name",
    "email": "your.email@example.com",
    "role": "care_worker"
  }
}
```

### Using the Token

Include the token in the `Authorization` header of your requests:

```http
GET /api/v2/service-users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user does not have permission to access the resource
- `404 Not Found`: The requested resource was not found
- `409 Conflict`: The request conflicts with the current state of the resource
- `422 Unprocessable Entity`: The request was well-formed but contains semantic errors
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with an error message:

```json
{
  "error": "Invalid input",
  "message": "The request contains invalid data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Pagination

List endpoints support pagination using the `page` and `limit` query parameters:

```http
GET /api/v2/service-users?page=2&limit=10
```

Paginated responses include pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalCount": 45,
    "totalPages": 5
  }
}
```

## Filtering and Sorting

List endpoints support filtering and sorting using query parameters:

```http
GET /api/v2/service-users?q=smith&sort=fullName&order=asc
```

## API Endpoints

### Authentication

#### Login

```http
POST /api/v2/auth/login
```

Request body:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "your_username",
    "fullName": "Your Name",
    "email": "your.email@example.com",
    "role": "care_worker"
  }
}
```

#### Register

```http
POST /api/v2/auth/register
```

Request body:

```json
{
  "username": "new_user",
  "password": "secure_password",
  "fullName": "New User",
  "email": "new.user@example.com",
  "role": "care_worker"
}
```

Response:

```json
{
  "id": 2,
  "username": "new_user",
  "fullName": "New User",
  "email": "new.user@example.com",
  "role": "care_worker"
}
```

#### Get Current User

```http
GET /api/v2/auth/me
```

Response:

```json
{
  "id": 1,
  "username": "your_username",
  "fullName": "Your Name",
  "email": "your.email@example.com",
  "role": "care_worker"
}
```

### Service Users

#### List Service Users

```http
GET /api/v2/service-users
```

Query parameters:

- `q`: Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

Response:

```json
{
  "data": [
    {
      "id": 1,
      "uniqueId": "SU-001",
      "fullName": "John Smith",
      "dateOfBirth": "1980-01-01",
      "address": "123 Main St",
      "phoneNumber": "+44123456789",
      "emergencyContact": "Jane Smith, +44987654321"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 45,
    "totalPages": 5
  }
}
```

#### Get Service User

```http
GET /api/v2/service-users/:id
```

Response:

```json
{
  "id": 1,
  "uniqueId": "SU-001",
  "fullName": "John Smith",
  "dateOfBirth": "1980-01-01",
  "address": "123 Main St",
  "phoneNumber": "+44123456789",
  "emergencyContact": "Jane Smith, +44987654321",
  "preferences": "...",
  "needs": "...",
  "lifeStory": "..."
}
```

#### Create Service User

```http
POST /api/v2/service-users
```

Request body:

```json
{
  "uniqueId": "SU-002",
  "fullName": "Jane Doe",
  "dateOfBirth": "1985-05-15",
  "address": "456 Oak St",
  "phoneNumber": "+44123456789",
  "emergencyContact": "John Doe, +44987654321",
  "preferences": "...",
  "needs": "...",
  "lifeStory": "..."
}
```

Response:

```json
{
  "id": 2,
  "uniqueId": "SU-002",
  "fullName": "Jane Doe",
  "dateOfBirth": "1985-05-15",
  "address": "456 Oak St",
  "phoneNumber": "+44123456789",
  "emergencyContact": "John Doe, +44987654321",
  "preferences": "...",
  "needs": "...",
  "lifeStory": "..."
}
```

#### Update Service User

```http
PATCH /api/v2/service-users/:id
```

Request body:

```json
{
  "address": "789 Pine St",
  "phoneNumber": "+44123456780"
}
```

Response:

```json
{
  "id": 2,
  "uniqueId": "SU-002",
  "fullName": "Jane Doe",
  "dateOfBirth": "1985-05-15",
  "address": "789 Pine St",
  "phoneNumber": "+44123456780",
  "emergencyContact": "John Doe, +44987654321",
  "preferences": "...",
  "needs": "...",
  "lifeStory": "..."
}
```

### Care Plans

#### List Care Plans for a Service User

```http
GET /api/v2/service-users/:id/care-plans
```

Response:

```json
{
  "data": [
    {
      "id": 1,
      "serviceUserId": 1,
      "title": "Daily Care Plan",
      "summary": "...",
      "startDate": "2023-01-01",
      "reviewDate": "2023-07-01",
      "status": "active"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 2,
    "totalPages": 1
  }
}
```

#### Get Care Plan

```http
GET /api/v2/care-plans/:id
```

Response:

```json
{
  "id": 1,
  "serviceUserId": 1,
  "title": "Daily Care Plan",
  "summary": "...",
  "startDate": "2023-01-01",
  "reviewDate": "2023-07-01",
  "status": "active",
  "goals": [
    {
      "id": 1,
      "carePlanId": 1,
      "title": "Improve Mobility",
      "description": "...",
      "startDate": "2023-01-01",
      "targetDate": "2023-03-01",
      "status": "completed",
      "progressPercentage": 100
    },
    ...
  ],
  "tasks": [
    {
      "id": 1,
      "carePlanId": 1,
      "title": "Morning Medication",
      "description": "...",
      "category": "medication",
      "timeOfDay": "morning",
      "completed": false
    },
    ...
  ]
}
```

#### Create Care Plan

```http
POST /api/v2/care-plans
```

Request body:

```json
{
  "serviceUserId": 1,
  "title": "Mobility Care Plan",
  "summary": "...",
  "startDate": "2023-06-01",
  "reviewDate": "2023-12-01",
  "status": "active"
}
```

Response:

```json
{
  "id": 2,
  "serviceUserId": 1,
  "title": "Mobility Care Plan",
  "summary": "...",
  "startDate": "2023-06-01",
  "reviewDate": "2023-12-01",
  "status": "active"
}
```

### Documents

#### List Documents

```http
GET /api/v2/documents
```

Query parameters:

- `query`: Search query
- `category`: Filter by category
- `type`: Filter by type
- `serviceUserId`: Filter by service user
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Care Plan - John Smith.pdf",
      "type": "pdf",
      "category": "care_plan",
      "size": 2500000,
      "uploadedById": 1,
      "uploadedAt": "2023-05-01T10:30:00Z",
      "lastModified": "2023-05-01T10:30:00Z",
      "tags": ["care plan", "active"],
      "serviceUserId": 1,
      "description": "Current care plan for John Smith",
      "url": "/uploads/care-plan-john.pdf",
      "isPublic": false,
      "isArchived": false,
      "uploadedBy": {
        "id": 1,
        "fullName": "Admin User"
      }
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

#### Upload Document

```http
POST /api/v2/documents
Content-Type: multipart/form-data
```

Form data:

- `file`: The document file
- `name`: Document name
- `type`: Document type (`pdf`, `image`, `document`, `spreadsheet`, `other`)
- `category`: Document category (`care_plan`, `medical`, `assessment`, `consent`, `report`, `other`)
- `tags`: JSON array of tags
- `serviceUserId`: Service user ID (optional)
- `description`: Document description (optional)
- `isPublic`: Whether the document is public (default: false)

Response:

```json
{
  "id": 2,
  "name": "Medical Assessment.docx",
  "type": "document",
  "category": "medical",
  "size": 1800000,
  "uploadedById": 1,
  "uploadedAt": "2023-06-15T14:20:00Z",
  "lastModified": "2023-06-15T14:20:00Z",
  "tags": ["assessment", "medical"],
  "serviceUserId": 1,
  "description": "Medical assessment report",
  "url": "/uploads/medical-assessment.docx",
  "isPublic": false,
  "isArchived": false
}
```

### Family Portal

#### Get Service Users for Family Member

```http
GET /api/v2/family-portal/service-users
```

Response:

```json
[
  {
    "id": 1,
    "uniqueId": "SU-001",
    "fullName": "John Smith",
    "dateOfBirth": "1980-01-01",
    "address": "123 Main St",
    "phoneNumber": "+44123456789",
    "relationshipType": "son",
    "accessLevel": "read",
    "isEmergencyContact": true
  },
  ...
]
```

#### Get Service User Details for Family Member

```http
GET /api/v2/family-portal/service-users/:id
```

Response:

```json
{
  "id": 1,
  "uniqueId": "SU-001",
  "fullName": "John Smith",
  "dateOfBirth": "1980-01-01",
  "address": "123 Main St",
  "phoneNumber": "+44123456789",
  "emergencyContact": "Jane Smith, +44987654321",
  "relationshipType": "son",
  "accessLevel": "read",
  "isEmergencyContact": true
}
```

### External Integration

#### List Integration Systems

```http
GET /api/v2/external-integration/systems
```

Response:

```json
[
  {
    "id": 1,
    "name": "EHR System",
    "type": "ehr",
    "baseUrl": "https://ehr-api.example.com",
    "apiKey": "••••••••1234",
    "isActive": true,
    "lastSyncAt": "2023-06-01T12:00:00Z"
  },
  ...
]
```

#### Sync with External System

```http
POST /api/v2/external-integration/sync
```

Request body:

```json
{
  "systemId": 1,
  "entityType": "service_user",
  "entityId": 1,
  "fullSync": false
}
```

Response:

```json
{
  "message": "Sync job started",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "details": {
    "systemId": 1,
    "entityType": "service_user",
    "entityId": 1,
    "fullSync": false,
    "startedAt": "2023-06-15T14:30:00Z"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The default rate limit is 100 requests per minute per IP address. When the rate limit is exceeded, the API returns a `429 Too Many Requests` response with a `Retry-After` header indicating how many seconds to wait before making another request.

## Webhooks

The API supports webhooks for real-time notifications of events. To register a webhook, send a POST request to the `/api/v2/webhooks` endpoint:

```http
POST /api/v2/webhooks
Content-Type: application/json

{
  "url": "https://your-webhook-endpoint.com",
  "events": ["service_user.created", "care_plan.updated"],
  "secret": "your_webhook_secret"
}
```

The API will send a POST request to the specified URL when the specified events occur. The request will include a `X-CareUnity-Signature` header with an HMAC-SHA256 signature of the request body using the webhook secret as the key.
