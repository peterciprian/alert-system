import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Admin-Token': token, Authorization: `Bearer ${token}` } : {})
  };
}

export default function Admin() {
  const { token, isAuthenticated, isLoading, login, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loginValue, setLoginValue] = useState('');
  const [eventCategory, setEventCategory] = useState('breaking-news');
  const [eventTitle, setEventTitle] = useState('Demo event');
  const [eventMessage, setEventMessage] = useState('A sample alert was triggered from the admin console.');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadData = async (activeToken) => {
    if (!activeToken) {
      setSubscriptions([]);
      setNotifications([]);
      return;
    }

    try {
      const [subscriptionsResponse, notificationsResponse] = await Promise.all([
        fetch(`${API_BASE}/subscriptions`, { headers: buildHeaders(activeToken) }),
        fetch(`${API_BASE}/admin/notifications`, { headers: buildHeaders(activeToken) })
      ]);

      if (subscriptionsResponse.status === 401 || notificationsResponse.status === 401) {
        throw new Error('Unauthorized');
      }

      const subscriptionsData = await subscriptionsResponse.json();
      const notificationsData = await notificationsResponse.json();

      setSubscriptions(subscriptionsData.subscriptions || []);
      setNotifications(notificationsData.notifications || []);
      setError('');
    } catch (err) {
      setSubscriptions([]);
      setNotifications([]);
      if (err.message === 'Unauthorized') {
        setError('Session expired. Please log in again.');
      } else {
        setError('Unable to load admin data');
      }
    }
  };

  useEffect(() => {
    if (token) {
      loadData(token);
    }
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      await login(loginValue);
      setStatus('Authenticated');
      setLoginValue('');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    logout();
    setSubscriptions([]);
    setNotifications([]);
    setStatus('');
    setError('');
  };

  const triggerDemoEvent = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!token) {
      setError('You need to log in first.');
      return;
    }

    if (!eventTitle.trim() || !eventMessage.trim()) {
      setError('Please provide both a title and a message.');
      return;
    }

    setStatus('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/demo-event`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({
          category: eventCategory,
          title: eventTitle.trim(),
          message: eventMessage.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Demo event failed');
      }

      setStatus(`Processed ${data.matchedSubscriptions} subscriptions`);
      loadData(token);
    } catch (err) {
      setError(err.message || 'Demo event failed');
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <main>
        <nav>
          <Link href="/">Subscription</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <section className="card">
          <h1>Admin login</h1>
          <p>Enter the admin token to access the admin tools.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin token"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              required
            />
            <button type="submit">Log in</button>
          </form>
          {error ? <p className="message error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main>
      <nav>
        <Link href="/">Subscription</Link>
        <Link href="/admin">Admin</Link>
      </nav>

      <section className="card">
        <h1>Admin</h1>
        <p>Trigger demo events and review current subscriptions and notification activity.</p>
        <form onSubmit={triggerDemoEvent}>
          <label>
            <span>Title</span>
            <input
              type="text"
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Message</span>
            <textarea
              value={eventMessage}
              onChange={(event) => setEventMessage(event.target.value)}
              rows={4}
              required
            />
          </label>
          <label>
            <span>Category</span>
            <select value={eventCategory} onChange={(event) => setEventCategory(event.target.value)}>
              <option value="breaking-news">Breaking news</option>
              <option value="market-movement">Market movement</option>
              <option value="natural-disaster">Natural disaster</option>
            </select>
          </label>
          <div>
            <button type="submit">Trigger demo event</button>
            <button type="button" className="secondary" onClick={handleLogout} style={{ marginLeft: '8px' }}>Log out</button>
          </div>
        </form>
        {status ? <p className="message">{status}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
      </section>

      <section className="card">
        <h2>Subscriptions</h2>
        {subscriptions.length === 0 ? <p>No subscriptions yet.</p> : (
          <ul>
            {subscriptions.map((subscription) => (
              <li key={subscription.id}>
                {subscription.email} · {subscription.channel} · {subscription.categories.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Recent notifications</h2>
        {notifications.length === 0 ? <p>No notifications yet.</p> : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                {notification.channel} · {notification.status} · {notification.eventId}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
