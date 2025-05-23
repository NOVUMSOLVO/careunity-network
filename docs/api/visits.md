# Visits API Documentation

The Visits API provides endpoints for managing care visits in the CareUnity application.

## Base URL

All endpoints are relative to `/api/v2/visits`.

## Authentication

All endpoints require authentication. Include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Get All Visits

Retrieves a list of visits with optional filtering.

**URL:** `/`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| date | string | Filter by specific date (YYYY-MM-DD) |
| startDate | string | Filter by start date (YYYY-MM-DD) |
| endDate | string | Filter by end date (YYYY-MM-DD) |
| caregiverId | number | Filter by caregiver ID |
| serviceUserId | number | Filter by service user ID |
| status | string | Filter by status (scheduled, in-progress, completed, cancelled, missed) |
| visitType | string | Filter by visit type |

**Response:**

```json
[
  {
    "id": 1,
    "serviceUserId": 123,
    "caregiverId": 456,
    "date": "2023-10-15",
    "startTime": "2023-10-15T09:00:00Z",
    "endTime": "2023-10-15T10:00:00Z",
    "status": "scheduled",
    "notes": "Morning medication and personal care",
    "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
    "priority": "normal",
    "visitType": "medication",
    "serviceUser": {
      "id": 123,
      "fullName": "John Doe"
    },
    "caregiver": {
      "id": 456,
      "fullName": "Jane Smith"
    }
  }
]
```

### Get Visit by ID

Retrieves a specific visit by ID.

**URL:** `/:id`

**Method:** `GET`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Visit ID |

**Response:**

```json
{
  "id": 1,
  "serviceUserId": 123,
  "caregiverId": 456,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "scheduled",
  "notes": "Morning medication and personal care",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "normal",
  "visitType": "medication",
  "serviceUser": {
    "id": 123,
    "fullName": "John Doe"
  },
  "caregiver": {
    "id": 456,
    "fullName": "Jane Smith"
  }
}
```

### Create Visit

Creates a new visit.

**URL:** `/`

**Method:** `POST`

**Request Body:**

```json
{
  "serviceUserId": 123,
  "caregiverId": 456,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "scheduled",
  "notes": "Morning medication and personal care",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "normal",
  "visitType": "medication"
}
```

**Response:**

```json
{
  "id": 1,
  "serviceUserId": 123,
  "caregiverId": 456,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "scheduled",
  "notes": "Morning medication and personal care",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "normal",
  "visitType": "medication"
}
```

### Update Visit

Updates an existing visit.

**URL:** `/:id`

**Method:** `PUT`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Visit ID |

**Request Body:**

```json
{
  "caregiverId": 789,
  "notes": "Updated notes",
  "priority": "high"
}
```

**Response:**

```json
{
  "id": 1,
  "serviceUserId": 123,
  "caregiverId": 789,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "scheduled",
  "notes": "Updated notes",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "high",
  "visitType": "medication"
}
```

### Complete Visit

Marks a visit as completed.

**URL:** `/:id/complete`

**Method:** `POST`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Visit ID |

**Request Body:**

```json
{
  "notes": "Visit completed successfully",
  "feedback": "Service user was happy with the care provided",
  "feedbackRating": 5
}
```

**Response:**

```json
{
  "id": 1,
  "serviceUserId": 123,
  "caregiverId": 456,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "completed",
  "notes": "Visit completed successfully",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "normal",
  "visitType": "medication",
  "completedAt": "2023-10-15T10:05:00Z",
  "completedBy": 456,
  "feedback": "Service user was happy with the care provided",
  "feedbackRating": 5
}
```

### Cancel Visit

Cancels a visit.

**URL:** `/:id/cancel`

**Method:** `POST`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Visit ID |

**Request Body:**

```json
{
  "reason": "Service user unavailable"
}
```

**Response:**

```json
{
  "id": 1,
  "serviceUserId": 123,
  "caregiverId": 456,
  "date": "2023-10-15",
  "startTime": "2023-10-15T09:00:00Z",
  "endTime": "2023-10-15T10:00:00Z",
  "status": "cancelled",
  "notes": "Cancellation reason: Service user unavailable",
  "tasks": "[\"Medication\", \"Personal care\", \"Breakfast\"]",
  "priority": "normal",
  "visitType": "medication"
}
```

## Error Responses

### 400 Bad Request

Returned when the request is invalid.

```json
{
  "error": "validation_error",
  "message": "Invalid request body",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["visitType"],
      "message": "Visit type is required"
    }
  ]
}
```

### 401 Unauthorized

Returned when authentication is required.

```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found

Returned when the requested resource is not found.

```json
{
  "error": "not_found",
  "message": "Visit with ID 999 not found"
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs.

```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```
