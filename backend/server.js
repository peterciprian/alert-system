const http = require('http');
const { URL } = require('url');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo-admin-token';
const supportedChannels = ['email', 'slack'];
const supportedCategories = ['breaking-news', 'market-movement', 'natural-disaster'];

const subscriptions = [];
const notifications = [];

let subscriptionSeq = 1;
let notificationSeq = 1;
let eventSeq = 1;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token'
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, code, message) {
  sendJson(res, statusCode, {
    error: {
      code,
      message
    }
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', () => {
      reject(new Error('Failed to read request body'));
    });
  });
}

function getAdminToken(req) {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const headerToken = req.headers['x-admin-token'];

  if (typeof headerToken === 'string' && headerToken.trim() !== '') {
    return headerToken;
  }

  return bearerToken;
}

function isAdminAuthenticated(req) {
  return getAdminToken(req) === ADMIN_TOKEN;
}

function requireAdminAuth(req, res) {
  if (!isAdminAuthenticated(req)) {
    sendError(res, 401, 'UNAUTHORIZED', 'Admin access required.');
    return false;
  }

  return true;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateSubscriptionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, code: 'INVALID_REQUEST', message: 'Request body must be a JSON object.' };
  }

  if (typeof payload.email !== 'string' || !isValidEmail(payload.email)) {
    return { valid: false, code: 'INVALID_EMAIL', message: 'A valid email address is required.' };
  }

  if (typeof payload.channel !== 'string' || !supportedChannels.includes(payload.channel)) {
    return { valid: false, code: 'UNSUPPORTED_CHANNEL', message: 'Channel must be either email or slack.' };
  }

  if (!Array.isArray(payload.categories) || payload.categories.length === 0) {
    return { valid: false, code: 'INVALID_CATEGORIES', message: 'At least one category is required.' };
  }

  const invalidCategories = payload.categories.filter((category) => !supportedCategories.includes(category));
  if (invalidCategories.length > 0) {
    return { valid: false, code: 'UNSUPPORTED_CATEGORY', message: 'One or more categories are not supported.' };
  }

  return { valid: true };
}

function validateDemoEventPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, code: 'INVALID_REQUEST', message: 'Request body must be a JSON object.' };
  }

  if (typeof payload.category !== 'string' || !supportedCategories.includes(payload.category)) {
    return { valid: false, code: 'UNSUPPORTED_CATEGORY', message: 'Category must be a supported event category.' };
  }

  if (typeof payload.title !== 'string' || payload.title.trim() === '') {
    return { valid: false, code: 'INVALID_TITLE', message: 'Title is required.' };
  }

  if (typeof payload.message !== 'string' || payload.message.trim() === '') {
    return { valid: false, code: 'INVALID_MESSAGE', message: 'Message is required.' };
  }

  return { valid: true };
}

function serializeSubscription(subscription) {
  return {
    id: subscription.id,
    email: subscription.email,
    channel: subscription.channel,
    categories: subscription.categories,
    createdAt: subscription.createdAt
  };
}

function serializeNotification(notification) {
  return {
    id: notification.id,
    eventId: notification.eventId,
    subscriptionId: notification.subscriptionId,
    channel: notification.channel,
    status: notification.status,
    createdAt: notification.createdAt,
    errorMessage: notification.errorMessage
  };
}

