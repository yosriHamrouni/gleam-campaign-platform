// src/pages/ManageCompetition.jsx — the creator's view of one competition.
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Crown, ExternalLink, Eye, Shuffle, Ticket, Trash2, Users } from 'lucide-react';
import { api } from '../lib/api';
import { actionMeta, formatDate, formatDateTime, percent, timing } from '../lib/format';
import { EmptyState, ErrorBox, Spinner, StatCard, StatusBadge } from '../components/ui';

function ShareLink({ url }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link stays selectable.
    }
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input value={url} readOnly onFocus={(e) => e.target.select()} className="input bg-gray-50 text-sm" aria-label="Share link" />
      <div className="flex gap-2">
        <button type="button" onClick={copy} className="btn-secondary">
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="btn-primary">
          <ExternalLink size={16} aria-hidden="true" /> Open
        </a>
      </div>
    </div>
  );
}

export default function ManageCompetition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const justCreated = useLocation().state?.created;
  const [competition, setCompetition] = useState(null);
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [found, people] = await Promise.all([api(`/competitions/${id}/manage`), api(`/competitions/${id}/entries`)]);
      setCompetition(found);
      setEntries(people);
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const draw = async () => {
    const early = competition.status === 'active';
    const question = early
      ? 'This competition is still running. Draw winners now and close it to new entries?'
      : `Draw ${competition.winnersCount} winner(s) now? This cannot be undone.`;
    if (!window.confirm(question)) return;
    setBusy(true);
    setActionError(null);
    try {
      setCompetition(await api(`/competitions/${id}/draw`, { method: 'POST', body: { early } }));
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${competition.title}” and all its entries? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/competitions/${id}`, { method: 'DELETE' });
      navigate('/competitions', { replace: true });
    } catch (err) {
      setActionError(err);
      setBusy(false);
    }
  };

  if (error) return <ErrorBox error={error} />;
  if (!competition || !entries) return <Spinner />;

  const c = competition;
  const canDraw = !c.drawnAt && c.status !== 'scheduled' && entries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/competitions" className="mt-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Back to competitions">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{c.title}</h1>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {formatDate(c.startDate)} → {formatDate(c.endDate)} · {timing(c)}
              {c.prize && <> · Prize: {c.prize}</>}
            </p>
          </div>
        </div>
        <button type="button" onClick={remove} disabled={busy} className="btn-danger">
          <Trash2 size={16} aria-hidden="true" /> Delete
        </button>
      </div>

      <section className="card space-y-3 p-5">
        <div>
          <h2 className="font-semibold text-gray-900">{justCreated ? 'Your competition is live — share it' : 'Share link'}</h2>
          <p className="text-sm text-gray-600">Participants enter through this public page.</p>
        </div>
        <ShareLink url={c.shareUrl} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Eye} label="Page views" value={c.impressions} color="bg-slate-500" />
        <StatCard icon={Users} label="Participants" value={c.participants} color="bg-green-500" />
        <StatCard icon={Ticket} label="Entries" value={c.totalEntries} color="bg-blue-500" />
        <StatCard icon={Shuffle} label="Entry rate" value={percent(c.participants, c.impressions)} hint="participants / views" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Participants</h2>
          {entries.length === 0 ? (
            <EmptyState icon={Users} title="No entries yet">Share the link to get your first participants.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Actions done</th>
                    <th className="py-2 pr-4 font-medium">Entries</th>
                    <th className="py-2 pr-4 font-medium">Chance</th>
                    <th className="py-2 font-medium">Last update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-gray-900">{e.name}</p>
                        <p className="text-xs text-gray-500">{e.email}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">{e.completedActions} / {c.actions.length}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{e.entries}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{percent(e.entries, c.totalEntries)}</td>
                      <td className="py-2.5 text-gray-500">{formatDateTime(e.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="card space-y-3 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Winners</h2>
            {c.drawnAt ? (
              <>
                <ol className="space-y-2">
                  {c.winners.map((w, i) => (
                    <li key={`${w.user}-${i}`} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <Crown size={16} className="text-amber-500" aria-hidden="true" /> {w.name}
                      </span>
                      <span className="text-xs text-gray-600">{w.entries} entries</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-gray-500">Drawn {formatDateTime(c.drawnAt)}, weighted by entries.</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  {c.winnersCount} winner{c.winnersCount === 1 ? '' : 's'} will be drawn at random, weighted by entries. Nobody can win twice.
                </p>
                <button type="button" onClick={draw} disabled={!canDraw || busy} className="btn-primary w-full">
                  <Shuffle size={16} aria-hidden="true" />
                  {c.status === 'active' ? 'Draw early' : 'Draw winners'}
                </button>
                {!canDraw && (
                  <p className="text-xs text-gray-500">
                    {c.status === 'scheduled' ? 'Available once the competition starts.' : 'Available once someone has entered.'}
                  </p>
                )}
              </>
            )}
            <ErrorBox error={actionError} />
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Ways to enter</h2>
            <ul className="space-y-2">
              {c.actions.map((a) => {
                const m = actionMeta(a.type);
                return (
                  <li key={a._id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <m.icon size={16} className={m.color} aria-hidden="true" />
                      <span className="truncate text-gray-800">{a.label}</span>
                    </span>
                    <span className="text-xs text-gray-500">+{a.points}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
