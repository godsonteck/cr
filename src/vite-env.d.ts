/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

type DesktopQueuedSale = { idempotencyKey: string; payload: Record<string, unknown>; status: 'PENDING_SYNC' | 'SYNC_FAILED' | 'SYNC_CONFLICT'; attempts: number; last_error?: string | null };
interface Window {
  crDesktop?: {
    isDesktop: boolean;
    print: () => Promise<boolean>;
    pos: {
      status: () => Promise<{ deviceId: string; online?: boolean }>;
      catalog: { get: () => Promise<import('./types').Product[]>; cache: (products: import('./types').Product[]) => Promise<boolean> };
      sales: { queue: (sale: Record<string, unknown>) => Promise<boolean>; pending: () => Promise<DesktopQueuedSale[]>; markSync: (value: { idempotencyKey: string; status: 'SYNCED' | 'SYNC_FAILED' | 'SYNC_CONFLICT'; error?: string }) => Promise<boolean> };
    };
  };
}
