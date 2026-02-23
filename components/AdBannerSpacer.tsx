'use client';

import { useIsNative } from '@/hooks/useCapacitor';
import { useEffect, useState } from 'react';

/**
 * AdBanner spacer component.
 *
 * On native platforms, the AdMob banner ad is rendered as a native view
 * overlaying the bottom of the WebView. This component adds bottom padding
 * to prevent content from being hidden behind the banner.
 *
 * The actual ad is shown via the native AdMob plugin (see useCapacitorInit hook).
 * This component only manages the spacing.
 */

const DEFAULT_BANNER_HEIGHT = 60; // Approximate adaptive banner height

export function AdBannerSpacer() {
  const isNative = useIsNative();
  const [bannerHeight, setBannerHeight] = useState(DEFAULT_BANNER_HEIGHT);

  useEffect(() => {
    if (!isNative) return;

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

  if (!isNative) return null;

  return (
    <div
      className="w-full shrink-0"
      style={{ height: `${bannerHeight}px` }}
      aria-hidden="true"
    />
  );
}
