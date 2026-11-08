// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Trophy, X } from 'lucide-react';

const items = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Trophy, label: 'Competitions', path: '/competitions', end: true },
  { icon: PlusCircle, label: 'New competition', path: '/competitions/new' },
];

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 font-bold text-white">G</div>
      <span className="font-semibold text-white">Gleam Campaigns</span>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-dark-800 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <Logo />
          <button className="text-gray-400 hover:text-white lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'border-r-2 border-primary-500 bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon size={20} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="border-t border-gray-700 p-4 text-xs text-gray-500">
          Participants enter through each campaign’s public link.
        </p>
      </aside>
    </>
  );
}
