// src/components/ui.jsx — small shared building blocks.
import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  ended: 'bg-amber-100 text-amber-800',
  drawn: 'bg-gray-200 text-gray-700',
};
const STATUS_LABELS = { active: 'Active', scheduled: 'Scheduled', ended: 'Ended · draw pending', drawn: 'Winners drawn' };

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.drawn}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, hint, color = 'bg-primary-500' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={`${color} rounded-lg p-2.5`}>
            <Icon className="text-white" size={22} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-gray-500" role="status">
      <Loader2 className="animate-spin" size={18} aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  const list = error.errors?.length > 1 ? error.errors : null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      <div className="flex items-center gap-2 font-medium">
        <AlertCircle size={16} aria-hidden="true" />
        {error.message}
      </div>
      {list && (
        <ul className="mt-2 list-disc pl-6">
          {list.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="py-12 text-center text-gray-500">
      {Icon && <Icon className="mx-auto mb-3 text-gray-300" size={36} aria-hidden="true" />}
      <p className="font-medium text-gray-700">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
