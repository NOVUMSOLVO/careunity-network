/**
 * Enhanced Biometric Authentication System for CareUnity Mobile
 * Provides advanced security features, multi-factor authentication, and session management
 */

class EnhancedBiometricAuth {
  constructor() {
    // Initialize the base biometric auth
    this.biometricAuth = new CareUnity.BiometricAuth();
    
    // Multi-factor authentication related properties
    this.mfaEnabled = false;
    this.mfaMethods = {
      biometric: true,
      pin: false,
      securityQuestion: false,
      email: false,
      totp: false // Time-based One-Time Password
    };
    
    // Session management
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes by default
    this.lastActivityTime = Date.now();
    this.sessionTimer = null;
    this.sessionExpiryWarningTime = 60 * 1000; // 1 minute warning before session expires
    
    // Recovery methods
    this.recoveryEnabled = false;
    this.recoveryEmail = null;
    this.recoveryPhone = null;
    
    // Security settings
    this.securityLevel = 'standard'; // 'standard', 'high', 'maximum'
    this.failedAttempts = 0;
    this.maxFailedAttempts = 5; // Lock after 5 failed attempts
    this.lockoutDuration = 5 * 60 * 1000; // 5 minutes
    this.lockoutUntil = null;
    
    // Event callbacks
    this.onSessionExpiring = null;
    this.onSessionExpired = null;
    this.onAuthSuccess = null;
    this.onAuthFailure = null;
    this.onAccountLocked = null;
    
    // Device fingerprinting
    this.deviceFingerprint = null;
    this.trustedDevices = new Map();
    
    // Initialize session tracking if available
    this._initSessionTracking();
  }

  /**
   * Initialize the enhanced biometric authentication system
   * @returns {Promise<boolean>} Whether biometric auth is available
   */
  async init() {
    // Initialize the base biometric auth
    const biometricAvailable = await this.biometricAuth.init();
    
    // Generate and store device fingerprint
    this.deviceFingerprint = await this._generateDeviceFingerprint();
    
    // Load stored configuration
    this._loadConfig();
    
    // Initialize TOTP if enabled as an MFA method
    if (this.mfaMethods.totp) {
      await this._initTOTP();
    }
    
    return biometricAvailable;
  }
  
  /**
   * Generate a device fingerprint for identifying this device
   * @private
   * @returns {Promise<string>} The device fingerprint
   */
  async _generateDeviceFingerprint() {
    // Collect device information
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchPoints: navigator.maxTouchPoints,
      timestamp: Date.now()
    };
    
    // Convert to string and hash
    const deviceInfoString = JSON.stringify(deviceInfo);
    const encoder = new TextEncoder();
    const data = encoder.encode(deviceInfoString);
    
