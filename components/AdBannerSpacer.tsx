'use client';

import { useIsNative } from '@/hooks/useCapacitor';
import { useEffect, useState } from 'react';

/**
 * AdBanner spacing hook.
 *
 * On native platforms, the AdMob banner ad is rendered as a native view
 * overlaying the bottom of the WebView. This hook returns the current
 * banner height so the scroll container can add matching bottom padding,
 * preventing content from being hidden behind the banner.
 *
 * The actual ad is shown via the native AdMob plugin (see useCapacitorInit hook).
 * This hook only manages the spacing value.
 */

const DEFAULT_BANNER_HEIGHT = 60; // Approximate adaptive banner height

export function useAdBannerHeight(): number {
  const isNative = useIsNative();
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    if (!isNative) return;

    // Set default height immediately when native is detected
    setBannerHeight(DEFAULT_BANNER_HEIGHT);

    // Listen for banner resize events from the AdMob service
    const handleResize = (event: Event) => {
      const customEvent = event as CustomEvent<{ height: number }>;
      if (customEvent.detail?.height) {
        setBannerHeight(customEvent.detail.height);
      }
    };

    window.addEventListener('admob:bannerResize', handleResize);
    return () => window.removeEventListener('admob:bannerResize', handleResize);
  }, [isNative]);

  return bannerHeight;
}
