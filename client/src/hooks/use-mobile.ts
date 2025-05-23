import { useState, useEffect } from 'react';
import { deviceBreakpoints } from '../config/mobile-config';

// Device type
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Device info
export interface DeviceInfo {
  /**
   * Whether the device is a mobile device
   */
  isMobile: boolean;
  
  /**
   * Whether the device is a tablet device
   */
  isTablet: boolean;
  
  /**
   * Whether the device is a desktop device
   */
  isDesktop: boolean;
  
  /**
   * The type of device
   */
  deviceType: DeviceType;
  
  /**
   * Whether touch is enabled on the device
   */
  touchEnabled: boolean;
  
  /**
   * The screen width
   */
  screenWidth: number;
  
  /**
   * The screen height
   */
  screenHeight: number;
  
  /**
   * Whether the device is in portrait orientation
   */
  isPortrait: boolean;
  
  /**
   * Whether the device is in landscape orientation
   */
  isLandscape: boolean;
  
  /**
   * Whether the device has a high-resolution display
   */
  isRetina: boolean;
  
  /**
   * The device pixel ratio
   */
  pixelRatio: number;
}

/**
 * Hook to get information about the current device
 * 
 * @returns Device information
 */
export function useDevice(): DeviceInfo {
  // State to store device information
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
    touchEnabled: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    isPortrait: true,
    isLandscape: false,
    isRetina: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  });
  
  // Update device information on mount and when window is resized
  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') {
      return;
    }
    
    // Function to update device information
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio;
      
      // Determine device type based on screen width
      const isMobile = width <= deviceBreakpoints.mobile;
      const isTablet = width > deviceBreakpoints.mobile && width <= deviceBreakpoints.tablet;
      const isDesktop = width > deviceBreakpoints.tablet;
      
      // Determine device type
      let deviceType: DeviceType = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      // Determine orientation
      const isPortrait = height > width;
      const isLandscape = width >= height;
      
      // Determine if touch is enabled
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Determine if the device has a high-resolution display
      const isRetina = pixelRatio >= 2;
      
      // Update state
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        touchEnabled,
        screenWidth: width,
        screenHeight: height,
        isPortrait,
        isLandscape,
        isRetina,
        pixelRatio,
      });
    };
    
    // Update device information initially
    updateDeviceInfo();
    
    // Update device information when window is resized
    window.addEventListener('resize', updateDeviceInfo);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}
