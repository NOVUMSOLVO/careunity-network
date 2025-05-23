/**
 * Accessibility Hook
 * 
 * Provides access to accessibility settings and features
 */

import { useContext } from 'react';
import { AccessibilityContext } from '@/contexts/accessibility-context';

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}
