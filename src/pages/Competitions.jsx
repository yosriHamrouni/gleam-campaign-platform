// src/pages/Competitions.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Plus, Search, Trophy, Users } from 'lucide-react';
import { api } from '../lib/api';
import { percent, timing } from '../lib/format';
import { EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge } from '../components/ui';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'ended', label: 'To draw' },
  { id: 'drawn', label: 'Drawn' },
];

export default function Competitions() {
  const [competitions, setCompetitions] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api('/competitions').then(setCompetitions).catch(setError);
  }, []);

  const counts = useMemo(() => {
    const c = { all: competitions?.length || 0 };
    for (const item of competitions || []) c[item.status] = (c[item.status] || 0) + 1;
    return c;
  }, [competitions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (competitions || []).filter(
      (c) => (tab === 'all' || c.status === tab) && (!q || c.title.toLowerCase().includes(q))
    );
  }, [competitions, tab, query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Competitions" subtitle="Every campaign you have created.">
        <Link to="/competitions/new" className="btn-primary">
          <Plus size={18} aria-hidden="true" /> New competition
        </Link>
      </PageHeader>

      <ErrorBox error={error} />

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 sm:px-6">
          <div className="-mb-px flex gap-4 overflow-x-auto" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm transition-colors ${
                  tab === t.id ? 'border-primary-500 font-medium text-primary-700' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.label}
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{counts[t.id] || 0}</span>
              </button>
            ))}
          </div>
          <label className="relative my-2 w-full sm:w-64">
            <span className="sr-only">Search competitions</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title" className="input pl-9 text-sm" />
          </label>
        </div>

        {!competitions && !error ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState icon={Trophy} title={competitions?.length ? 'No competitions match' : 'No competitions yet'}>
            {!competitions?.length && <Link to="/competitions/new" className="btn-primary mt-4">Create your first one</Link>}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                  <th className="px-6 py-3 font-medium">Views</th>
                  <th className="px-6 py-3 font-medium">Participants</th>
                  <th className="px-6 py-3 font-medium">Entries</th>
                  <th className="px-6 py-3 font-medium">Entry rate</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/competitions/${c.id}`} className="font-medium text-gray-900 hover:text-primary-700">
                        {c.title}
                      </Link>
                      <p className="text-xs text-gray-500">{timing(c)}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-gray-700">{c.actions.length}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1.5"><Eye size={14} className="text-gray-400" aria-hidden="true" />{c.impressions}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-gray-400" aria-hidden="true" />{c.participants}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{c.totalEntries}</td>
                    <td className="px-6 py-4 text-gray-700">{percent(c.participants, c.impressions)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/competitions/${c.id}`} className="btn-secondary px-3 py-1.5">Manage</Link>
                        <a href={`/c/${c.id}`} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5" title="Open the public page">
                          <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">Open public page</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
