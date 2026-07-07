# Backend Prompt

This step focuses on the backend architecture for the MVP. The backend should stay simple and focused on three responsibilities: managing subscriptions, processing events and notifications, and serving data for the admin experience.

## Recommended backend structure

### 1. API layer
- Expose a small set of endpoints for subscription creation, listing subscriptions, and triggering demo events.
- Keep the API thin and focused on request handling.
- Return simple responses that are easy for the frontend to consume.

### 2. Application/service layer
- Contain the core business logic for creating subscriptions, matching events to subscribers, and dispatching notifications.
- Keep the business rules in one place so the rest of the system stays simple.
- This layer should not be tightly coupled to the frontend or to any one delivery channel.

### 3. Domain model
- Represent the core concepts clearly: subscription, event, notification, and admin action.
- Keep the model small and focused on the MVP needs.
- Avoid over-modeling concepts that are not needed yet.

### 4. Repository/data layer
- Provide a simple storage abstraction for subscriptions and event-related data.
- The initial implementation can use in-memory storage for speed and simplicity.
- The repository layer should be isolated so storage can change later without rewriting the rest of the backend.

### 5. Notification delivery layer
- Handle the routing of a notification to the appropriate channel adapters.
- Keep the delivery mechanism behind an interface so email and Slack are supported through a consistent pattern.
- For the MVP, this can be a very small layer that runs synchronously.

## Suggested backend responsibilities
- Subscription management: create, read, and validate subscriptions.
- Event processing: receive or trigger an event and determine who should be notified.
- Notification dispatch: send notifications through the selected channel adapters.
- Admin support: provide the data needed for the admin view, such as subscriptions and recent demo actions.

## Architectural principles for the backend
- Keep the backend modular but lightweight.
- Use clear separation between transport, application logic, and data access.
- Favor simplicity over abstraction unless it clearly improves maintainability.
- Avoid introducing asynchronous infrastructure or complex orchestration at this stage.

## Big-picture backend shape
A simple MVP backend can be seen as:
- API layer → service layer → repository layer → notification adapters

That structure is enough to support the subscription flow, the notification flow, and the admin functionality without overengineering the first release.
