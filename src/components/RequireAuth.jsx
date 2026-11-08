// src/components/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className='p-6 text-gray-600'>Checking session...</div>;
  if (!token) return <Navigate to='/login' replace state={{ from: loc }} />;
  return children;
}

