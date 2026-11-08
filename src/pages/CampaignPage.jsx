// src/pages/CampaignPage.jsx — the public page a participant reaches through the share link.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Crown, ExternalLink, Gift, Settings } from 'lucide-react';
import { api } from '../lib/api';
import { actionHref, actionMeta, daysUntil, formatDate } from '../lib/format';
import { ErrorBox, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const draftKey = (id) => `gleam:draft:${id}`;

function readDraft(id) {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(id)) || '[]');
  } catch {
    return [];
  }
}

export default function CampaignPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [c, setC] = useState(null);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(() => new Set(readDraft(id)));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [saved, setSaved] = useState(false);
  const viewed = useRef(false);

  // Load (and reload once the session is known, to pick up the caller's own entry).
  useEffect(() => {
    if (authLoading) return;
    api(`/competitions/${id}`)
      .then((data) => {
        setC(data);
        if (data.myEntry) setDone((prev) => new Set([...prev, ...data.myEntry.completedActions]));
      })
      .catch(setError);
  }, [id, user, authLoading]);

  // Count one view per browser session.
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    const key = `gleam:viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Storage unavailable: still count the view.
    }
    api(`/competitions/${id}/view`, { method: 'POST' }).catch(() => {});
  }, [id]);

  // Remember ticked actions across the sign-in redirect.
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey(id), JSON.stringify([...done]));
    } catch {
      // ignore
    }
  }, [id, done]);

  const myEntries = useMemo(
    () => (c ? c.actions.filter((a) => done.has(a.id)).reduce((n, a) => n + a.points, 0) : 0),
    [c, done]
  );

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <ErrorBox error={error.status === 404 ? { message: 'This competition does not exist or was deleted.' } : error} />
      </div>
    );
  }
  if (!c) return <Spinner />;

  const open = c.status === 'active';
  const saveCount = c.myEntry?.entries || 0;
  const hasChanges = myEntries !== saveCount || c.actions.some((a) => done.has(a.id) !== !!c.myEntry?.completedActions.includes(a.id));

  const doAction = (a) => {
    const href = actionHref(a);
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
    setDone((prev) => new Set(prev).add(a.id));
    setSaved(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api(`/competitions/${id}/enter`, { method: 'POST', body: { completedActions: [...done] } });
      setC((prev) => ({ ...prev, ...result }));
      setSaved(true);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const cover = c.coverImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-500 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {cover ? (
          <img src={cover} alt="" className="h-56 w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
        ) : (
          <div className="flex h-40 items-center justify-center bg-gradient-to-r from-primary-500 to-emerald-400">
            <Gift className="text-white/90" size={56} aria-hidden="true" />
          </div>
        )}

        <div className="space-y-6 p-6 sm:p-8">
          {c.isOwner && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              This is your competition — this is what participants see.
              <Link to={`/competitions/${c.id}`} className="btn-secondary px-3 py-1.5">
                <Settings size={14} aria-hidden="true" /> Manage
              </Link>
            </div>
          )}

          <div>
            {c.host && <p className="text-sm text-gray-500">Hosted by {c.host}</p>}
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{c.title}</h1>
            <p className="mt-2 text-gray-600">{c.description}</p>
            {c.prize && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
                <Gift size={16} aria-hidden="true" /> {c.prize}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-gray-50 text-center">
            <div className="p-3">
              <dd className="text-xl font-bold text-indigo-600">{saveCount}</dd>
              <dt className="text-xs text-gray-500">Your entries</dt>
            </div>
            <div className="p-3">
              <dd className="text-xl font-bold text-indigo-600">{c.totalEntries}</dd>
              <dt className="text-xs text-gray-500">Total entries</dt>
            </div>
            <div className="p-3">
              <dd className="text-xl font-bold text-indigo-600">
                {c.status === 'scheduled' ? daysUntil(c.startDate) : open ? daysUntil(c.endDate) : 0}
              </dd>
              <dt className="text-xs text-gray-500">{c.status === 'scheduled' ? 'Days to start' : 'Days left'}</dt>
            </div>
          </dl>

          {c.status === 'drawn' && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="flex items-center gap-2 font-semibold text-amber-900">
                <Crown size={18} aria-hidden="true" /> Winners
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {c.winners.map((w, i) => (
                  <li key={`${w.name}-${i}`}>{w.name}</li>
                ))}
              </ul>
            </section>
          )}
          {c.status === 'ended' && (
            <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">This competition has ended. Winners will be announced here soon.</p>
          )}
          {c.status === 'scheduled' && (
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Opens on {formatDate(c.startDate)}. Come back then to enter.</p>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Ways to enter</h2>
            <ul className="space-y-2">
              {c.actions.map((a) => {
                const m = actionMeta(a.type);
                const isDone = done.has(a.id);
                const href = actionHref(a);
                return (
                  <li
                    key={a.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                      isDone ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <m.icon className={m.color} size={20} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{a.label}</p>
                        <p className="truncate text-xs text-gray-500">{a.value}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">+{a.points}</span>
                      {isDone ? (
                        <CheckCircle2 className="text-green-600" size={22} aria-label="Done" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => doAction(a)}
                          disabled={!open || c.isOwner}
                          className="btn bg-indigo-500 px-3 py-1.5 text-xs text-white hover:bg-indigo-600"
                        >
                          {href ? <ExternalLink size={14} aria-hidden="true" /> : null}
                          {href ? 'Do it' : 'Mark done'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {open && !c.isOwner && (
            <div className="space-y-3 text-center">
              {!user ? (
                <Link to="/login" state={{ from: location }} className="btn-primary px-6 py-2.5">
                  Sign in to enter with {myEntries} {myEntries === 1 ? 'entry' : 'entries'}
                </Link>
              ) : (
                <button type="button" onClick={submit} disabled={submitting || myEntries === 0 || !hasChanges} className="btn-primary px-6 py-2.5">
                  {submitting
                    ? 'Saving…'
                    : c.myEntry
                      ? hasChanges
                        ? `Update my entry (${myEntries} entries)`
                        : `You’re in with ${saveCount} ${saveCount === 1 ? 'entry' : 'entries'}`
                      : myEntries === 0
                        ? 'Complete an action to enter'
                        : `Enter with ${myEntries} ${myEntries === 1 ? 'entry' : 'entries'}`}
                </button>
              )}
              {saved && <p className="text-sm text-green-700">Your entry is saved. Good luck!</p>}
              <ErrorBox error={submitError} />
            </div>
          )}

          <p className="border-t pt-4 text-center text-xs text-gray-400">
            {c.winnersCount} winner{c.winnersCount === 1 ? '' : 's'}, drawn at random and weighted by entries. Ends {formatDate(c.endDate)}.
          </p>
        </div>
      </div>
    </div>
  );
}
