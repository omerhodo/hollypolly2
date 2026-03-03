import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  type AdMobError,
  type AdOptions,
  type BannerAdOptions
} from '@capacitor-community/admob';
import { getPlatform, isIOS, isNativePlatform } from './platform';

/**
 * AdMob Service for HollyPolly
 *
 * All Ad Unit IDs are loaded from environment variables (NEXT_PUBLIC_ADMOB_*).
 * Fallbacks to Google's official test IDs are used when env vars are not set,
 * ensuring safe development without accidental real ad impressions.
 *
 * Required env vars (set in .env.local / Vercel dashboard):
 *   NEXT_PUBLIC_ADMOB_BANNER_ANDROID
 *   NEXT_PUBLIC_ADMOB_BANNER_IOS
 *   NEXT_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
 *   NEXT_PUBLIC_ADMOB_INTERSTITIAL_IOS
 *
 * Ad Placements:
 * - Banner: Bottom of screen (persistent, shown on all pages)
 * - Interstitial: Shown on room creation and after result display
 *
 * IMPORTANT — App Tracking Transparency (ATT):
 * On iOS the ATT permission prompt MUST be displayed and the user must
 * respond BEFORE any ads are loaded or tracking data is collected.
 * If the user denies tracking (or the prompt fails to appear) ALL ads
 * are hidden — no banner, no interstitial.  This satisfies Apple
 * Guideline 2.1 and ensures no data collection without consent.
 */

// --- Google's official test Ad Unit IDs (safe fallback for development) ---
const TEST_AD_UNITS = {
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
} as const;

// --- Ad Unit IDs from environment variables with test fallbacks ---
const AD_UNITS = {
  banner: {
    android:
      process.env.NEXT_PUBLIC_ADMOB_BANNER_ANDROID ||
      TEST_AD_UNITS.banner.android,
    ios:
      process.env.NEXT_PUBLIC_ADMOB_BANNER_IOS || TEST_AD_UNITS.banner.ios,
  },
  interstitial: {
    android:
      process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ||
      TEST_AD_UNITS.interstitial.android,
    ios:
      process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_IOS ||
      TEST_AD_UNITS.interstitial.ios,
  },
};

// Throttle interstitial ads: minimum interval between shows (in ms)
// Kept low since frequency is already controlled by the action counter (every 3rd action)
const INTERSTITIAL_MIN_INTERVAL = 30_000; // 30 seconds
let lastInterstitialTime = 0;

// Track initialization state
let isInitialized = false;

// ---------------------------------------------------------------------------
// Tracking consent state
// On iOS: true only after ATT authorization is explicitly granted.
// On Android: always true (no ATT framework).
// On Web: always false (no native ads).
// ---------------------------------------------------------------------------
let trackingConsented = false;

/**
 * Returns whether the user has granted tracking consent (ATT on iOS)
 * and ads are allowed to be displayed.
 */
export function isAdsAllowed(): boolean {
  if (!isNativePlatform()) return false;
  // Android does not require ATT — ads are always allowed
  if (!isIOS()) return true;
  return trackingConsented;
}

/**
 * Get the appropriate ad unit ID based on platform
 */
function getAdUnitId(type: 'banner' | 'interstitial'): string {
  const platform = getPlatform();
  if (platform === 'ios') return AD_UNITS[type].ios;
  return AD_UNITS[type].android;
}

/**
 * Small helper that resolves after `ms` milliseconds.
 * Used to delay the ATT prompt until the UI is fully visible.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Request App Tracking Transparency (ATT) authorization on iOS.
 * Must be called BEFORE AdMob.initialize() so that the tracking
 * authorization status is resolved and AdMob can serve personalized ads
 * when the user grants permission.
 *
 * On Android the function sets trackingConsented = true and returns
 * immediately (ATT does not apply). On web it is a no-op.
 *
 * TIMING: On iOS 15+ / iPadOS 17+, the system silently returns ".denied"
 * if the prompt is requested before the app's key window is visible.
 * To avoid this we wait 1.5 s after JS execution before calling the
 * native API, giving the Capacitor WebView time to fully render.
 *
 * @returns `true` if ads may be shown, `false` otherwise.
 * @see https://developer.apple.com/documentation/apptrackingtransparency
 */
export async function requestTrackingPermission(): Promise<boolean> {
  // Android — no ATT needed, ads always allowed
  if (!isIOS()) {
    if (isNativePlatform()) {
      trackingConsented = true;
    }
    return trackingConsented;
  }

  try {
    // ------------------------------------------------------------------
    // Wait for the native UI to be fully visible.  On iPadOS 26+ the
    // system suppresses the ATT dialog when the app's scene has not yet
    // reached the "foregroundActive" state, which happens before the
    // Capacitor WebView finishes its first meaningful paint.  A short
    // delay ensures we are past that threshold.
    // ------------------------------------------------------------------
    await delay(1500);

    // Check current status first — only prompt if not yet determined
    const { status } = await AdMob.trackingAuthorizationStatus();
    console.log('[ATT] Current tracking authorization status:', status);

    if (status === 'notDetermined') {
      // Show the ATT dialog
      await AdMob.requestTrackingAuthorization();

      // Re-check status after user interaction
      const { status: newStatus } = await AdMob.trackingAuthorizationStatus();
      console.log('[ATT] User responded, new status:', newStatus);
      trackingConsented = newStatus === 'authorized';
    } else {
      // Already determined — respect previous choice
      trackingConsented = status === 'authorized';
    }

    console.log('[ATT] Ads allowed:', trackingConsented);
    return trackingConsented;
  } catch (error) {
    // ATT framework not available (e.g. iOS < 14) or unexpected error.
    // Fail-safe: do NOT show ads when we cannot verify consent.
    console.warn('[ATT] requestTrackingAuthorization failed (non-fatal):', error);
    trackingConsented = false;
    return false;
  }
}

