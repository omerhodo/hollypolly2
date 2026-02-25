import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.hollypolly.app',
  appName: 'HollyPolly',
  webDir: 'www',
  // Server configuration: loads the deployed Next.js app in the WebView
  // This approach is optimal for Firebase-dependent apps that require internet
  server: {
    // Production: point to your Vercel deployment URL
    // Development: uncomment the line below and comment out the production URL
    // url: 'http://localhost:3000',
    url: 'https://hollypolly.vercel.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#f97316',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'HollyPolly',
    backgroundColor: '#ffffff',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set to true for development
  },
};

export default config;
