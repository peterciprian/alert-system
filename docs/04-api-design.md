# API Design

This document defines the MVP API surface for the alerting system. The goal is to keep the API small, clear, and easy to consume from the frontend while supporting the subscription flow, notification flow, and the minimal admin experience.

## API design principles
- Keep the API simple and resource-oriented.
- Use clear, predictable request and response shapes.
- Prefer straightforward validation and descriptive errors.
- Keep the API aligned with the MVP scope and avoid over-generalization.

## Core endpoints

### 1. Health check
- GET /health
- Purpose: confirm that the backend is running.
- Response:
  - 200 OK
  - { "status": "ok" }

### 2. Create subscription
- POST /subscriptions
- Purpose: create a new alert subscription.
- Request body:
  - {
      "email": "user@example.com",
      "channel": "email",
      "categories": ["breaking-news", "natural-disaster"]
    }
- Suggested validation:
  - email must be a valid email address
  - channel must be supported
  - categories must be non-empty and contain supported values
- Success response:
  - 201 Created
  - {
      "id": "sub_123",
      "email": "user@example.com",
      "channel": "email",
      "categories": ["breaking-news", "natural-disaster"],
      "createdAt": "2026-07-07T10:00:00Z"
    }
- Error responses:
  - 400 Bad Request for validation failures
  - 409 Conflict if a duplicate subscription already exists

### 3. List subscriptions
- GET /subscriptions
- Purpose: retrieve all active subscriptions for the admin view or debugging.
- Success response:
  - 200 OK
  - {
      "subscriptions": [
        {
          "id": "sub_123",
          "email": "user@example.com",
          "channel": "email",
          "categories": ["breaking-news"],
          "createdAt": "2026-07-07T10:00:00Z"
        }
      ]
    }

### 4. Trigger demo event
- POST /admin/demo-event
- Purpose: allow the admin UI to trigger a sample event for testing.
- Request body:
  - {
      "category": "breaking-news",
      "title": "Demo event",
      "message": "A sample breaking news alert"
    }
- Success response:
  - 200 OK
  - {
      "eventId": "evt_123",
      "status": "processed",
      "matchedSubscriptions": 2
    }
- Error responses:
  - 400 Bad Request for invalid category or missing fields
  - 500 Internal Server Error if delivery fails unexpectedly

### 5. List notifications or delivery attempts
- GET /admin/notifications
- Purpose: provide the admin view with recent notification activity.
- Success response:
  - 200 OK
  - {
      "notifications": [
        {
          "id": "notif_1",
          "eventId": "evt_123",
          "subscriptionId": "sub_123",
          "channel": "email",
          "status": "sent",
          "createdAt": "2026-07-07T10:05:00Z"
        }
      ]
    }

## Suggested data structures

### Subscription
- id: string
- email: string
- channel: string
- categories: string[]
- createdAt: string
- updatedAt: string | null

### Event
- id: string
- category: string
- title: string
- message: string
- createdAt: string

### Notification
- id: string
- eventId: string
- subscriptionId: string
- channel: string
- status: string
- createdAt: string
- errorMessage: string | null

## Error handling guidance
- Use consistent error responses with a simple shape:
  - {
      "error": {
        "code": "INVALID_REQUEST",
        "message": "The request payload is invalid."
      }
    }
- Recommended status codes:
  - 400 Bad Request for malformed input or validation issues
  - 404 Not Found for missing resources
  - 409 Conflict for duplicate subscriptions
  - 500 Internal Server Error for unexpected failures
- Validation errors should be explicit and easy for the frontend to display.
- For MVP simplicity, keep errors as a small object rather than introducing a complex error framework.

## Notes for the MVP
- The API can remain very small and still cover the main flows.
- The structure should be easy to extend later if more event categories, channels, or admin features are introduced.
- The design should stay easy to understand for both frontend and backend developers.