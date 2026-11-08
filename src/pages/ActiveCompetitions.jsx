// src/pages/ActiveCompetitions.jsx
import React, { useMemo } from 'react';
import { Eye, Users } from 'lucide-react';

export default function ActiveCompetitions({ items = [] }) {
  const competitions = useMemo(() => {
    const toDays = (endDate) => {
      if (!endDate) return null;
      const end = new Date(endDate).getTime();
      if (Number.isNaN(end)) return null;
      const ms = end - Date.now();
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      return days < 0 ? 0 : days;
    };

    return (items || []).map((c) => {
      const days = toDays(c.endDate);
      return {
        id: c._id || c.id || c.title || Math.random().toString(36).slice(2),
        name: c.title || c.name || 'Untitled',
        impressions: typeof c.impressions === 'number' ? c.impressions : 0,
        actions: Array.isArray(c.actions) ? c.actions.length : (typeof c.actions === 'number' ? c.actions : 0),
        users: typeof c.participants === 'number' ? c.participants : 0,
        conversionRate: typeof c.conversionRate === 'number' ? c.conversionRate : null,
        endsIn: days == null ? '-' : `${days} day${days === 1 ? '' : 's'}`,
      };
    });
  }, [items]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Enter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {competitions.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2"><Eye size={16} className="text-gray-400" /> {c.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{c.actions.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2"><Users size={16} className="text-gray-400" /> {c.users.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{c.conversionRate == null ? '—' : `${c.conversionRate}%`}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Ends in {c.endsIn}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/competitions/${c.id}`} className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm">Enter</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
