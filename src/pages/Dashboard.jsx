// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Gift, Ticket, Trophy, Users } from 'lucide-react';
import { api } from '../lib/api';
import { percent, timing } from '../lib/format';
import { EmptyState, ErrorBox, PageHeader, Spinner, StatCard, StatusBadge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

function CompetitionList({ title, items, empty, renderMeta }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((c) => (
            <li key={c.id}>
              <Link to={`/competitions/${c.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{renderMeta(c)}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/competitions').then(setCompetitions).catch(setError);
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!competitions) return <Spinner />;

  const by = (s) => competitions.filter((c) => c.status === s);
  const sum = (key) => competitions.reduce((n, c) => n + (c[key] || 0), 0);
  const participants = sum('participants');
  const impressions = sum('impressions');
  const winners = competitions.reduce((n, c) => n + (c.winners?.length || 0), 0);
  const needsDraw = by('ended');

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}. Here’s how your campaigns are doing.`} />

      {competitions.length === 0 ? (
        <div className="card">
          <EmptyState icon={Gift} title="No campaigns yet">
            <p>Create your first giveaway and share its link.</p>
            <Link to="/competitions/new" className="btn-primary mt-4">Create a competition</Link>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Trophy} label="Active competitions" value={by('active').length} hint={`${by('scheduled').length} scheduled`} color="bg-blue-500" />
            <StatCard icon={Users} label="Participants" value={participants} hint={`${sum('totalEntries')} entries in total`} color="bg-green-500" />
            <StatCard icon={Ticket} label="Entry rate" value={percent(participants, impressions)} hint={`${impressions} page views`} color="bg-purple-500" />
            <StatCard icon={Award} label="Winners drawn" value={winners} hint={`${needsDraw.length} waiting for a draw`} color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <CompetitionList
              title="Ending soon"
              items={by('active').sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 5)}
              empty="No active competitions"
              renderMeta={(c) => `${timing(c)} · ${c.participants} participants`}
            />
            <CompetitionList
              title="Ready to draw"
              items={needsDraw.slice(0, 5)}
              empty="Nothing to draw right now"
              renderMeta={(c) => `${c.participants} participants · ${c.totalEntries} entries`}
            />
            <CompetitionList
              title="Upcoming"
              items={by('scheduled').sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, 5)}
              empty="No scheduled competitions"
              renderMeta={timing}
            />
          </div>
        </>
      )}
    </div>
  );
}
