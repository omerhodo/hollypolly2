'use client';

import { useCapacitorInit } from '@/hooks/useCapacitor';
import type { ReactNode } from 'react';

/**
 * CapacitorProvider initializes native Capacitor features (AdMob, StatusBar, etc.)
 * when the app is running inside a native shell. On web, it's a passthrough.
 */
export function CapacitorProvider({ children }: { children: ReactNode }) {
  // Initialize Capacitor and AdMob on mount
  useCapacitorInit();

  return <>{children}</>;
}
