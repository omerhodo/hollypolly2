'use client';

import {
  hideBannerAd,
  initializeAdMob,
  isNativePlatform,
  prepareInterstitialAd,
  removeBannerAd,
  showBannerAd,
  showInterstitialAd,
} from '@/lib/capacitor';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to initialize Capacitor and AdMob on app startup.
 * Should be called once in the root layout or top-level component.
 */
export function useCapacitorInit() {
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (!isNativePlatform()) {
        setIsReady(true);
        return;
      }

      try {
        // Initialize AdMob
        await initializeAdMob();

        // Do NOT show banner ad on startup — individual pages control visibility
        // via useBannerAd(true/false) hook

        // Pre-load the first interstitial
        await prepareInterstitialAd();

        // Configure status bar for mobile — solid white, non-transparent
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch {
          // StatusBar not available on this platform
        }

        // Configure keyboard behavior
        try {
          const { Keyboard } = await import('@capacitor/keyboard');
          // Keyboard plugin auto-configured via capacitor.config.ts
        } catch {
          // Keyboard not available on this platform
        }
      } catch (error) {
        console.error('[Capacitor] Initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    init();

    // Cleanup: remove banner when component unmounts
    return () => {
      if (isNativePlatform()) {
        removeBannerAd().catch(() => {});
      }
    };
  }, []);

  return { isReady };
}

/**
 * Hook to manage banner ad visibility.
 * Use this to show/hide the banner ad on specific pages.
 */
export function useBannerAd(visible = true) {
  useEffect(() => {
    if (!isNativePlatform()) return;

    if (visible) {
      showBannerAd().catch(() => {});
    } else {
      hideBannerAd().catch(() => {});
    }

    return () => {
      if (!visible) {
        // Restore banner when leaving a page that hid it
        showBannerAd().catch(() => {});
      }
    };
  }, [visible]);
}

/**
 * Hook to show interstitial ads at key moments.
 * Returns a function that can be called to show an interstitial.
 */
export function useInterstitialAd() {
  const showAd = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform()) return false;
    return showInterstitialAd();
  }, []);

  return { showInterstitialAd: showAd };
}

/**
 * Hook to detect if the app is running on a native platform.
 */
export function useIsNative() {
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativePlatform());
  }, []);

  return native;
}