/**
 * Initialize AdMob SDK.
 * Must be called once before showing any ads.
 * ATT permission must be resolved before calling this function on iOS.
 *
 * If ads are not allowed (ATT denied / error) this function is a no-op.
 */
export async function initializeAdMob(): Promise<void> {
  if (!isNativePlatform() || isInitialized) return;

  // Guard: do not initialize the ad SDK when consent was not given
  if (!isAdsAllowed()) {
    console.log('[AdMob] Skipping initialization — ads not allowed (tracking consent not granted)');
    return;
  }

  try {
    await AdMob.initialize({
      // Request personalized ads (set to false for GDPR compliance if needed)
      initializeForTesting: process.env.NODE_ENV === 'development',
    });

    isInitialized = true;
    console.log('[AdMob] Initialized successfully');
  } catch (error) {
    console.error('[AdMob] Initialization failed:', error);
  }
}

/**
 * Show a banner ad at the bottom of the screen.
 * The banner persists until explicitly hidden.
 * No-op when ads are not allowed.
 */
export async function showBannerAd(): Promise<void> {
  if (!isNativePlatform() || !isInitialized || !isAdsAllowed()) return;

  try {
    const options: BannerAdOptions = {
      adId: getAdUnitId('banner'),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: process.env.NODE_ENV === 'development',
    };

    // Listen for banner events
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('[AdMob] Banner ad loaded');
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob] Banner ad failed to load:', error);
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
      console.log('[AdMob] Banner size changed:', info);
      // Dispatch custom event so React components can adjust layout
      window.dispatchEvent(
        new CustomEvent('admob:bannerResize', {
          detail: { height: info.height },
        })
      );
    });

    await AdMob.showBanner(options);
    console.log('[AdMob] Banner ad shown');
  } catch (error) {
    console.error('[AdMob] Failed to show banner:', error);
  }
}

/**
 * Hide the banner ad
 */
export async function hideBannerAd(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
    console.log('[AdMob] Banner ad hidden');
  } catch (error) {
    console.error('[AdMob] Failed to hide banner:', error);
  }
}

/**
 * Resume (show) a previously hidden banner ad.
 * No-op when ads are not allowed.
 */
export async function resumeBannerAd(): Promise<void> {
  if (!isNativePlatform() || !isAdsAllowed()) return;

  try {
    await AdMob.resumeBanner();
    console.log('[AdMob] Banner ad resumed');
  } catch (error) {
    console.error('[AdMob] Failed to resume banner:', error);
  }
}

/**
 * Remove the banner ad completely
 */
export async function removeBannerAd(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await AdMob.removeBanner();
    console.log('[AdMob] Banner ad removed');
  } catch (error) {
    console.error('[AdMob] Failed to remove banner:', error);
  }
}

/**
 * Prepare an interstitial ad for display.
 * Call this in advance so the ad is ready when needed.
 * No-op when ads are not allowed.
 */
export async function prepareInterstitialAd(): Promise<void> {
  if (!isNativePlatform() || !isInitialized || !isAdsAllowed()) return;

  try {
    const options: AdOptions = {
      adId: getAdUnitId('interstitial'),
      isTesting: process.env.NODE_ENV === 'development',
    };

    await AdMob.prepareInterstitial(options);
    console.log('[AdMob] Interstitial ad prepared');
  } catch (error) {
    console.error('[AdMob] Failed to prepare interstitial:', error);
  }
}

/**
 * Show the prepared interstitial ad.
 * Respects throttling (minimum interval between shows).
 * Returns true if the ad was shown, false if throttled, not allowed, or failed.
 */
export async function showInterstitialAd(): Promise<boolean> {
  if (!isNativePlatform() || !isInitialized || !isAdsAllowed()) return false;

  // Throttle check
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_MIN_INTERVAL) {
    console.log('[AdMob] Interstitial throttled, too soon since last show');
    return false;
  }

  try {
    await AdMob.showInterstitial();
    lastInterstitialTime = Date.now();
    console.log('[AdMob] Interstitial ad shown');

    // Pre-load the next interstitial
    prepareInterstitialAd().catch(() => {});

    return true;
  } catch (error) {
    console.error('[AdMob] Failed to show interstitial:', error);
    // Try to prepare a new one for next time
    prepareInterstitialAd().catch(() => {});
    return false;
  }
}
