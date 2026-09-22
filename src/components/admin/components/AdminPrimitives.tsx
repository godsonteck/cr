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
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-[#2e2428] sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B27A52]">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#1E1719] dark:text-stone-100">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

const metricAccents = {
  neutral: 'text-stone-900 dark:text-stone-100',
  green: 'text-emerald-700 dark:text-emerald-400',
  amber: 'text-amber-700 dark:text-amber-400',
  red: 'text-red-700 dark:text-red-400',
  blue: 'text-blue-700 dark:text-blue-400',
  orange: 'text-orange-700 dark:text-orange-400',
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
    <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_24px_rgba(30,23,25,0.04)] transition-shadow hover:shadow-md dark:border-[#2e2428] dark:bg-[#201b1a]">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-[#B27A52]" aria-hidden="true" />
      </div>
      <p className={`mt-3 truncate text-xl font-bold tabular-nums sm:text-2xl ${metricAccents[accent]}`} title={String(value)}>{value}</p>
      <p className="mt-1 truncate text-xs text-stone-500 dark:text-stone-400" title={detail}>{detail}</p>
    </article>
  );
}

export function AdminStatusBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  const styles = {
    neutral: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  };
  return <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[tone]}`}><span className="truncate">{label}</span></span>;
}

export function AdminEmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-6 py-12 text-center dark:border-[#3a2c30] dark:bg-[#1a1415]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#B27A52] shadow-sm dark:bg-[#251d1e]"><Icon className="h-5 w-5" /></div>
      <h3 className="mt-4 text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-stone-500 dark:text-stone-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminSuccessMark({ label = 'All clear' }: { label?: string }) {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" />{label}</span>;
}
