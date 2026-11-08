// src/components/Header.jsx
import React from 'react'
import { Bell, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-gray-700 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-white bg-primary-500 px-4 py-2 rounded-lg hover:bg-primary-600">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
