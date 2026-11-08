// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <p className="text-gray-700">This page does not exist.</p>
      <Link to="/" className="btn-primary">
        Go to the dashboard
      </Link>
    </div>
  );
}
