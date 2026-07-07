# Alert System MVP

This repository contains a lightweight MVP for an alert system where users can subscribe to world-event categories and receive notifications through supported channels. It also includes a simple admin console for triggering demo events and reviewing recent notification activity.

## What is included

- A small Node.js backend API for subscriptions, demo-event processing, and notification history
- A lightweight Next.js frontend with a public subscription page and an admin page
- A shared frontend auth context for the admin flow
- Documentation covering the problem, assumptions, architecture, API design, validation, and future improvements

## Run locally

1. Start the backend:
   - `cd backend`
   - `npm install`
   - `node server.js`
2. Start the frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
3. Open the app in a browser:
   - Public page: `http://localhost:3000/`
   - Admin page: `http://localhost:3000/admin`

## MVP scope

- Supported channels: email and Slack
- Event categories: breaking news, market movement, natural disaster
- Admin access: lightweight shared-secret authentication with a token stored in local storage
- Storage: in-memory for a fast, self-contained prototype

## Admin authentication

The admin experience currently uses a simple shared-secret token flow:

- The backend accepts the token via the `X-Admin-Token` header or `Authorization: Bearer ...`
- The frontend stores the token in local storage and exposes it through a shared auth context
- The default token is `demo-admin-token`, unless `ADMIN_TOKEN` is set in the backend environment

## Validation notes

The implementation was verified locally by:

- starting the backend server successfully
- calling the health endpoint
- creating a subscription
- triggering a demo event and confirming that matching notifications were generated

## Notes

The implementation is intentionally small and focused so the core design decisions remain visible rather than hidden behind a large framework stack.

# Documentation

## docs

In the `docs` folder there are thematical `.md` files summarizing the requirements, rules, principles, decisions and hard statements that are set along the planning of the project. These are mainly for the AI assistant to consider along the code generation.

## prompts

In the `prompts` folder there are the summaries of the topics discussed with the AI assistant, and there is a history that covers most of the conversation.

# My insights

I really enjoyed this take-home task, I learned a lot by that, and truly questioned my methods of coding with AI assiatance.
Unfortunately I got myself off guard without any AI assistant I used before, since my Copilot account got cancelled a couple days ago and my Claude account hasn't renewed yet so I tried Windsurf, that I never used before. I'm sure my implementation is not flawless, but the documentation I compiled while planing and implementing my solution is exstensive and hopefully descriptive.
I really hope we can move forward, but if that were not the case, thanks for the opportunity!