function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and optionally SMTP_PORT/SMTP_SECURE.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function dispatchNotification(event, subscription) {
  if (subscription.channel === 'email') {
    try {
      const transporter = getEmailTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: subscription.email,
        subject: event.title,
        text: `${event.message}\n\nCategory: ${event.category}`
      });

      return {
        status: 'sent',
        errorMessage: null
      };
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error.message
      };
    }
  }

  if (subscription.channel === 'slack') {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return {
        status: 'failed',
        errorMessage: 'SLACK_WEBHOOK_URL is not configured.'
      };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${event.title}*\n${event.message}\nCategory: ${event.category}`
        })
      });

      if (!response.ok) {
        throw new Error(`Slack webhook responded with ${response.status}`);
      }

      return {
        status: 'sent',
        errorMessage: null
      };
    } catch (error) {
      return {
        status: 'failed',
        errorMessage: error.message
      };
    }
  }

  try {
    console.log(`[notification] ${subscription.channel} -> ${subscription.email} :: ${event.title}`);
  } catch (error) {
    return {
      status: 'failed',
      errorMessage: error.message
    };
  }

  return {
    status: 'sent',
    errorMessage: null
  };
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/subscriptions') {
    try {
      const payload = await readJsonBody(req);
      const validation = validateSubscriptionPayload(payload);

      if (!validation.valid) {
        sendError(res, 400, validation.code, validation.message);
        return;
      }

      const duplicate = subscriptions.find((subscription) => (
        subscription.email === payload.email &&
        subscription.channel === payload.channel &&
        JSON.stringify(subscription.categories) === JSON.stringify(payload.categories)
      ));

      if (duplicate) {
        sendError(res, 409, 'DUPLICATE_SUBSCRIPTION', 'A matching subscription already exists.');
        return;
      }

      const subscription = {
        id: `sub_${subscriptionSeq++}`,
        email: payload.email,
        channel: payload.channel,
        categories: payload.categories,
        createdAt: new Date().toISOString()
      };

      subscriptions.push(subscription);
      sendJson(res, 201, serializeSubscription(subscription));
      return;
    } catch (error) {
      sendError(res, 400, 'INVALID_REQUEST', error.message || 'Invalid request body');
      return;
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/subscriptions') {
    if (!requireAdminAuth(req, res)) {
      return;
    }

    sendJson(res, 200, {
      subscriptions: subscriptions.map(serializeSubscription)
    });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin/login') {
    try {
      const payload = await readJsonBody(req);
      const submittedToken = typeof payload.token === 'string' ? payload.token : '';

      if (submittedToken === ADMIN_TOKEN) {
        sendJson(res, 200, { ok: true });
        return;
      }

      sendError(res, 401, 'UNAUTHORIZED', 'Invalid admin token.');
      return;
    } catch (error) {
      sendError(res, 400, 'INVALID_REQUEST', error.message || 'Invalid request body');
      return;
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin/demo-event') {
    if (!requireAdminAuth(req, res)) {
      return;
    }

    try {
      const payload = await readJsonBody(req);
      const validation = validateDemoEventPayload(payload);

      if (!validation.valid) {
        sendError(res, 400, validation.code, validation.message);
        return;
      }

      const event = {
        id: `evt_${eventSeq++}`,
        category: payload.category,
        title: payload.title,
        message: payload.message,
        createdAt: new Date().toISOString()
      };

      const matchedSubscriptions = subscriptions.filter((subscription) => subscription.categories.includes(event.category));

      const deliveryResults = await Promise.all(matchedSubscriptions.map(async (subscription) => {
        const deliveryResult = await dispatchNotification(event, subscription);
        return {
          subscription,
          deliveryResult
        };
      }));

      deliveryResults.forEach(({ subscription, deliveryResult }) => {
        notifications.push({
          id: `notif_${notificationSeq++}`,
          eventId: event.id,
          subscriptionId: subscription.id,
          channel: subscription.channel,
          status: deliveryResult.status,
          createdAt: new Date().toISOString(),
          errorMessage: deliveryResult.errorMessage
        });
      });

      sendJson(res, 200, {
        eventId: event.id,
        status: 'processed',
        matchedSubscriptions: matchedSubscriptions.length
      });
      return;
    } catch (error) {
      sendError(res, 400, 'INVALID_REQUEST', error.message || 'Invalid request body');
      return;
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin/notifications') {
    if (!requireAdminAuth(req, res)) {
      return;
    }

    sendJson(res, 200, {
      notifications: notifications.map(serializeNotification)
    });
    return;
  }

  sendError(res, 404, 'NOT_FOUND', 'Route not found');
});

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