    // Generate hash using SubtleCrypto
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error generating device fingerprint:', error);
      // Fallback to simplified fingerprint if crypto API fails
      return btoa(deviceInfoString).substring(0, 32);
    }
  }
  
  /**
   * Register a new biometric credential with enhanced security
   * @param {string} username - The username
   * @param {Object} options - Registration options
   * @returns {Promise<boolean>} Whether registration was successful
   */
  async register(username, options = {}) {
    if (!username) {
      console.error('[EnhancedBiometricAuth] Username is required for registration');
      return false;
    }
    
    // Update options based on provided parameters
    if (options.mfaEnabled !== undefined) this.mfaEnabled = options.mfaEnabled;
    if (options.securityLevel) this.securityLevel = options.securityLevel;
    if (options.mfaMethods) Object.assign(this.mfaMethods, options.mfaMethods);
    if (options.recoveryEmail) this.recoveryEmail = options.recoveryEmail;
    if (options.recoveryPhone) this.recoveryPhone = options.recoveryPhone;
    
    try {
      // Register with base biometric system
      const registered = await this.biometricAuth.register(username);
      
      if (registered) {
        // Record this device as trusted
        this._addTrustedDevice(username);
        
        // Store the enhanced configuration
        this._saveConfig(username);
        
        console.log(`[EnhancedBiometricAuth] Registered ${username} with enhanced security`);
        return true;
      }
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Registration error:', error);
    }
    
    return false;
  }
  
  /**
   * Authenticate with multi-factor authentication if enabled
   * @param {string} username - The username to authenticate
   * @param {Object} factors - Additional authentication factors
   * @returns {Promise<Object>} Authentication result with session token
   */
  async authenticate(username, factors = {}) {
    // Check if account is locked
    if (this._isAccountLocked()) {
      const remainingLockTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60);
      const errorMsg = `Account temporarily locked. Try again in ${remainingLockTime} minutes.`;
      
      if (this.onAuthFailure) {
        this.onAuthFailure({
          error: 'ACCOUNT_LOCKED',
          message: errorMsg,
          remainingLockTime
        });
      }
      
      return { success: false, error: 'ACCOUNT_LOCKED', message: errorMsg };
    }
    
    // Verify this is a trusted device or require additional verification
    const isTrustedDevice = this._isTrustedDevice(username);
    
    try {
      // First factor: biometric authentication
      const biometricSuccess = await this.biometricAuth.authenticate(username);
      
      if (!biometricSuccess) {
        this._handleFailedAttempt();
        return { 
          success: false, 
          error: 'BIOMETRIC_FAILED',
          message: 'Biometric authentication failed' 
        };
      }
      
      // If MFA is enabled, validate additional factors
      if (this.mfaEnabled) {
        const mfaResult = await this._validateAdditionalFactors(username, factors);
        
        if (!mfaResult.success) {
          this._handleFailedAttempt();
          return mfaResult;
        }
      }
      
      // Reset failed attempts counter on successful auth
      this.failedAttempts = 0;
      
      // If device is not trusted, add it now (after full authentication)
      if (!isTrustedDevice) {
        this._addTrustedDevice(username);
      }
      
      // Create a new session
      const session = this._createSession(username);
      
      // Call success callback if defined
      if (this.onAuthSuccess) {
        this.onAuthSuccess({
          username,
          sessionToken: session.token,
          expiresAt: session.expiresAt
        });
      }
      
      return {
        success: true,
        username,
        sessionToken: session.token,
        expiresAt: session.expiresAt,
        requiresDeviceVerification: !isTrustedDevice
      };
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Authentication error:', error);
      this._handleFailedAttempt();
      
      return { 
        success: false, 
        error: 'AUTH_ERROR',
        message: 'Authentication failed: ' + error.message 
      };
    }
  }
  
  /**
   * Handle a failed authentication attempt
   * @private
   */
  _handleFailedAttempt() {
    this.failedAttempts++;
    
    // Check if we need to lock the account
    if (this.failedAttempts >= this.maxFailedAttempts) {
      this.lockoutUntil = Date.now() + this.lockoutDuration;
      
      // Save lockout information to localStorage
      localStorage.setItem('careunity_auth_lockout', JSON.stringify({
        until: this.lockoutUntil,
        attempts: this.failedAttempts
      }));
      
      // Trigger account locked callback
      if (this.onAccountLocked) {
        this.onAccountLocked({
          failedAttempts: this.failedAttempts,
          lockoutDuration: this.lockoutDuration / 1000 / 60,
          lockoutUntil: this.lockoutUntil
        });
      }
    }
  }
  
  /**
   * Check if the account is currently locked
   * @private
   * @returns {boolean} Whether the account is locked
   */
  _isAccountLocked() {
    // Check if there's a stored lockout
    try {
      const lockoutInfo = JSON.parse(localStorage.getItem('careunity_auth_lockout') || '{}');
      if (lockoutInfo.until) {
        this.lockoutUntil = lockoutInfo.until;
        this.failedAttempts = lockoutInfo.attempts || 0;
        
        // If lockout has expired, clear it
        if (Date.now() > this.lockoutUntil) {
          this._clearLockout();
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error checking lockout status:', error);
    }
    
    return false;
  }
  
  /**
   * Clear account lockout
   * @private
   */
  _clearLockout() {
    this.lockoutUntil = null;
    this.failedAttempts = 0;
    localStorage.removeItem('careunity_auth_lockout');
  }
  
  /**
   * Validate additional authentication factors for MFA
   * @private
   * @param {string} username - The username
   * @param {Object} factors - Additional factors provided
   * @returns {Promise<Object>} Validation result
   */
  async _validateAdditionalFactors(username, factors) {
    // Check which additional factors are required based on security level
    const requiredFactors = this._getRequiredFactors();
    const missingFactors = [];
    
    // Validate PIN if required
    if (this.mfaMethods.pin && requiredFactors.includes('pin')) {
      if (!factors.pin) {
        missingFactors.push('pin');
      } else {
        const pinValid = await this._validatePin(username, factors.pin);
        if (!pinValid) {
          return {
            success: false,
            error: 'INVALID_PIN',
            message: 'The PIN code is incorrect'
          };
        }
      }
    }
    
    // Validate TOTP if required
    if (this.mfaMethods.totp && requiredFactors.includes('totp')) {
      if (!factors.totp) {
        missingFactors.push('totp');
      } else {
        const totpValid = this._validateTOTP(username, factors.totp);
        if (!totpValid) {
          return {
            success: false,
            error: 'INVALID_TOTP',
            message: 'The verification code is incorrect or expired'
          };
        }
      }
    }
    
    // Validate security question if required
    if (this.mfaMethods.securityQuestion && requiredFactors.includes('securityQuestion')) {
      if (!factors.securityAnswer) {
        missingFactors.push('securityQuestion');
      } else {
        const answerValid = this._validateSecurityAnswer(username, factors.securityAnswer);
        if (!answerValid) {
          return {
            success: false,
            error: 'INVALID_SECURITY_ANSWER',
            message: 'The security question answer is incorrect'
          };
        }
      }
    }
    
    // If any required factors are missing, return what's needed
    if (missingFactors.length > 0) {
      return {
        success: false,
        error: 'MISSING_FACTORS',
        message: 'Additional verification required',
        requiredFactors: missingFactors,
        requestId: this._generateRequestId()
      };
    }
    
    // All required factors validated
    return { success: true };
  }
  
  /**
   * Generate a request ID for multi-step authentication
   * @private
   * @returns {string} Request ID
   */
  _generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Get required factors based on security level
   * @private
   * @returns {Array} List of required factors
   */
  _getRequiredFactors() {
    switch (this.securityLevel) {
      case 'maximum':
        // Require all enabled factors
        return Object.keys(this.mfaMethods).filter(method => 
          this.mfaMethods[method] && method !== 'biometric');
          
      case 'high':
        // Require at least one additional factor
        const enabledFactors = Object.keys(this.mfaMethods).filter(method => 
          this.mfaMethods[method] && method !== 'biometric');
        return enabledFactors.slice(0, 1);
        
      case 'standard':
      default:
        // For standard level, biometric alone is sufficient if this is a trusted device
        return this._isTrustedDevice() ? [] : ['pin'];
    }
  }
  
  /**
   * Validate PIN code
   * @private
   * @param {string} username - The username
   * @param {string} pin - The PIN to validate
   * @returns {Promise<boolean>} Whether PIN is valid
   */
  async _validatePin(username, pin) {
    try {
      // Get stored PIN hash
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      if (!userData.pinHash) {
        console.error('[EnhancedBiometricAuth] No PIN set for user');
        return false;
      }
      
      // Hash the provided PIN
      const encoder = new TextEncoder();
      const data = encoder.encode(pin + username); // Salt with username
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare with stored hash
      return hashHex === userData.pinHash;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error validating PIN:', error);
      return false;
    }
  }
  
  /**
   * Set a PIN for the user
   * @param {string} username - The username
   * @param {string} pin - The PIN to set
   * @returns {Promise<boolean>} Whether PIN was set successfully
   */
  async setPin(username, pin) {
    try {
      // Validate PIN format (e.g., 4-6 digits)
      if (!/^\d{4,6}$/.test(pin)) {
        console.error('[EnhancedBiometricAuth] Invalid PIN format');
        return false;
      }
      
      // Hash the PIN
      const encoder = new TextEncoder();
      const data = encoder.encode(pin + username); // Salt with username
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Get current user data
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      // Store the PIN hash
      userData.pinHash = hashHex;
      localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
      
      // Enable PIN as an MFA method
      this.mfaMethods.pin = true;
      this._saveConfig(username);
      
      return true;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error setting PIN:', error);
      return false;
    }
  }
  
  /**
   * Set up TOTP (Time-based One-Time Password) for a user
   * @param {string} username - The username
   * @returns {Promise<Object>} TOTP setup information
   */
  async setupTOTP(username) {
    try {
      // Generate a random secret
      const secret = this._generateTOTPSecret();
      
      // Get current user data
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      // Store the TOTP secret
      userData.totpSecret = secret;
      localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
      
      // Enable TOTP as an MFA method
      this.mfaMethods.totp = true;
      this._saveConfig(username);
      
      // Generate a QR code URL for apps like Google Authenticator
      const appName = encodeURIComponent('CareUnity');
      const encodedUsername = encodeURIComponent(username);
      const encodedSecret = encodeURIComponent(secret);
      const otpAuthUrl = `otpauth://totp/${appName}:${encodedUsername}?secret=${encodedSecret}&issuer=${appName}`;
      
      return {
        success: true,
        secret,
        otpAuthUrl
      };
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error setting up TOTP:', error);
      return {
        success: false,
        error: 'TOTP_SETUP_FAILED',
        message: 'Failed to set up verification code: ' + error.message
      };
    }
  }
  
  /**
   * Generate a random TOTP secret
   * @private
   * @returns {string} TOTP secret
   */
  _generateTOTPSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const randomValues = new Uint8Array(20);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 16; i++) {
      secret += chars[randomValues[i] % chars.length];
    }
    
    return secret;
  }
  
  /**
   * Validate a TOTP code
   * @private
   * @param {string} username - The username
   * @param {string} code - The TOTP code to validate
   * @returns {boolean} Whether the code is valid
   */
  _validateTOTP(username, code) {
    try {
      // Get stored TOTP secret
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      if (!userData.totpSecret) {
        console.error('[EnhancedBiometricAuth] No TOTP secret set for user');
        return false;
      }
      
      // In a real implementation, this would use a TOTP library
      // For now, we'll simulate TOTP validation
      // Note: In production, use a proper TOTP library like 'otplib'
      
      // Get current 30-second time window
      const timeWindow = Math.floor(Date.now() / 30000);
      
      // Generate expected codes for current and adjacent windows
      // (allowing for slight time differences)
      const expectedCodes = [
        this._simulateTOTPCode(userData.totpSecret, timeWindow - 1),
        this._simulateTOTPCode(userData.totpSecret, timeWindow),
        this._simulateTOTPCode(userData.totpSecret, timeWindow + 1)
      ];
      
      // Check if provided code matches any expected code
      return expectedCodes.includes(code);
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error validating TOTP:', error);
      return false;
    }
  }
  
  /**
   * Simulate TOTP code generation (for demonstration purposes)
   * @private
   * @param {string} secret - TOTP secret
   * @param {number} timeWindow - Time window counter
   * @returns {string} 6-digit TOTP code
   */
  _simulateTOTPCode(secret, timeWindow) {
    // In a real implementation, use a proper TOTP algorithm
    // This is a simplified version for demonstration only
    
    // Combine secret with time window
    const combined = secret + timeWindow;
    
    // Generate a hash-like value
    let hashCode = 0;
    for (let i = 0; i < combined.length; i++) {
      hashCode = ((hashCode << 5) - hashCode) + combined.charCodeAt(i);
      hashCode |= 0; // Convert to 32-bit integer
    }
    
    // Convert to 6-digit code
    const code = Math.abs(hashCode) % 1000000;
    return code.toString().padStart(6, '0');
  }
  
  /**
   * Initialize TOTP functionality
   * @private
   * @returns {Promise<void>}
   */
  async _initTOTP() {
    // In a real implementation, this would load any necessary TOTP libraries
    console.log('[EnhancedBiometricAuth] TOTP initialized');
  }
  
  /**
   * Set up a security question for the user
   * @param {string} username - The username
   * @param {string} question - The security question
   * @param {string} answer - The answer to the security question
   * @returns {Promise<boolean>} Whether security question was set up successfully
   */
  async setSecurityQuestion(username, question, answer) {
    try {
      if (!question || !answer) {
        console.error('[EnhancedBiometricAuth] Question and answer required');
        return false;
      }
      
      // Hash the answer
      const encoder = new TextEncoder();
      const data = encoder.encode(answer.toLowerCase() + username); // Salt with username and normalize to lowercase
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Get current user data
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      // Store the security question and answer hash
      userData.securityQuestion = question;
      userData.securityAnswerHash = hashHex;
      localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
      
      // Enable security question as an MFA method
      this.mfaMethods.securityQuestion = true;
      this._saveConfig(username);
      
      return true;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error setting security question:', error);
      return false;
    }
  }
  
  /**
   * Get the security question for a user
   * @param {string} username - The username
   * @returns {string|null} The security question or null if not set
   */
  getSecurityQuestion(username) {
    try {
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      return userData.securityQuestion || null;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error getting security question:', error);
      return null;
    }
  }
  
  /**
   * Validate a security question answer
   * @private
   * @param {string} username - The username
   * @param {string} answer - The security question answer
   * @returns {Promise<boolean>} Whether answer is valid
   */
  async _validateSecurityAnswer(username, answer) {
    try {
      // Get stored answer hash
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      if (!userData.securityAnswerHash) {
        console.error('[EnhancedBiometricAuth] No security answer set for user');
        return false;
      }
      
      // Hash the provided answer
      const encoder = new TextEncoder();
      const data = encoder.encode(answer.toLowerCase() + username); // Salt with username and normalize to lowercase
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare with stored hash
      return hashHex === userData.securityAnswerHash;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error validating security answer:', error);
      return false;
    }
  }
  
  /**
   * Check if a device is trusted for a username
   * @private
   * @param {string} username - The username
   * @returns {boolean} Whether device is trusted
   */
  _isTrustedDevice(username) {
    try {
      // Get device fingerprint
      if (!this.deviceFingerprint) {
        return false;
      }
      
      // Check if this device is in the trusted devices list
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      const trustedDevices = userData.trustedDevices || [];
      
      return trustedDevices.some(device => device.fingerprint === this.deviceFingerprint);
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error checking trusted device:', error);
      return false;
    }
  }
  
  /**
   * Add current device to trusted devices list
   * @private
   * @param {string} username - The username
   */
  _addTrustedDevice(username) {
    try {
      if (!this.deviceFingerprint) {
        return;
      }
      
      // Get current user data
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      // Add this device to trusted devices if not already present
      const trustedDevices = userData.trustedDevices || [];
      
      if (!trustedDevices.some(device => device.fingerprint === this.deviceFingerprint)) {
        trustedDevices.push({
          fingerprint: this.deviceFingerprint,
          name: this._getDeviceName(),
          addedAt: new Date().toISOString()
        });
        
        userData.trustedDevices = trustedDevices;
        localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error adding trusted device:', error);
    }
  }
  
  /**
   * Get a user-friendly name for the current device
   * @private
   * @returns {string} Device name
   */
  _getDeviceName() {
    const ua = navigator.userAgent;
    let deviceName = 'Unknown Device';
    
    // Try to determine device type and name
    if (/iPhone/.test(ua)) {
      deviceName = 'iPhone';
    } else if (/iPad/.test(ua)) {
      deviceName = 'iPad';
    } else if (/Android/.test(ua)) {
      const match = ua.match(/Android [\d\.]+; ([^;]+);/);
      deviceName = match ? `Android (${match[1]})` : 'Android Device';
    } else if (/Windows/.test(ua)) {
      deviceName = 'Windows PC';
    } else if (/Macintosh/.test(ua)) {
      deviceName = 'Mac';
    }
    
    return `${deviceName} (${this._getBrowserName()})`;
  }
  
  /**
   * Get the browser name
   * @private
   * @returns {string} Browser name
   */
  _getBrowserName() {
    const ua = navigator.userAgent;
    
    if (/Chrome/.test(ua) && !/Chromium|Edge|Edg/.test(ua)) {
      return 'Chrome';
    } else if (/Firefox/.test(ua)) {
      return 'Firefox';
    } else if (/Safari/.test(ua) && !/Chrome|Chromium|Edge|Edg/.test(ua)) {
      return 'Safari';
    } else if (/Edge|Edg/.test(ua)) {
      return 'Edge';
    } else if (/MSIE|Trident/.test(ua)) {
      return 'Internet Explorer';
    } else {
      return 'Unknown Browser';
    }
  }
  
  /**
   * Get a list of trusted devices for a user
   * @param {string} username - The username
   * @returns {Array} List of trusted devices
   */
  getTrustedDevices(username) {
    try {
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      return userData.trustedDevices || [];
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error getting trusted devices:', error);
      return [];
    }
  }
  
  /**
   * Remove a trusted device
   * @param {string} username - The username
   * @param {string} deviceFingerprint - Fingerprint of device to remove
   * @returns {boolean} Whether device was removed
   */
  removeTrustedDevice(username, deviceFingerprint) {
    try {
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      const trustedDevices = userData.trustedDevices || [];
      
      const initialCount = trustedDevices.length;
      userData.trustedDevices = trustedDevices.filter(device => device.fingerprint !== deviceFingerprint);
      
      localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
      
      return trustedDevices.length < initialCount;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error removing trusted device:', error);
      return false;
    }
  }
  
  /**
   * Initialize session tracking
   * @private
   */
  _initSessionTracking() {
    // Track user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(eventName => {
      window.addEventListener(eventName, () => {
        this.lastActivityTime = Date.now();
      }, { passive: true });
    });
    
    // Start the session timer
    this._resetSessionTimer();
  }
  
  /**
   * Reset the session timer
   * @private
   */
  _resetSessionTimer() {
    // Clear existing timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    // Set timer for warning before expiry
    const timeUntilWarning = this.sessionTimeout - this.sessionExpiryWarningTime;
    
    this.sessionTimer = setTimeout(() => {
      // Show warning
      this._showSessionExpiryWarning();
      
      // Set timer for actual expiry
      setTimeout(() => {
        this._expireSession();
      }, this.sessionExpiryWarningTime);
    }, timeUntilWarning);
  }
  
  /**
   * Show a warning that the session is about to expire
   * @private
   */
  _showSessionExpiryWarning() {
    // Get the time remaining in seconds
    const secondsRemaining = Math.floor(this.sessionExpiryWarningTime / 1000);
    
    if (this.onSessionExpiring) {
      this.onSessionExpiring({
        secondsRemaining,
        extendSession: () => this._resetSessionTimer()
      });
    }
  }
  
  /**
   * Expire the current session
   * @private
   */
  _expireSession() {
    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
    
    // Clear session token
    localStorage.removeItem('careunity_session');
  }
  
  /**
   * Create a new session
   * @private
   * @param {string} username - The authenticated username
   * @returns {Object} Session information
   */
  _createSession(username) {
    // Generate a session token
    const token = this._generateSessionToken();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);
    
    // Store session information
    const session = {
      token,
      username,
      expiresAt: expiresAt.toISOString(),
      deviceFingerprint: this.deviceFingerprint,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('careunity_session', JSON.stringify(session));
    
    // Start session timer
    this._resetSessionTimer();
    
    return session;
  }
  
  /**
   * Generate a session token
   * @private
   * @returns {string} Session token
   */
  _generateSessionToken() {
    const randomValues = new Uint8Array(32);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Check if there is an active session
   * @returns {Object|null} Session information or null if no active session
   */
  getActiveSession() {
    try {
      const sessionData = JSON.parse(localStorage.getItem('careunity_session') || 'null');
      
      if (!sessionData) {
        return null;
      }
      
      // Check if session has expired
      const expiresAt = new Date(sessionData.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        // Session expired
        localStorage.removeItem('careunity_session');
        return null;
      }
      
      // Check if device fingerprint matches
      if (sessionData.deviceFingerprint !== this.deviceFingerprint) {
        // Session was created on a different device
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error getting active session:', error);
      return null;
    }
  }
  
  /**
   * Set the session timeout
   * @param {number} timeoutMinutes - Timeout in minutes
   */
  setSessionTimeout(timeoutMinutes) {
    if (timeoutMinutes < 1) {
      console.error('[EnhancedBiometricAuth] Session timeout must be at least 1 minute');
      return;
    }
    
    this.sessionTimeout = timeoutMinutes * 60 * 1000;
    
    // Update timer if there's an active session
    const activeSession = this.getActiveSession();
    if (activeSession) {
      this._resetSessionTimer();
    }
  }
  
  /**
   * Set the expiry warning time
   * @param {number} warningSeconds - Warning time in seconds before expiry
   */
  setExpiryWarningTime(warningSeconds) {
    if (warningSeconds < 10) {
      console.error('[EnhancedBiometricAuth] Warning time must be at least 10 seconds');
      return;
    }
    
    this.sessionExpiryWarningTime = warningSeconds * 1000;
  }
  
  /**
   * Log out the current user and end the session
   */
  logout() {
    // Clear session
    localStorage.removeItem('careunity_session');
    
    // Clear session timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }
  
  /**
   * Enable recovery methods for a user
   * @param {string} username - The username
   * @param {Object} recoveryOptions - Recovery options
   * @returns {boolean} Whether recovery was enabled
   */
  enableRecovery(username, recoveryOptions) {
    try {
      if (!username) {
        return false;
      }
      
      // Update recovery options
      this.recoveryEnabled = true;
      if (recoveryOptions.email) this.recoveryEmail = recoveryOptions.email;
      if (recoveryOptions.phone) this.recoveryPhone = recoveryOptions.phone;
      
      // Save config
      this._saveConfig(username);
      
      return true;
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error enabling recovery:', error);
      return false;
    }
  }
  
  /**
   * Save configuration to localStorage
   * @private
   * @param {string} username - The username
   */
  _saveConfig(username) {
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem(`careunity_auth_${username}`) || '{}');
      
      // Update with current configuration
      userData.mfaEnabled = this.mfaEnabled;
      userData.mfaMethods = this.mfaMethods;
      userData.securityLevel = this.securityLevel;
      userData.recoveryEnabled = this.recoveryEnabled;
      userData.recoveryEmail = this.recoveryEmail;
      userData.recoveryPhone = this.recoveryPhone;
      
      // Save back to localStorage
      localStorage.setItem(`careunity_auth_${username}`, JSON.stringify(userData));
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error saving config:', error);
    }
  }
  
  /**
   * Load configuration from localStorage
   * @private
   */
  _loadConfig() {
    try {
      // Get active session to determine current user
      const session = this.getActiveSession();
      
      if (session && session.username) {
        const userData = JSON.parse(localStorage.getItem(`careunity_auth_${session.username}`) || '{}');
        
        // Update with stored configuration
        if (userData.mfaEnabled !== undefined) this.mfaEnabled = userData.mfaEnabled;
        if (userData.mfaMethods) this.mfaMethods = userData.mfaMethods;
        if (userData.securityLevel) this.securityLevel = userData.securityLevel;
        if (userData.recoveryEnabled !== undefined) this.recoveryEnabled = userData.recoveryEnabled;
        if (userData.recoveryEmail) this.recoveryEmail = userData.recoveryEmail;
        if (userData.recoveryPhone) this.recoveryPhone = userData.recoveryPhone;
      }
    } catch (error) {
      console.error('[EnhancedBiometricAuth] Error loading config:', error);
    }
  }
  
  /**
   * Set event callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onSessionExpiring) this.onSessionExpiring = callbacks.onSessionExpiring;
    if (callbacks.onSessionExpired) this.onSessionExpired = callbacks.onSessionExpired;
    if (callbacks.onAuthSuccess) this.onAuthSuccess = callbacks.onAuthSuccess;
    if (callbacks.onAuthFailure) this.onAuthFailure = callbacks.onAuthFailure;
    if (callbacks.onAccountLocked) this.onAccountLocked = callbacks.onAccountLocked;
    
    // Set base biometric auth callbacks
    this.biometricAuth.setCallbacks(
      // Success callback
      (username) => {
        // Don't trigger the full success callback here
        // We'll handle that after MFA verification
      },
      // Error callback
      (error) => {
        if (this.onAuthFailure) {
          this.onAuthFailure({
            error: 'BIOMETRIC_ERROR',
            message: error
          });
        }
      }
    );
  }
  
  /**
   * Get information about the biometric authentication type
   * @returns {Object} Biometric information
   */
  getBiometricInfo() {
    return {
      available: this.biometricAuth.available,
      type: this.biometricAuth.type,
      typeName: this.biometricAuth.getBiometricTypeName(),
      iconName: this.biometricAuth.getBiometricIconName()
    };
  }
}

// Export the enhanced biometric authentication class
window.CareUnity = window.CareUnity || {};
window.CareUnity.EnhancedBiometricAuth = EnhancedBiometricAuth;
