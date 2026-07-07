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

  const triggerDemoEvent = async () => {
    if (!token) {
      setError('You need to log in first.');
      return;
    }

    setStatus('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/demo-event`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({
          category: 'breaking-news',
          title: 'Demo event',
          message: 'A sample breaking news alert was triggered.'
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
        <button onClick={triggerDemoEvent}>Trigger demo event</button>
        <button className="secondary" onClick={handleLogout} style={{ marginLeft: '8px' }}>Log out</button>
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
