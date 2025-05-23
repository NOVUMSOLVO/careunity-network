/**
 * Biometric Authentication Service
 * 
 * Provides biometric authentication functionality for the mobile app.
 * Features:
 * - Fingerprint authentication
 * - Face recognition
 * - Secure credential storage
 * - Fallback to PIN/password
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_TYPE: 'biometric_type',
  CREDENTIALS_KEY: 'secure_credentials',
};

// Biometric authentication types
export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACIAL_RECOGNITION = 'facial',
  IRIS = 'iris',
  UNKNOWN = 'unknown',
}

// Authentication result interface
export interface AuthResult {
  success: boolean;
  error?: string;
  credentials?: {
    username: string;
    password: string;
  };
}

/**
 * Check if biometric authentication is available
 * @returns Whether biometric authentication is available
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    return compatible && enrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Get available biometric types
 * @returns Array of available biometric types
 */
export const getAvailableBiometricTypes = async (): Promise<BiometricType[]> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return BiometricType.FINGERPRINT;
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return BiometricType.FACIAL_RECOGNITION;
        case LocalAuthentication.AuthenticationType.IRIS:
          return BiometricType.IRIS;
        default:
          return BiometricType.UNKNOWN;
      }
    });
  } catch (error) {
    console.error('Error getting available biometric types:', error);
    return [];
  }
};

/**
 * Check if biometric authentication is enabled
 * @returns Whether biometric authentication is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking if biometric is enabled:', error);
    return false;
  }
};

/**
 * Enable biometric authentication
 * @param credentials User credentials to store securely
 * @returns Whether biometric authentication was enabled successfully
 */
export const enableBiometric = async (credentials: { username: string; password: string }): Promise<boolean> => {
  try {
    // Check if biometric is available
    const available = await isBiometricAvailable();
    
    if (!available) {
      console.error('Biometric authentication is not available');
      return false;
    }
    
    // Get available biometric types
    const types = await getAvailableBiometricTypes();
    
    if (types.length === 0) {
      console.error('No biometric types available');
      return false;
    }
    
    // Store the preferred biometric type
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_TYPE, types[0]);
    
    // Authenticate to confirm user's identity
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to enable biometric login',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    if (!authResult.success) {
      console.error('Biometric authentication failed');
      return false;
    }
    
    // Store credentials securely
    await SecureStore.setItemAsync(
      STORAGE_KEYS.CREDENTIALS_KEY,
      JSON.stringify(credentials),
      {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      }
    );
    
    // Enable biometric authentication
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    
    return true;
  } catch (error) {
    console.error('Error enabling biometric:', error);
    return false;
  }
};

/**
 * Disable biometric authentication
 * @returns Whether biometric authentication was disabled successfully
 */
export const disableBiometric = async (): Promise<boolean> => {
  try {
    // Remove stored credentials
    await SecureStore.deleteItemAsync(STORAGE_KEYS.CREDENTIALS_KEY);
    
    // Disable biometric authentication
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    
    return true;
  } catch (error) {
    console.error('Error disabling biometric:', error);
    return false;
  }
};

/**
 * Authenticate using biometrics
 * @param promptMessage Message to display to the user
 * @returns Authentication result
 */
export const authenticateWithBiometric = async (promptMessage: string = 'Authenticate to continue'): Promise<AuthResult> => {
  try {
    // Check if biometric is enabled
    const enabled = await isBiometricEnabled();
    
    if (!enabled) {
      return {
        success: false,
        error: 'Biometric authentication is not enabled',
      };
    }
    
    // Check if biometric is available
    const available = await isBiometricAvailable();
    
    if (!available) {
      return {
        success: false,
        error: 'Biometric authentication is not available',
      };
    }
    
    // Get the preferred biometric type
    const biometricType = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_TYPE) || BiometricType.UNKNOWN;
    
    // Determine the appropriate prompt message based on biometric type
    let customPromptMessage = promptMessage;
    
    if (biometricType === BiometricType.FINGERPRINT) {
      customPromptMessage = 'Scan your fingerprint to continue';
    } else if (biometricType === BiometricType.FACIAL_RECOGNITION) {
      customPromptMessage = 'Scan your face to continue';
    }
    
    // Authenticate
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: customPromptMessage,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      };
    }
    
    // Get stored credentials
    const credentialsString = await SecureStore.getItemAsync(STORAGE_KEYS.CREDENTIALS_KEY);
    
    if (!credentialsString) {
      return {
        success: false,
        error: 'No stored credentials found',
      };
    }
    
    const credentials = JSON.parse(credentialsString);
    
    return {
      success: true,
      credentials,
    };
  } catch (error) {
    console.error('Error authenticating with biometric:', error);
    
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
};

/**
 * Update stored credentials
 * @param credentials Updated credentials
 * @returns Whether credentials were updated successfully
 */
export const updateStoredCredentials = async (credentials: { username: string; password: string }): Promise<boolean> => {
  try {
    // Check if biometric is enabled
    const enabled = await isBiometricEnabled();
    
    if (!enabled) {
      console.error('Biometric authentication is not enabled');
      return false;
    }
    
    // Store updated credentials securely
    await SecureStore.setItemAsync(
      STORAGE_KEYS.CREDENTIALS_KEY,
      JSON.stringify(credentials),
      {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating stored credentials:', error);
    return false;
  }
};

/**
 * Get biometric authentication type name
 * @returns User-friendly name of the biometric type
 */
export const getBiometricTypeName = async (): Promise<string> => {
  try {
    const biometricType = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_TYPE) || BiometricType.UNKNOWN;
    
    switch (biometricType) {
      case BiometricType.FINGERPRINT:
        return 'Fingerprint';
      case BiometricType.FACIAL_RECOGNITION:
        return 'Face ID';
      case BiometricType.IRIS:
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  } catch (error) {
    console.error('Error getting biometric type name:', error);
    return 'Biometric';
  }
};

export default {
  isBiometricAvailable,
  getAvailableBiometricTypes,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  authenticateWithBiometric,
  updateStoredCredentials,
  getBiometricTypeName,
};
