// CareUnity Mobile - Biometric Authentication
/**
 * Biometric Authentication System for CareUnity Mobile
 * Enables secure login using fingerprint or face recognition
 */

class BiometricAuth {
  constructor() {
    this.available = false;
    this.type = null; // 'fingerprint', 'face', or 'other'
    this.initialized = false;
    this.credentials = new Map();
    this.onSuccessCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Initialize the biometric authentication system
   * @returns {Promise<boolean>} Whether biometric auth is available
   */
  async init() {
    if (this.initialized) return this.available;

    // Check if Web Authentication API is available
    if (!window.PublicKeyCredential) {
      console.warn('[BiometricAuth] Web Authentication API not supported in this browser');
      this.available = false;
      this.initialized = true;
      return false;
    }

    // Check if platform authenticator is available
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      this.available = available;
      
      if (available) {
        // Try to determine the type of biometric auth
        this.detectBiometricType();
        console.log(`[BiometricAuth] Available with detected type: ${this.type}`);
      } else {
        console.log('[BiometricAuth] Platform authenticator not available');
      }
    } catch (error) {
      console.error('[BiometricAuth] Error checking authenticator availability:', error);
      this.available = false;
    }

    this.initialized = true;
    return this.available;
  }

  /**
   * Detect the type of biometric authentication available
   * This is a best-effort attempt, as there's no direct API to detect the type
   */
  detectBiometricType() {
    const platform = navigator.platform || '';
    const userAgent = navigator.userAgent || '';
    
    // iOS devices likely use Face ID or Touch ID
    if (/iPhone|iPad|iPod/.test(platform) || /iPhone|iPad|iPod/.test(userAgent)) {
      // iPhone X and newer use Face ID
      if (/iPhone(?:1[1-9]|2[0-9])/.test(userAgent)) {
        this.type = 'face';
      } else {
        this.type = 'fingerprint';
      }
    } 
    // Android devices
    else if (/Android/.test(userAgent)) {
      this.type = 'fingerprint'; // Most common on Android
    } 
    // Modern Windows devices
    else if (/Windows/.test(platform) && /Windows NT 10/.test(userAgent)) {
      // Windows Hello could be face or fingerprint, but we can't tell
      this.type = 'other';
    } 
    // MacOS likely uses Touch ID
    else if (/Mac/.test(platform)) {
      this.type = 'fingerprint';
    } 
    // Default fallback
    else {
      this.type = 'other';
    }
  }

