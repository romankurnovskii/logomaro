import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getPlatform,
  usePlatform,
  isApp,
  isWeb,
  isAndroid,
  isIOS,
  isMobileWeb,
  isDesktopWeb,
  isMobile,
  isDesktop,
  getPlatformString,
  getDetailedPlatformString,
} from './platform';
import { renderHook } from '@testing-library/react';

describe('platform detection', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    // Reset window properties
    Object.defineProperty(window, 'ReactNativeWebView', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'cordova', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
  });

  describe('getPlatform', () => {
    it('should detect web desktop platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        writable: true,
        configurable: true,
      });

      const platform = getPlatform();
      expect(platform.type).toBe('web');
      expect(platform.web).toBe('desktop');
    });

    it('should detect web mobile platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const platform = getPlatform();
      expect(platform.type).toBe('web');
      expect(platform.web).toBe('mobile');
    });

    it('should detect Android app platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Android',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'ReactNativeWebView', {
        value: {},
        writable: true,
        configurable: true,
      });

      const platform = getPlatform();
      expect(platform.type).toBe('app');
      expect(platform.app).toBe('android');
    });

    it('should detect iOS app platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'iPhone',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'iPhone',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'ReactNativeWebView', {
        value: {},
        writable: true,
        configurable: true,
      });

      const platform = getPlatform();
      expect(platform.type).toBe('app');
      expect(platform.app).toBe('ios');
    });
  });

  describe('utility functions', () => {
    it('isWeb should return true for web platforms', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        writable: true,
        configurable: true,
      });

      expect(isWeb()).toBe(true);
      expect(isApp()).toBe(false);
    });

    it('isApp should return true for app platforms', () => {
      Object.defineProperty(window, 'ReactNativeWebView', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(isApp()).toBe(true);
      expect(isWeb()).toBe(false);
    });

    it('isAndroid should return true for Android apps', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Android',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'ReactNativeWebView', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(isAndroid()).toBe(true);
      expect(isIOS()).toBe(false);
    });

    it('isMobileWeb should return true for mobile web', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        writable: true,
        configurable: true,
      });

      expect(isMobileWeb()).toBe(true);
      expect(isDesktopWeb()).toBe(false);
    });

    it('isMobile should return true for mobile platforms', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        writable: true,
        configurable: true,
      });

      expect(isMobile()).toBe(true);
      expect(isDesktop()).toBe(false);
    });
  });

  describe('usePlatform hook', () => {
    it('should return platform information', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePlatform());
      expect(result.current.type).toBe('web');
      expect(result.current.web).toBe('desktop');
    });

    it('should update on window resize', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        writable: true,
        configurable: true,
      });

      const { result, rerender } = renderHook(() => usePlatform());

      // Simulate resize with act
      const { act } = await import('@testing-library/react');
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
        await new Promise((resolve) => setTimeout(resolve, 0));
        rerender();
      });

      expect(result.current.type).toBe('web');
    });
  });

  describe('platform string functions', () => {
    it('getPlatformString should return correct format', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        writable: true,
        configurable: true,
      });

      const platformString = getPlatformString();
      expect(platformString).toBe('web-desktop');
    });

    it('getDetailedPlatformString should return correct format', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        writable: true,
        configurable: true,
      });

      const detailedString = getDetailedPlatformString();
      expect(detailedString).toBe('web-desktop');
    });
  });
});
