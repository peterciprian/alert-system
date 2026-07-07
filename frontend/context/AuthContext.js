import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = window.localStorage.getItem('admin-token') || '';

    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const login = async (submittedToken) => {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: submittedToken })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    window.localStorage.setItem('admin-token', submittedToken);
    setToken(submittedToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    window.localStorage.removeItem('admin-token');
    setToken('');
    setIsAuthenticated(false);
  };

  const value = useMemo(() => ({
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  }), [token, isAuthenticated, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