  /**
   * Register a new credential (for initial setup)
   * @param {string} username - The username to associate with biometric
   * @returns {Promise<boolean>} Whether registration was successful
   */
  async register(username) {
    if (!this.available || !username) {
      return false;
    }

    try {
      // Create a unique user ID from the username
      const userId = this.createUserId(username);
      
      // Generate random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Create credential options
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'CareUnity Mobile',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7 // ES256
          },
          {
            type: 'public-key',
            alg: -257 // RS256
          }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000, // 1 minute
        attestation: 'none'
      };
      
      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      
      if (credential) {
        // Store the credential ID
        const credentialId = credential.id;
        this.storeCredential(username, credentialId);
        
        console.log(`[BiometricAuth] Registered biometric for user: ${username}`);
        return true;
      }
    } catch (error) {
      console.error('[BiometricAuth] Registration error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('Registration failed. Please try again.');
      }
    }
    
    return false;
  }

  /**
   * Authenticate using biometrics
   * @param {string} username - The username to authenticate
   * @returns {Promise<boolean>} Whether authentication was successful
   */
  async authenticate(username) {
    if (!this.available || !username) {
      return false;
    }

    // Get the stored credential ID
    const credentialId = this.getStoredCredential(username);
    if (!credentialId) {
      console.warn(`[BiometricAuth] No stored credential for user: ${username}`);
      if (this.onErrorCallback) {
        this.onErrorCallback('No biometric credential found. Please register first.');
      }
      return false;
    }

    try {
      // Generate random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Create credential request options
      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: this.base64ToArrayBuffer(credentialId),
            type: 'public-key',
            transports: ['internal']
          }
        ],
        timeout: 60000, // 1 minute
        userVerification: 'required'
      };
      
      // Request the credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
      
      if (credential) {
        console.log(`[BiometricAuth] Successfully authenticated user: ${username}`);
        
        if (this.onSuccessCallback) {
          this.onSuccessCallback(username);
        }
        
        return true;
      }
    } catch (error) {
      console.error('[BiometricAuth] Authentication error:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback('Authentication failed. Please try again or use password.');
      }
    }
    
    return false;
  }

  /**
   * Create a user ID from a username
   * @param {string} username - The username
   * @returns {Uint8Array} User ID as Uint8Array
   */
  createUserId(username) {
    // Convert username to bytes
    const encoder = new TextEncoder();
    return encoder.encode(username);
  }

  /**
   * Store a credential for a user
   * @param {string} username - The username
   * @param {string} credentialId - The credential ID
   */
  storeCredential(username, credentialId) {
    // Store in memory
    this.credentials.set(username, credentialId);
    
    // Store in localStorage for persistence
    try {
      const storedCredentials = JSON.parse(localStorage.getItem('careunity_biometric_credentials') || '{}');
      storedCredentials[username] = credentialId;
      localStorage.setItem('careunity_biometric_credentials', JSON.stringify(storedCredentials));
    } catch (error) {
      console.error('[BiometricAuth] Error storing credential:', error);
    }
  }

  /**
   * Get a stored credential for a user
   * @param {string} username - The username
   * @returns {string|null} The credential ID or null if not found
   */
  getStoredCredential(username) {
    // Try to get from memory first
    if (this.credentials.has(username)) {
      return this.credentials.get(username);
    }
    
    // Try to get from localStorage
    try {
      const storedCredentials = JSON.parse(localStorage.getItem('careunity_biometric_credentials') || '{}');
      const credentialId = storedCredentials[username];
      
      if (credentialId) {
        // Store in memory for future use
        this.credentials.set(username, credentialId);
        return credentialId;
      }
    } catch (error) {
      console.error('[BiometricAuth] Error retrieving credential:', error);
    }
    
    return null;
  }

  /**
   * Check if a user has biometric credentials stored
   * @param {string} username - The username to check
   * @returns {boolean} Whether the user has credentials stored
   */
  hasCredentials(username) {
    return this.getStoredCredential(username) !== null;
  }

  /**
   * Clear stored biometric credentials for a user
   * @param {string} username - The username to clear
   * @returns {boolean} Whether credentials were cleared
   */
  clearCredentials(username) {
    // Clear from memory
    const hadCredential = this.credentials.delete(username);
    
    // Clear from localStorage
    try {
      const storedCredentials = JSON.parse(localStorage.getItem('careunity_biometric_credentials') || '{}');
      if (storedCredentials[username]) {
        delete storedCredentials[username];
        localStorage.setItem('careunity_biometric_credentials', JSON.stringify(storedCredentials));
        return true;
      }
    } catch (error) {
      console.error('[BiometricAuth] Error clearing credential:', error);
    }
    
    return hadCredential;
  }

  /**
   * Set callbacks for authentication events
   * @param {Function} onSuccess - Callback on successful auth
   * @param {Function} onError - Callback on auth error
   */
  setCallbacks(onSuccess, onError) {
    this.onSuccessCallback = onSuccess;
    this.onErrorCallback = onError;
  }

  /**
   * Convert a base64 string to an ArrayBuffer
   * @param {string} base64 - Base64 string
   * @returns {ArrayBuffer} Array buffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Get a user-friendly name for the biometric type
   * @returns {string} User-friendly name
   */
  getBiometricTypeName() {
    switch (this.type) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Get the appropriate icon name for the biometric type
   * @returns {string} Material icon name
   */
  getBiometricIconName() {
    switch (this.type) {
      case 'fingerprint':
        return 'fingerprint';
      case 'face':
        return 'face';
      default:
        return 'security';
    }
  }
}

// Export the BiometricAuth class
window.CareUnity = window.CareUnity || {};
window.CareUnity.BiometricAuth = BiometricAuth;
