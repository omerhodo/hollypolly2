import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  type AdMobError,
  type AdOptions,
  type BannerAdOptions
} from '@capacitor-community/admob';
import { getPlatform, isNativePlatform } from './platform';

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
const INTERSTITIAL_MIN_INTERVAL = 60_000; // 60 seconds
let lastInterstitialTime = 0;

// Track initialization state
let isInitialized = false;

/**
 * Get the appropriate ad unit ID based on platform
 */
function getAdUnitId(type: 'banner' | 'interstitial'): string {
  const platform = getPlatform();
  if (platform === 'ios') return AD_UNITS[type].ios;
  return AD_UNITS[type].android;
}

/**
 * Initialize AdMob SDK
 * Must be called once before showing any ads
 */
export async function initializeAdMob(): Promise<void> {
  if (!isNativePlatform() || isInitialized) return;

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
 * Show a banner ad at the bottom of the screen
 * The banner persists until explicitly hidden
 */
export async function showBannerAd(): Promise<void> {
  if (!isNativePlatform() || !isInitialized) return;

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
 * Resume (show) a previously hidden banner ad
 */
export async function resumeBannerAd(): Promise<void> {
  if (!isNativePlatform()) return;

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
 * Prepare an interstitial ad for display
 * Call this in advance so the ad is ready when needed
 */
export async function prepareInterstitialAd(): Promise<void> {
  if (!isNativePlatform() || !isInitialized) return;

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
 * Show the prepared interstitial ad
 * Respects throttling (minimum interval between shows)
 * Returns true if the ad was shown, false if throttled or failed
 */
export async function showInterstitialAd(): Promise<boolean> {
  if (!isNativePlatform() || !isInitialized) return false;

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
