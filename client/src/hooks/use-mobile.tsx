import { useState, useEffect, useMemo } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  touchEnabled: boolean;
}

/**
 * Enhanced hook for responsive design that provides detailed device information
 * @returns DeviceInfo object with device type, orientation, and dimensions
 */
export function useDevice(): DeviceInfo {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [touchEnabled, setTouchEnabled] = useState(false);

  // Check if touch is enabled
  useEffect(() => {
    setTouchEnabled(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate device info based on current dimensions
  const deviceInfo = useMemo<DeviceInfo>(() => {
    // Define breakpoints
    const mobileBreakpoint = 640;  // sm
    const tabletBreakpoint = 1024; // lg

    // Determine device type
    const isMobile = width < mobileBreakpoint;
    const isTablet = width >= mobileBreakpoint && width < tabletBreakpoint;
    const isDesktop = width >= tabletBreakpoint;

    let deviceType: DeviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    // Determine orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType,
      orientation,
      width,
      height,
      touchEnabled
    };
  }, [width, height, touchEnabled]);

  return deviceInfo;
}

/**
 * Simple hook that returns whether the current device is mobile
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook that returns whether the current device is a tablet
 * @returns boolean indicating if the device is a tablet
 */
export function useIsTablet(): boolean {
  const { isTablet } = useDevice();
  return isTablet;
}

/**
 * Hook that returns whether the current device supports touch
 * @returns boolean indicating if touch is supported
 */
export function useTouchEnabled(): boolean {
  const { touchEnabled } = useDevice();
  return touchEnabled;
}