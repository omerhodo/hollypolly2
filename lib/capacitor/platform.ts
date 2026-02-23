import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities for Capacitor
 * Used to conditionally enable native features (AdMob, StatusBar, etc.)
 */

/** Check if the app is running inside a native Capacitor shell (iOS/Android) */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/** Get the current platform: 'ios' | 'android' | 'web' */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/** Check if a specific Capacitor plugin is available */
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

/** Check if the app is running on iOS */
export const isIOS = (): boolean => {
  return getPlatform() === 'ios';
};

/** Check if the app is running on Android */
export const isAndroid = (): boolean => {
  return getPlatform() === 'android';
};

/** Check if the app is running on the web */
export const isWeb = (): boolean => {
  return getPlatform() === 'web';
};
