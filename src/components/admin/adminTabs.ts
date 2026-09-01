import type { ElementType } from 'react';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Flame,
  Layers,
  Megaphone,
  Settings2,
  Tag,
  Truck,
  TrendingUp,
  Users,
  Bell,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'promos'
  | 'flash'
  | 'categories'
  | 'analytics'
  | 'notifications'
  | 'settings';

export interface TabItem {
  id: AdminTab;
  label: string;
  group: 'MAIN' | 'SHOPPING' | 'REPORTS' | 'SETTINGS';
  icon: ElementType;
  badge?: number;
}

export const navTabs: TabItem[] = [
  { id: 'overview', label: 'Shop Overview', group: 'MAIN', icon: BarChart3 },
  { id: 'products', label: 'Products & Items', group: 'SHOPPING', icon: Boxes },
  { id: 'orders', label: 'Customer Orders', group: 'SHOPPING', icon: ClipboardList },
  { id: 'inventory', label: 'Stock & Quantities', group: 'SHOPPING', icon: Truck },
  { id: 'customers', label: 'Customers List', group: 'SHOPPING', icon: Users },
  { id: 'promos', label: 'Discount Codes', group: 'SHOPPING', icon: Tag },
  { id: 'flash', label: 'Flash Deals', group: 'SHOPPING', icon: Flame },
  { id: 'categories', label: 'Categories', group: 'SHOPPING', icon: Layers },
  { id: 'analytics', label: 'Sales & Money Reports', group: 'REPORTS', icon: TrendingUp },
  { id: 'notifications', label: 'Alerts & Messages', group: 'SETTINGS', icon: Bell },
  { id: 'settings', label: 'Shop Settings', group: 'SETTINGS', icon: Settings2 },
];
