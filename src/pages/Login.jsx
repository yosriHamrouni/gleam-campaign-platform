// src/pages/Login.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='bg-white w-full max-w-sm rounded-xl shadow p-6 space-y-4'>
        <h1 className='text-xl font-semibold text-gray-800'>Sign in</h1>
        {error && <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2'>{error}</div>}
        <form onSubmit={onSubmit} className='space-y-3'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Email</label>
            <input type='email' value={email} onChange={(e)=>setEmail(e.target.value)} required className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500'/>
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Password</label>
            <input type='password' value={password} onChange={(e)=>setPassword(e.target.value)} required className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500'/>
          </div>
          <button disabled={loading} className='w-full bg-primary-500 text-white rounded-lg py-2 hover:bg-primary-600'>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className='text-sm text-gray-600'>No account? <Link to='/register' className='text-primary-600 hover:underline'>Create one</Link></p>
      </div>
    </div>
  );
}

