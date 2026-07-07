# Alert System MVP

This repository contains a lightweight implementation of the alert-system brief: users can create alert subscriptions for important world events, receive notifications through supported channels, and view an admin console that can trigger demo events.

## What is included

- A simple backend API for creating subscriptions and processing alert events
- A lightweight frontend for subscribing and monitoring notifications
- A documentation set covering the brief, architecture, API design, assumptions, validation, and future improvements
- Prompt history and planning notes to make the process transparent

## Run locally

1. Start the backend:
   - `node backend/server.js`
2. Open the app in a browser:
   - `http://localhost:3000/`

## MVP scope

- Supported channels: email and Slack
- Event categories: breaking news, market movement, natural disaster
- Admin view: trigger demo events and review notification history
- Storage: in-memory for a fast, self-contained prototype

## Validation notes

The implementation was verified locally by:

- starting the backend server successfully
- calling the health endpoint
- triggering a demo event and confirming that a matching notification was generated

## Notes

The implementation is intentionally small and focused so the design decisions remain visible rather than hidden behind a large framework stack.
