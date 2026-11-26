import React from 'react';
import { CheckCircle2, Inbox, type LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ eyebrow, title, description, action }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-sunken-sm mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B27A52] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B27A52] dark:text-[#d49970]">{eyebrow}</span>
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1E1719] dark:text-stone-100 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{action}</div> : null}
    </header>
  );
}

const metricAccents = {
  neutral: 'text-stone-900 dark:text-stone-100',
  green: 'text-emerald-700 dark:text-emerald-400',
  amber: 'text-amber-700 dark:text-amber-400',
  red: 'text-rose-700 dark:text-rose-400',
  blue: 'text-sky-700 dark:text-sky-400',
  orange: 'text-amber-800 dark:text-amber-300',
  purple: 'text-[#8a5271] dark:text-[#d7a9c4]',
} as const;

export function AdminMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = 'neutral',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: keyof typeof metricAccents;
}) {
  return (
    <article className="clay-card-interactive p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">{label}</span>
        <div className="clay-icon-pod h-8 w-8 shrink-0">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4">
        <p className={`truncate text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${metricAccents[accent]}`} title={String(value)}>{value}</p>
        <p className="mt-1 truncate text-xs text-stone-500 dark:text-stone-400 font-medium" title={detail}>{detail}</p>
      </div>
    </article>
  );
}

export function AdminStatusBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  const styles = {
    neutral: 'clay-badge-neutral',
    success: 'clay-badge-success',
    warning: 'clay-badge-warning',
    danger: 'clay-badge-danger',
    info: 'clay-badge-info',
  };
  return (
    <span className={`clay-badge ${styles[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function AdminEmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <div className="clay-card flex flex-col items-center justify-center p-8 sm:p-12 text-center">
      <div className="neu-sunken flex h-14 w-14 items-center justify-center rounded-2xl text-[#B27A52] dark:text-[#d49970]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-5 text-stone-500 dark:text-stone-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AdminSuccessMark({ label = 'All clear' }: { label?: string }) {
  return (
    <span className="clay-badge clay-badge-success font-semibold">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}
