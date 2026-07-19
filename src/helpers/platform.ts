import { useState, useEffect } from 'react';

// Extend Window interface for custom properties
declare global {
  interface Window {
    ReactNativeWebView?: unknown;
    cordova?: unknown;
  }
}

export type PlatformType = 'app' | 'web';
export type AppPlatform = 'android' | 'ios';
export type WebPlatform = 'mobile' | 'desktop';
export type DetailedPlatform = {
  type: PlatformType;
  app?: AppPlatform;
  web?: WebPlatform;
  userAgent: string;
};

// Platform detection logic
function detectPlatform(): DetailedPlatform {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check if it's a mobile app (React Native, Cordova, etc.)
  const isReactNative =
    typeof window !== 'undefined' && window.ReactNativeWebView !== undefined;
  const isCordova = typeof window !== 'undefined' && window.cordova !== undefined;

  if (isReactNative || isCordova) {
    // Determine if it's Android or iOS
    const isAndroid = userAgent.includes('android') || /android/i.test(navigator.platform);
    const isIOS =
      /ipad|iphone|ipod/i.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    return {
      type: 'app',
      app: isAndroid ? 'android' : isIOS ? 'ios' : undefined,
      userAgent,
    };
  }

  // Web platform detection
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

  return {
    type: 'web',
    web: isMobile ? 'mobile' : 'desktop',
    userAgent,
  };
}

// Hook for React components
export function usePlatform(): DetailedPlatform {
  const [platform, setPlatform] = useState<DetailedPlatform>(() => detectPlatform());

  useEffect(() => {
    // Re-detect on window resize (for orientation changes)
    const handleResize = () => {
      setPlatform(detectPlatform());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return platform;
}

// Utility functions for direct usage
export function getPlatform(): DetailedPlatform {
  return detectPlatform();
}

export function isApp(): boolean {
  return detectPlatform().type === 'app';
}

export function isWeb(): boolean {
  return detectPlatform().type === 'web';
}

export function isAndroid(): boolean {
  const platform = detectPlatform();
  return platform.type === 'app' && platform.app === 'android';
}

export function isIOS(): boolean {
  const platform = detectPlatform();
  return platform.type === 'app' && platform.app === 'ios';
}

export function isMobileWeb(): boolean {
  const platform = detectPlatform();
  return platform.type === 'web' && platform.web === 'mobile';
}

export function isDesktopWeb(): boolean {
  const platform = detectPlatform();
  return platform.type === 'web' && platform.web === 'desktop';
}

export function isMobile(): boolean {
  const platform = detectPlatform();
  return platform.type === 'app' || (platform.type === 'web' && platform.web === 'mobile');
}

export function isDesktop(): boolean {
  const platform = detectPlatform();
  return platform.type === 'web' && platform.web === 'desktop';
}

// Platform string getters
export function getPlatformString(): string {
  const platform = detectPlatform();
  if (platform.type === 'app') {
    return platform.app ? `${platform.type}-${platform.app}` : platform.type;
  }
  return platform.web ? `${platform.type}-${platform.web}` : platform.type;
}

export function getDetailedPlatformString(): string {
  const platform = detectPlatform();
  const parts: string[] = [platform.type];

  if (platform.type === 'app' && platform.app) {
    parts.push(platform.app);
  } else if (platform.type === 'web' && platform.web) {
    parts.push(platform.web);
  }

  return parts.join('-');
}
