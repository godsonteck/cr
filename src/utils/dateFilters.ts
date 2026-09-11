export type DateFilterPreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';

export type DateSortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export interface DateFilterState {
  preset: DateFilterPreset;
  customStart?: string;
  customEnd?: string;
}

export const DATE_PRESETS: { id: DateFilterPreset; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: 'Last 7 days' },
  { id: '30days', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'custom', label: 'Custom range' },
];

export function isWithinDateRange(
  dateStr: string,
  preset: DateFilterPreset,
  customStart?: string,
  customEnd?: string
): boolean {
  if (preset === 'all') return true;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case 'today':
      return date >= startOfToday && date <= endOfToday;
    case 'yesterday': {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(startOfToday.getTime() - 1);
      return date >= startOfYesterday && date <= endOfYesterday;
    }
    case '7days': {
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo && date <= endOfToday;
    }
    case '30days': {
      const thirtyDaysAgo = new Date(startOfToday);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo && date <= endOfToday;
    }
    case 'thisMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth && date <= endOfToday;
    }
    case 'lastMonth': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    }
    case 'custom': {
      if (!customStart && !customEnd) return true;
      let valid = true;
      if (customStart) {
        const start = new Date(`${customStart}T00:00:00`);
        if (!isNaN(start.getTime())) valid = valid && date >= start;
      }
      if (customEnd) {
        const end = new Date(`${customEnd}T23:59:59.999`);
        if (!isNaN(end.getTime())) valid = valid && date <= end;
      }
      return valid;
    }
    default:
      return true;
  }
}
