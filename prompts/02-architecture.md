# Architecture Prompt

This step focuses on the big-picture architecture for the MVP. The goal is to keep the system simple, understandable, and extensible while covering three core flows: subscription, admin operations, and notification delivery.

## High-level architectural direction
- Use a simple client-server structure with a Next.js frontend and a lightweight backend service.
- Keep the frontend focused on user interaction and admin management.
- Keep the backend responsible for subscription management, event handling, and notification orchestration.
- Introduce a clear abstraction for notification channels so email and Slack can be supported without tightly coupling the workflow to either one.

## Recommended big-picture structure
### 1. Subscription flow
- The user interacts with a simple subscription form in the frontend.
- The frontend sends the subscription data to the backend.
- The backend performs basic validation and stores the subscription in a simple repository.
- This remains intentionally simple, with room to add richer rules later if the product grows.

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
- For the MVP, this can be handled in a straightforward synchronous way: the event request triggers the matching and delivery process immediately.
- The main benefit of this structure is that the core event flow stays clean while the actual delivery logic remains replaceable and extendable.
- If a channel fails, the MVP can report the failure in a simple way and keep the system understandable without introducing queueing complexity.

## Architectural principles for the MVP
- Keep the system modular enough to separate concerns without introducing unnecessary layers.
- Favor a small number of clearly defined services and components.
- Design the channel mechanism so it can grow later without rewriting the core flow.
- Keep the initial implementation easy to demo and easy to explain.

## Alternatives and tradeoffs

### A. Subscription flow alternatives

1. Simple form -> API -> repository
- Description: The frontend collects subscription input, sends it to a backend endpoint, and the backend stores it in a simple repository.
- Advantages: Very simple, easy to implement, and easy to explain.
- Disadvantages: Limited flexibility if subscription rules become more complex later.
- Scalability: Good enough for an MVP and small to medium traffic.
- Cost of future changes: Moderate; adding richer rules or validation later will require some refactoring.
- Recommended when: The MVP is focused on proving the core workflow quickly.

2. Form -> API -> service layer -> repository
- Description: The backend uses a dedicated service layer to handle validation, normalization, and domain rules before storage.
- Advantages: Cleaner separation of concerns and easier future growth.
- Disadvantages: Slightly more structure than needed for a very small MVP.
- Scalability: Good for a slightly more structured product.
- Cost of future changes: Lower than the simpler option when the domain logic grows.
- Recommended when: You expect subscription rules to become more nuanced soon.

### B. Admin flow alternatives

1. Lightweight admin page with direct backend calls
- Description: A simple admin page calls backend endpoints to list subscriptions and trigger demo events.
- Advantages: Fastest to build and easiest to reason about.
- Disadvantages: Less polished if admin needs richer insights later.
- Scalability: Good for MVP and small operational use.
- Cost of future changes: Moderate; adding richer admin features may require UI restructuring.
- Recommended when: The admin experience is intentionally minimal.

2. Admin dashboard with a small stateful view and activity history
- Description: The admin view includes a dashboard with subscription summaries and a recent activity section.
- Advantages: Better for operational visibility and easier to demo.
- Disadvantages: Slightly more UI and backend work than a minimal admin page.
- Scalability: Good for future growth.
- Cost of future changes: Lower than the minimal option if admin needs more monitoring features later.
- Recommended when: The admin experience is important to the product story.

### C. Notification delivery alternatives

1. Synchronous delivery in the request flow
- Description: When an event is triggered, the backend sends notifications immediately as part of the same request cycle.
- Advantages: Easiest to build and easiest to understand.
- Disadvantages: Slower if delivery is slow, and less resilient if a channel fails.
- Scalability: Fine for an MVP and small volumes.
- Cost of future changes: Moderate; moving to asynchronous processing later will be a meaningful change.
- Recommended when: Fastest path to a working demo is the priority.

2. Event processing through a simple internal orchestration layer
- Description: The backend creates a notification job or workflow step that can route to one or more channel adapters.
- Advantages: Cleaner separation of event handling and delivery, better foundation for future complexity.
- Disadvantages: Slightly more abstraction than needed for the first version.
- Scalability: Better than synchronous delivery for growth.
- Cost of future changes: Lower because the delivery process is more structured.
- Recommended when: You want a slightly more future-ready core even in the MVP.

## Practical recommendation
- For the subscription flow, the simpler form-to-API-to-repository approach is the best MVP fit.
- For the admin flow, a lightweight admin page with direct backend calls is the best balance of speed and clarity, without adding dashboard or history features yet.
- For notification delivery, the simplest MVP-friendly approach is synchronous delivery inside the event-handling flow, with a small channel abstraction behind it. This keeps the first version easy to build while still leaving a clean path for future improvement.

## Final MVP stance
- We are keeping the architecture deliberately simple for now.
- No queueing, no background worker, and no extra operational layers are needed at this stage.
- The goal is to deliver a working MVP quickly and keep the design understandable.