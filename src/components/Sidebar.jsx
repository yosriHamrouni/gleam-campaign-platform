// src/components/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Zap, Gift, Camera, Image, Settings, Users, Bell } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Trophy, label: 'Competitions', path: '/competitions', badge: 2 },
  { icon: Zap, label: 'Quick Draws', path: '/quick-draws' },
  { icon: Gift, label: 'Rewards', path: '/rewards' },
  { icon: Camera, label: 'Captures', path: '/captures' },
  { icon: Image, label: 'Galleries', path: '/galleries' }
]

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Users, label: 'Users', path: '/users', badge: 1 },
  { icon: Bell, label: 'Updates', path: '/updates', badge: 4 }
]

function Sidebar() {
  return (
    <aside className="w-56 bg-dark-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white font-bold">Y</div>
          <span className="text-white font-semibold">Yosrihamrouni</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-gray-700 text-white border-r-2 border-primary-500' : ''
              }`
            }
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-700 py-4">
        <div className="px-4 text-xs text-gray-500 mb-2">Site</div>
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-gray-700 text-white' : ''
              }`
            }
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar