import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Admin() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [subscriptionsResponse, notificationsResponse] = await Promise.all([
        fetch(`${API_BASE}/subscriptions`),
        fetch(`${API_BASE}/admin/notifications`)
      ]);

      const subscriptionsData = await subscriptionsResponse.json();
      const notificationsData = await notificationsResponse.json();

      setSubscriptions(subscriptionsData.subscriptions || []);
      setNotifications(notificationsData.notifications || []);
    } catch (err) {
      setError('Unable to load admin data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerDemoEvent = async () => {
    setStatus('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/demo-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      loadData();
    } catch (err) {
      setError(err.message || 'Demo event failed');
    }
  };

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
