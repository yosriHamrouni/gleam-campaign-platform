// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <button className="text-gray-600 lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <Link to="/competitions/new" className="btn-primary hidden sm:inline-flex">
          <Plus size={16} aria-hidden="true" /> New competition
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 font-bold text-white" aria-hidden="true">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
