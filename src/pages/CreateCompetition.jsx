// src/pages/CreateCompetition.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { ACTION_TYPES, COMPETITION_TYPES, actionMeta, toLocalInput } from '../lib/format';
import { ErrorBox } from '../components/ui';

const emptyAction = { type: 'follow_instagram', value: '', points: 1 };

export default function CreateCompetition() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    title: '',
    description: '',
    prize: '',
    type: 'standard',
    startDate: toLocalInput(Date.now()),
    endDate: toLocalInput(Date.now() + 14 * 86_400_000),
    winnersCount: 1,
    coverImage: '',
  }));
  const [actions, setActions] = useState([]);
  const [draft, setDraft] = useState(emptyAction);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const addAction = () => {
    if (!draft.value.trim()) return;
    setActions((list) => [...list, { ...draft, value: draft.value.trim(), points: Number(draft.points) || 1 }]);
    setDraft((d) => ({ ...emptyAction, type: d.type }));
  };

  const totalEntries = actions.reduce((n, a) => n + a.points, 0);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (actions.length === 0) {
      setError({ message: 'Add at least one action participants can complete.' });
      return;
    }
    setSaving(true);
    try {
      const created = await api('/competitions', {
        method: 'POST',
        body: {
          ...form,
          winnersCount: Number(form.winnersCount),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          actions,
        },
      });
      navigate(`/competitions/${created.id}`, { state: { created: true } });
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const meta = actionMeta(draft.type);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/competitions" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Back to competitions">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New competition</h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Campaign</h2>
          <div>
            <label className="label" htmlFor="title">Title *</label>
            <input id="title" name="title" value={form.title} onChange={set} required maxLength={120} className="input" placeholder="Summer Sneaker Giveaway" />
          </div>
          <div>
            <label className="label" htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={form.description} onChange={set} required rows={3} maxLength={2000} className="input" placeholder="What can people win, and why should they take part?" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="prize">Prize</label>
              <input id="prize" name="prize" value={form.prize} onChange={set} maxLength={200} className="input" placeholder="A pair of running shoes" />
            </div>
            <div>
              <label className="label" htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={set} className="input">
                {COMPETITION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="startDate">Starts *</label>
              <input id="startDate" type="datetime-local" name="startDate" value={form.startDate} onChange={set} required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="endDate">Ends *</label>
              <input id="endDate" type="datetime-local" name="endDate" value={form.endDate} onChange={set} required min={form.startDate} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="winnersCount">Number of winners</label>
              <input id="winnersCount" type="number" name="winnersCount" value={form.winnersCount} onChange={set} min={1} max={100} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="coverImage">Cover image URL</label>
              <input id="coverImage" type="url" name="coverImage" value={form.coverImage} onChange={set} className="input" placeholder="https://…" />
            </div>
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ways to enter</h2>
            <p className="text-sm text-gray-600">Each action earns the participant its number of entries. More entries mean better odds in the draw.</p>
          </div>

          <div className="grid gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 sm:grid-cols-[1.2fr_1.6fr_0.6fr_auto] sm:items-end">
            <div>
              <label className="label" htmlFor="actionType">Action</label>
              <select id="actionType" value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} className="input">
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="actionValue">{draft.type === 'custom' ? 'Instruction' : 'Account or link'}</label>
              <input
                id="actionValue"
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAction();
                  }
                }}
                placeholder={meta.placeholder}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="actionPoints">Entries</label>
              <input id="actionPoints" type="number" min={1} max={100} value={draft.points} onChange={(e) => setDraft((d) => ({ ...d, points: e.target.value }))} className="input" />
            </div>
            <button type="button" onClick={addAction} disabled={!draft.value.trim()} className="btn-primary">
              <Plus size={16} aria-hidden="true" /> Add
            </button>
          </div>

          {actions.length === 0 ? (
            <p className="text-sm italic text-gray-500">No actions yet — add at least one.</p>
          ) : (
            <ul className="space-y-2">
              {actions.map((a, i) => {
                const m = actionMeta(a.type);
                return (
                  <li key={`${a.type}-${a.value}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <m.icon className={m.color} size={20} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{m.label}</p>
                        <p className="truncate text-sm text-gray-500">{a.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">+{a.points} {a.points === 1 ? 'entry' : 'entries'}</span>
                      <button type="button" onClick={() => setActions((list) => list.filter((_, j) => j !== i))} className="rounded p-1 text-gray-400 hover:text-red-600" aria-label={`Remove ${m.label}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
              <li className="pt-1 text-right text-sm text-gray-600">Up to {totalEntries} entries per participant</li>
            </ul>
          )}
        </section>

        <ErrorBox error={error} />

        <div className="flex justify-end gap-3">
          <Link to="/competitions" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Creating…' : 'Create competition'}
          </button>
        </div>
      </form>
    </div>
  );
}
