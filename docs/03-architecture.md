# Architecture

This document captures the agreed MVP architecture direction for the alerting system. The goal is to keep the first version simple, understandable, and easy to extend later without introducing unnecessary complexity.

## Overall approach
- Use a simple client-server structure with a Next.js frontend and a lightweight backend service.
- Keep the frontend focused on the subscription experience and the minimal admin experience.
- Keep the backend responsible for subscription management, event handling, and notification orchestration.
- Use a small abstraction for notification channels so email and Slack can be supported without tightly coupling the event flow to either provider.

## Core flows

### 1. Subscription flow
- The user interacts with a simple subscription form in the frontend.
- The frontend sends the subscription data to the backend.
- The backend performs basic validation and stores the subscription in a simple repository.
- This flow stays intentionally simple for the MVP.

### 2. Admin flow
- The admin interface is intentionally minimal and focused on the core operational needs.
- Admin users can view existing subscriptions and trigger demo events.
- The backend exposes a few small endpoints for these actions and returns simple status feedback.
- There is no dashboard or history layer in the MVP yet.

### 3. Notification delivery flow
- An event is created, either through an admin trigger or another future event source.
- The backend evaluates which subscriptions match the event based on the event category and the subscriber preferences.
- The backend then routes the notification through a channel abstraction rather than hard-coding email or Slack logic into the event flow.
- The channel abstraction sends the notification to one or more channel adapters, such as email and Slack.
- For the MVP, this is handled synchronously in the same request flow for simplicity.
- The main benefit is that the core event flow stays clean while the delivery logic remains replaceable and extendable.
- If a channel fails, the MVP can report the failure in a simple way without introducing queueing complexity.

## Architectural principles
- Keep the system modular enough to separate concerns without introducing unnecessary layers.
- Favor a small number of clearly defined responsibilities.
- Keep the initial implementation easy to demo and easy to explain.
- Avoid introducing queueing, background workers, or other operational complexity unless the product clearly requires them.

## MVP stance
- The architecture is intentionally simple for now.
- The first version should prioritize working behavior over architectural sophistication.
- The design should remain easy to evolve later if the product grows.