// src/pages/Dashboard.jsx
import React from 'react'
import { Trophy, Users, TrendingUp, Award } from 'lucide-react'

function Dashboard() {
  const [competitions, setCompetitions] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    fetch('http://localhost:3009/api/competitions')
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (alive) setCompetitions(Array.isArray(data) ? data : []) })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const now = new Date()
  const isActive = (c) => {
    const s = new Date(c.startDate)
    const e = new Date(c.endDate)
    return !Number.isNaN(s) && !Number.isNaN(e) && s <= now && e >= now
  }

  const activeCount = competitions.filter(isActive).length
  const totalParticipants = competitions.reduce((sum, c) => sum + (Number(c.participants) || 0), 0)
  const totalImpressions = competitions.reduce((sum, c) => sum + (Number(c.impressions) || 0), 0)
  const totalEntries = competitions.reduce((sum, c) => sum + (Number(c.totalEntries) || 0), 0)
  const engagement = totalImpressions > 0 ? Math.round((totalEntries / totalImpressions) * 100) : 0

  const stats = [
    { icon: Trophy, label: 'Active Competitions', value: String(activeCount), color: 'bg-blue-500' },
    { icon: Users, label: 'Total Participants', value: String(totalParticipants), color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Engagement Rate', value: `${engagement}%`, color: 'bg-purple-500' },
    { icon: Award, label: 'Rewards Distributed', value: '0', color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No recent activity</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {competitions
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((c) => (
                  <li key={c._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-500">Created {new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-gray-600">Participants: {c.participants ?? 0}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Competitions</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            (() => {
              const upcoming = competitions
                .filter(c => new Date(c.startDate) > now)
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .slice(0, 5)
              if (upcoming.length === 0) return <div className="text-center py-12 text-gray-500">No upcoming competitions</div>
              return (
                <ul className="divide-y divide-gray-200">
                  {upcoming.map(c => (
                    <li key={c._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{c.title}</p>
                        <p className="text-xs text-gray-500">Starts {new Date(c.startDate).toLocaleString()}</p>
                      </div>
                      <span className="text-sm text-gray-600">Ends {new Date(c.endDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )
            })()
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Competitions</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            (() => {
              const active = competitions.filter(isActive).sort((a,b) => new Date(a.endDate) - new Date(b.endDate));
              if (active.length === 0) return <div className="text-center py-12 text-gray-500">No active competitions</div>
              return (
                <ul className="divide-y divide-gray-200">
                  {active.slice(0,5).map(c => (
                    <li key={c._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{c.title}</p>
                        <p className="text-xs text-gray-500">Ends {new Date(c.endDate).toLocaleString()}</p>
                      </div>
                      <span className="text-sm text-gray-600">Participants: {c.participants ?? 0}</span>
                    </li>
                  ))}
                </ul>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
