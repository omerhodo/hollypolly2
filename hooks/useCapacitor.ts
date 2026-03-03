'use client';

import {
  hideBannerAd,
  initializeAdMob,
  isAdsAllowed,
  isNativePlatform,
  prepareInterstitialAd,
  removeBannerAd,
  requestTrackingPermission,
  showBannerAd,
  showInterstitialAd,
} from '@/lib/capacitor';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to initialize Capacitor and AdMob on app startup.
 * Should be called once in the root layout or top-level component.
 *
 * Flow on iOS:
 *  1. Wait for view to be visible (delay built into requestTrackingPermission)
 *  2. Show ATT dialog — user accepts or denies
 *  3. If accepted → initialize AdMob, prepare interstitial
 *  4. If denied  → skip AdMob entirely, all ad hooks become no-ops
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
        // ----------------------------------------------------------
        // 1. Request ATT permission BEFORE initializing AdMob (iOS).
        //    This must happen before any data collection or ad SDK
        //    initialization.  The function includes a built-in delay
        //    to work around iPadOS 26+ timing issues.
        // ----------------------------------------------------------
        const adsAllowed = await requestTrackingPermission();
        console.log('[Capacitor] Tracking permission resolved — ads allowed:', adsAllowed);

        // ----------------------------------------------------------
        // 2. Initialize AdMob ONLY if consent was granted (iOS) or
        //    on Android (no ATT needed).
        // ----------------------------------------------------------
        if (adsAllowed) {
          await initializeAdMob();

          // Pre-load the first interstitial
          await prepareInterstitialAd();
        } else {
          console.log('[Capacitor] Ads disabled — user did not grant tracking permission');
        }

        // Configure status bar for mobile — solid white, non-transparent
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setOverlaysWebView({ overlay: true });
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
 * No-op if ads are not allowed (ATT denied on iOS).
 */
export function useBannerAd(visible = true) {
  useEffect(() => {
    if (!isNativePlatform() || !isAdsAllowed()) return;

    if (visible) {
      showBannerAd().catch(() => {});
    } else {
      hideBannerAd().catch(() => {});
    }

    return () => {
      if (!visible && isAdsAllowed()) {
        // Restore banner when leaving a page that hid it
        showBannerAd().catch(() => {});
      }
    };
  }, [visible]);
}

/**
 * Hook to show interstitial ads at key moments.
 * Returns a function that can be called to show an interstitial.
 * Returns false immediately if ads are not allowed.
 */
export function useInterstitialAd() {
  const showAd = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform() || !isAdsAllowed()) return false;
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

/**
 * Hook to check whether ads are currently allowed.
 * Returns false on web, when ATT is denied on iOS, or before init.
 */
export function useAdsAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isAdsAllowed());
  }, []);

  return allowed;
}
