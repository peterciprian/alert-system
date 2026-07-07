# Frontend Prompt

This step focuses on the MVP frontend structure. The UI should stay simple and clearly separate the end-user subscription experience from the admin experience.

## Recommended UI structure

### 1. Subscription page
- This is the main public-facing page for users.
- Its job is to let a user create a subscription for one or more alert categories and one or more channels.
- The page should be simple, focused, and easy to understand.
- It should contain a small form, a short explanation of what the app does, and a success or error message after submission.

### 2. Admin page
- This page is for operational tasks rather than the end-user experience.
- It should allow an admin to view current subscriptions and trigger demo events.
- The interface should stay minimal and focused on functionality, not visual complexity.
- It can include a basic list of subscriptions and a button or form to trigger a demo event.

## How to differentiate the two experiences
- The subscription page should feel like a user-facing onboarding or setup experience.
- The admin page should feel like a control panel for managing the system.
- The subscription page should prioritize ease of use and clarity.
- The admin page should prioritize visibility and actionability.

## Suggested UI responsibilities
- Subscription page: collect subscription input, submit it, and show feedback.
- Admin page: inspect subscriptions, trigger demo events, and confirm results.

## MVP UI principles
- Keep the number of pages small.
- Use clear labels and obvious actions.
- Avoid adding dashboard-style complexity that is not needed yet.
- Make the distinction between user setup and admin control very explicit.

## Admin access and authentication
- The MVP should start with a lightweight admin access mechanism rather than a full authentication system.
- The admin page can remain a simple internal control surface for demo and testing purposes.
- The access approach should be designed so it can later evolve into a proper authentication and authorization model without major rework.
- A simple shared secret or environment-based gate is a reasonable first step if protection is needed, but the important part is keeping the boundary clean and extensible.

## Big-picture UI shape
A simple MVP UI can be structured as:
- Home or subscription page for end users
- Admin page for operational tasks

This separation keeps the product easy to understand and makes the roles of each interface clear.
