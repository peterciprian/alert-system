import { useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [email, setEmail] = useState('');
  const [channel, setChannel] = useState('email');
  const [categories, setCategories] = useState(['breaking-news']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleCategory = (category) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, channel, categories })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Subscription failed');
      }

      setMessage(`Subscription created for ${data.email}`);
      setEmail('');
      setChannel('email');
      setCategories(['breaking-news']);
    } catch (err) {
      setError(err.message || 'Subscription failed');
    }
  };

  return (
    <main>
      <nav>
        <Link href="/">Subscription</Link>
        <Link href="/admin">Admin</Link>
      </nav>

      <section className="card">
        <h1>Alert subscriptions</h1>
        <p>Subscribe to important world events and receive notifications through your preferred channel.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <select value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
          </select>

          <div className="checkbox-group">
            <label><input type="checkbox" checked={categories.includes('breaking-news')} onChange={() => toggleCategory('breaking-news')} /> Breaking news</label>
            <label style={{ marginLeft: '12px' }}><input type="checkbox" checked={categories.includes('market-movement')} onChange={() => toggleCategory('market-movement')} /> Market movement</label>
            <label style={{ marginLeft: '12px' }}><input type="checkbox" checked={categories.includes('natural-disaster')} onChange={() => toggleCategory('natural-disaster')} /> Natural disaster</label>
          </div>

          <button type="submit">Create subscription</button>
        </form>

        {message ? <p className="message">{message}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
      </section>
    </main>
  );
}
