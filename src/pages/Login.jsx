// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import { ErrorBox } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle={from?.pathname?.startsWith('/c/') ? 'Sign in to save your entry.' : 'Manage your giveaway campaigns.'}
      footer={
        <>
          No account?{' '}
          <Link to="/register" state={{ from }} className="font-medium text-primary-700 hover:underline">Create one</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBox error={error} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  );
}
