// src/components/AuthCard.jsx
import React from 'react';

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold text-white">G</div>
          <span className="text-lg font-semibold text-white">Gleam Campaigns</span>
        </div>
        <div className="card space-y-5 p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          {children}
          {footer && <p className="text-center text-sm text-gray-600">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
