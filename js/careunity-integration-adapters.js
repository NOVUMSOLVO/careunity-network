/**
 * CareUnity Integration Adapters
 * Provides specialized adapters for different types of healthcare integrations.
 * This module extends the core integration functionality with specific implementations
 * for different healthcare standards and systems.
 */

// Integration adapters namespace
const CareUnityIntegrationAdapters = (function() {
  
  /**
   * FHIR Integration Adapter - Supports Fast Healthcare Interoperability Resources standard
   */
  class FHIRAdapter {
    constructor(config) {
      this.config = config;
      this.apiVersion = config.apiVersion || 'R4';
      this.baseUrl = config.endpoints.base;
      this.authToken = null;
      this.connected = false;
    }
    
    /**
     * Connect to the FHIR server
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Connection result
     */
    async connect(credentials) {
      console.log(`Connecting to FHIR server (${this.apiVersion}): ${this.baseUrl}`);
      
      try {
        // Authenticate with the FHIR server
        const authResponse = await this._authenticate(credentials);
        
        this.authToken = authResponse.token;
        this.connected = true;
        this.lastConnected = new Date().toISOString();
        
        return {
          success: true,
          connectionId: authResponse.connectionId,
          serverDetails: authResponse.serverDetails,
          timestamp: this.lastConnected
        };
      } catch (error) {
        console.error('FHIR connection error:', error);
        throw new Error(`FHIR connection failed: ${error.message}`);
      }
    }
    
    /**
     * Disconnect from the FHIR server
     * @returns {Promise<boolean>} Success indicator
     */
    async disconnect() {
      if (!this.connected) {
        return true; // Already disconnected
      }
      
      try {
        // Logout from the FHIR server
        await this._logout();
        
        this.authToken = null;
        this.connected = false;
        
        return true;
      } catch (error) {
        console.error('FHIR disconnection error:', error);
        throw new Error(`FHIR disconnection failed: ${error.message}`);
      }
    }
    
    /**
     * Search for FHIR resources
     * @param {string} resourceType - The type of resource to search for (e.g., Patient, Observation)
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} Search results
     */
    async search(resourceType, params) {
      this._validateConnection();
      
      const queryParams = new URLSearchParams();
      
      // Add search parameters
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      
      const url = `${this.baseUrl}/${resourceType}?${queryParams.toString()}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Accept': 'application/fhir+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`FHIR search failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR search error:', error);
        throw new Error(`FHIR search failed: ${error.message}`);
      }
    }
    
    /**
     * Read a specific FHIR resource
     * @param {string} resourceType - The type of resource (e.g., Patient, Observation)
     * @param {string} id - The resource ID
     * @returns {Promise<Object>} The resource
     */
    async read(resourceType, id) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/${resourceType}/${id}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Accept': 'application/fhir+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`FHIR read failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR read error:', error);
        throw new Error(`FHIR read failed: ${error.message}`);
      }
    }
    
    /**
     * Create a new FHIR resource
     * @param {string} resourceType - The type of resource (e.g., Patient, Observation)
     * @param {Object} resource - The resource data
     * @returns {Promise<Object>} The created resource
     */
    async create(resourceType, resource) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/${resourceType}`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(resource)
        });
        
        if (!response.ok) {
          throw new Error(`FHIR create failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR create error:', error);
        throw new Error(`FHIR create failed: ${error.message}`);
      }
    }
    
    /**
     * Update an existing FHIR resource
     * @param {string} resourceType - The type of resource (e.g., Patient, Observation)
     * @param {string} id - The resource ID
     * @param {Object} resource - The updated resource data
     * @returns {Promise<Object>} The updated resource
     */
    async update(resourceType, id, resource) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/${resourceType}/${id}`;
      
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(resource)
        });
        
        if (!response.ok) {
          throw new Error(`FHIR update failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR update error:', error);
        throw new Error(`FHIR update failed: ${error.message}`);
      }
    }
    
    /**
     * Delete a FHIR resource
     * @param {string} resourceType - The type of resource (e.g., Patient, Observation)
     * @param {string} id - The resource ID
     * @returns {Promise<boolean>} Success indicator
     */
    async delete(resourceType, id) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/${resourceType}/${id}`;
      
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`FHIR delete failed: ${response.status} ${response.statusText}`);
        }
        
        return true;
      } catch (error) {
        console.error('FHIR delete error:', error);
        throw new Error(`FHIR delete failed: ${error.message}`);
      }
    }
    
    /**
     * Execute a FHIR operation
     * @param {string} resourceType - The type of resource or '' for system operations
     * @param {string} id - The resource ID or '' for type-level operations
     * @param {string} operation - The operation name
     * @param {Object} parameters - The operation parameters
     * @returns {Promise<Object>} Operation result
     */
    async executeOperation(resourceType, id, operation, parameters) {
      this._validateConnection();
      
      let url = this.baseUrl;
      
      if (resourceType) {
        url += `/${resourceType}`;
        if (id) {
          url += `/${id}`;
        }
      }
      
      url += `/$${operation}`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(parameters)
        });
        
        if (!response.ok) {
          throw new Error(`FHIR operation failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR operation error:', error);
        throw new Error(`FHIR operation failed: ${error.message}`);
      }
    }
    
    /**
     * Validate connection status
     * @private
     */
    _validateConnection() {
      if (!this.connected || !this.authToken) {
        throw new Error('Not connected to FHIR server. Call connect() first.');
      }
    }
    
    /**
     * Authenticate with the FHIR server
     * @private
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Authentication result
     */
    async _authenticate(credentials) {
      // Implementation would depend on the authentication method (OAuth2, basic auth, etc.)
      // This is a simplified example
      
      const authEndpoint = this.config.endpoints.auth || `${this.baseUrl}/auth/token`;
      
      try {
        const response = await fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('FHIR authentication error:', error);
        throw new Error(`FHIR authentication failed: ${error.message}`);
      }
    }
    
    /**
     * Logout from the FHIR server
     * @private
     * @returns {Promise<boolean>} Success indicator
     */
    async _logout() {
      if (!this.authToken) {
        return true; // Already logged out
      }
      
      const logoutEndpoint = this.config.endpoints.logout || `${this.baseUrl}/auth/logout`;
      
      try {
        const response = await fetch(logoutEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        return response.ok;
      } catch (error) {
        console.error('FHIR logout error:', error);
        // Even if logout fails, we'll consider ourselves disconnected
        return false;
      }
    }
  }
  
  /**
   * HL7 v2 Integration Adapter - Supports HL7 version 2.x messaging
   */
  class HL7v2Adapter {
    constructor(config) {
      this.config = config;
      this.baseUrl = config.endpoints.base;
      this.authToken = null;
      this.connected = false;
      this.messageQueue = [];
    }
    
    /**
     * Connect to the HL7 gateway
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Connection result
     */
    async connect(credentials) {
      console.log(`Connecting to HL7 gateway: ${this.baseUrl}`);
      
      try {
        // Authenticate with the HL7 gateway
        const authResponse = await this._authenticate(credentials);
        
        this.authToken = authResponse.token;
        this.connected = true;
        this.lastConnected = new Date().toISOString();
        
        // Start message queue processing
        this._startMessageProcessing();
        
        return {
          success: true,
          connectionId: authResponse.connectionId,
          timestamp: this.lastConnected
        };
      } catch (error) {
        console.error('HL7 connection error:', error);
        throw new Error(`HL7 connection failed: ${error.message}`);
      }
    }
    
    /**
     * Disconnect from the HL7 gateway
     * @returns {Promise<boolean>} Success indicator
     */
    async disconnect() {
      if (!this.connected) {
        return true; // Already disconnected
      }
      
      try {
        // Stop message queue processing
        this._stopMessageProcessing();
        
        // Logout from the HL7 gateway
        await this._logout();
        
        this.authToken = null;
        this.connected = false;
        
        return true;
      } catch (error) {
        console.error('HL7 disconnection error:', error);
        throw new Error(`HL7 disconnection failed: ${error.message}`);
      }
    }
    
    /**
     * Send an HL7 message
     * @param {string} messageType - The HL7 message type (e.g., ADT^A01)
     * @param {Object} messageData - The message data
     * @param {boolean} [immediate=false] - Whether to send immediately or queue
     * @returns {Promise<Object>} Message result
     */
    async sendMessage(messageType, messageData, immediate = false) {
      this._validateConnection();
      
      const message = {
        type: messageType,
        data: messageData,
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      if (immediate) {
        return this._sendMessageToServer(message);
      } else {
        this.messageQueue.push(message);
        return {
          success: true,
          queued: true,
          messageId: message.id
        };
      }
    }
    
    /**
     * Query for HL7 messages or results
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} Query results
     */
    async query(queryParams) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/query`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(queryParams)
        });
        
        if (!response.ok) {
          throw new Error(`HL7 query failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('HL7 query error:', error);
        throw new Error(`HL7 query failed: ${error.message}`);
      }
    }
    
    /**
     * Start processing the message queue
     * @private
     */
    _startMessageProcessing() {
      // Process the queue every 5 seconds
      this.queueInterval = setInterval(() => {
        this._processMessageQueue();
      }, 5000);
    }
    
    /**
     * Stop processing the message queue
     * @private
     */
    _stopMessageProcessing() {
      if (this.queueInterval) {
        clearInterval(this.queueInterval);
        this.queueInterval = null;
      }
    }
    
    /**
     * Process pending messages in the queue
     * @private
     */
    async _processMessageQueue() {
      if (this.messageQueue.length === 0) {
        return; // Nothing to process
      }
      
      console.log(`Processing ${this.messageQueue.length} pending HL7 messages`);
      
      // Take up to 10 messages at a time
      const batch = this.messageQueue.splice(0, 10);
      
      try {
        const results = await this._sendMessageBatch(batch);
        
        // Handle results (could log, notify, etc.)
        console.log(`Processed ${results.successful.length} messages successfully`);
        
        // Requeue failed messages if needed
        if (results.failed && results.failed.length > 0) {
          console.error(`Failed to process ${results.failed.length} messages`);
          
          // Add failed messages back to the queue for retry
          this.messageQueue.push(...results.failed.map(f => f.message));
        }
      } catch (error) {
        console.error('Error processing message queue:', error);
        
        // Put the messages back in the queue for retry
        this.messageQueue.unshift(...batch);
      }
    }
    
    /**
     * Send a batch of messages to the server
     * @private
     * @param {Array<Object>} messages - The messages to send
     * @returns {Promise<Object>} Batch result
     */
    async _sendMessageBatch(messages) {
      const url = `${this.baseUrl}/messages/batch`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages })
        });
        
        if (!response.ok) {
          throw new Error(`Batch send failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Message batch send error:', error);
        throw error;
      }
    }
    
    /**
     * Send a single message to the server
     * @private
     * @param {Object} message - The message to send
     * @returns {Promise<Object>} Message result
     */
    async _sendMessageToServer(message) {
      const url = `${this.baseUrl}/messages`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });
        
        if (!response.ok) {
          throw new Error(`Message send failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Message send error:', error);
        throw error;
      }
    }
    
    /**
     * Validate connection status
     * @private
     */
    _validateConnection() {
      if (!this.connected || !this.authToken) {
        throw new Error('Not connected to HL7 gateway. Call connect() first.');
      }
    }
    
    /**
     * Authenticate with the HL7 gateway
     * @private
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Authentication result
     */
    async _authenticate(credentials) {
      const authEndpoint = this.config.endpoints.auth || `${this.baseUrl}/auth`;
      
      try {
        const response = await fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('HL7 authentication error:', error);
        throw error;
      }
    }
    
    /**
     * Logout from the HL7 gateway
     * @private
     * @returns {Promise<boolean>} Success indicator
     */
    async _logout() {
      if (!this.authToken) {
        return true; // Already logged out
      }
      
      const logoutEndpoint = this.config.endpoints.logout || `${this.baseUrl}/auth/logout`;
      
      try {
        const response = await fetch(logoutEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        return response.ok;
      } catch (error) {
        console.error('HL7 logout error:', error);
        // Even if logout fails, we'll consider ourselves disconnected
        return false;
      }
    }
  }
  
  /**
   * CDA Integration Adapter - Supports Clinical Document Architecture
   */
  class CDAAdapter {
    constructor(config) {
      this.config = config;
      this.baseUrl = config.endpoints.base;
      this.authToken = null;
      this.connected = false;
    }
    
    /**
     * Connect to the CDA system
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Connection result
     */
    async connect(credentials) {
      console.log(`Connecting to CDA system: ${this.baseUrl}`);
      
      try {
        // Authenticate with the CDA system
        const authResponse = await this._authenticate(credentials);
        
        this.authToken = authResponse.token;
        this.connected = true;
        this.lastConnected = new Date().toISOString();
        
        return {
          success: true,
          connectionId: authResponse.connectionId,
          timestamp: this.lastConnected
        };
      } catch (error) {
        console.error('CDA connection error:', error);
        throw new Error(`CDA connection failed: ${error.message}`);
      }
    }
    
    /**
     * Disconnect from the CDA system
     * @returns {Promise<boolean>} Success indicator
     */
    async disconnect() {
      if (!this.connected) {
        return true; // Already disconnected
      }
      
      try {
        // Logout from the CDA system
        await this._logout();
        
        this.authToken = null;
        this.connected = false;
        
        return true;
      } catch (error) {
        console.error('CDA disconnection error:', error);
        throw new Error(`CDA disconnection failed: ${error.message}`);
      }
    }
    
    /**
     * Search for CDA documents
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} Search results
     */
    async searchDocuments(params) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/documents/search`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
        
        if (!response.ok) {
          throw new Error(`CDA search failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('CDA search error:', error);
        throw new Error(`CDA search failed: ${error.message}`);
      }
    }
    
    /**
     * Get a specific CDA document
     * @param {string} documentId - The document ID
     * @returns {Promise<Object>} The document
     */
    async getDocument(documentId) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/documents/${documentId}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`CDA get failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('CDA get error:', error);
        throw new Error(`CDA get failed: ${error.message}`);
      }
    }
    
    /**
     * Submit a CDA document
     * @param {Object} document - The document data
     * @returns {Promise<Object>} Submission result
     */
    async submitDocument(document) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/documents`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(document)
        });
        
        if (!response.ok) {
          throw new Error(`CDA submit failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('CDA submit error:', error);
        throw new Error(`CDA submit failed: ${error.message}`);
      }
    }
    
    /**
     * Update a CDA document
     * @param {string} documentId - The document ID
     * @param {Object} document - The updated document data
     * @returns {Promise<Object>} Update result
     */
    async updateDocument(documentId, document) {
      this._validateConnection();
      
      const url = `${this.baseUrl}/documents/${documentId}`;
      
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(document)
        });
        
        if (!response.ok) {
          throw new Error(`CDA update failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('CDA update error:', error);
        throw new Error(`CDA update failed: ${error.message}`);
      }
    }
    
    /**
     * Validate connection status
     * @private
     */
    _validateConnection() {
      if (!this.connected || !this.authToken) {
        throw new Error('Not connected to CDA system. Call connect() first.');
      }
    }
    
    /**
     * Authenticate with the CDA system
     * @private
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Authentication result
     */
    async _authenticate(credentials) {
      const authEndpoint = this.config.endpoints.auth || `${this.baseUrl}/auth`;
      
      try {
        const response = await fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('CDA authentication error:', error);
        throw error;
      }
    }
    
    /**
     * Logout from the CDA system
     * @private
     * @returns {Promise<boolean>} Success indicator
     */
    async _logout() {
      if (!this.authToken) {
        return true; // Already logged out
      }
      
      const logoutEndpoint = this.config.endpoints.logout || `${this.baseUrl}/auth/logout`;
      
      try {
        const response = await fetch(logoutEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        return response.ok;
      } catch (error) {
        console.error('CDA logout error:', error);
        // Even if logout fails, we'll consider ourselves disconnected
        return false;
      }
    }
  }
  
  /**
   * Bluetooth Medical Device Adapter - Supports BLE medical devices
   */
  class BluetoothDeviceAdapter {
    constructor(config) {
      this.config = config;
      this.deviceId = config.deviceId;
      this.deviceName = config.deviceName;
      this.serviceUUID = config.serviceUUID;
      this.characteristicUUIDs = config.characteristicUUIDs || [];
      this.device = null;
      this.server = null;
      this.service = null;
      this.characteristics = {};
      this.connected = false;
      this.listeners = [];
    }
    
    /**
     * Connect to the Bluetooth device
     * @returns {Promise<Object>} Connection result
     */
    async connect() {
      if (this.connected) {
        return {
          success: true,
          alreadyConnected: true,
          device: this.deviceName
        };
      }
      
      console.log(`Connecting to Bluetooth device: ${this.deviceName}`);
      
      try {
        // Request the device
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            {
              name: this.deviceName
            },
            {
              services: [this.serviceUUID]
            }
          ]
        });
        
        // Connect to the GATT server
        this.server = await this.device.gatt.connect();
        
        // Get the service
        this.service = await this.server.getPrimaryService(this.serviceUUID);
        
        // Get characteristics
        for (const uuid of this.characteristicUUIDs) {
          try {
            const characteristic = await this.service.getCharacteristic(uuid);
            this.characteristics[uuid] = characteristic;
          } catch (error) {
            console.warn(`Failed to get characteristic ${uuid}: ${error.message}`);
          }
        }
        
        // Set up disconnection listener
        this.device.addEventListener('gattserverdisconnected', this._handleDisconnection.bind(this));
        
        this.connected = true;
        this.lastConnected = new Date().toISOString();
        
        return {
          success: true,
          device: this.deviceName,
          characteristics: Object.keys(this.characteristics)
        };
      } catch (error) {
        console.error('Bluetooth connection error:', error);
        throw new Error(`Bluetooth connection failed: ${error.message}`);
      }
    }
    
    /**
     * Disconnect from the Bluetooth device
     * @returns {Promise<boolean>} Success indicator
     */
    async disconnect() {
      if (!this.connected || !this.device || !this.device.gatt.connected) {
        return true; // Already disconnected
      }
      
      // Disconnect
      this.device.gatt.disconnect();
      
      // Clean up
      this._cleanUp();
      
      return true;
    }
    
    /**
     * Read a characteristic value
     * @param {string} characteristicUUID - The characteristic UUID
     * @returns {Promise<DataView>} The characteristic value
     */
    async readCharacteristic(characteristicUUID) {
      this._validateConnection();
      
      const characteristic = this.characteristics[characteristicUUID];
      if (!characteristic) {
        throw new Error(`Characteristic not found: ${characteristicUUID}`);
      }
      
      try {
        const value = await characteristic.readValue();
        return value;
      } catch (error) {
        console.error('Bluetooth read error:', error);
        throw new Error(`Failed to read characteristic: ${error.message}`);
      }
    }
    
    /**
     * Write a value to a characteristic
     * @param {string} characteristicUUID - The characteristic UUID
     * @param {ArrayBuffer} value - The value to write
     * @returns {Promise<boolean>} Success indicator
     */
    async writeCharacteristic(characteristicUUID, value) {
      this._validateConnection();
      
      const characteristic = this.characteristics[characteristicUUID];
      if (!characteristic) {
        throw new Error(`Characteristic not found: ${characteristicUUID}`);
      }
      
      try {
        await characteristic.writeValue(value);
        return true;
      } catch (error) {
        console.error('Bluetooth write error:', error);
        throw new Error(`Failed to write characteristic: ${error.message}`);
      }
    }
    
    /**
     * Start notifications for a characteristic
     * @param {string} characteristicUUID - The characteristic UUID
     * @param {Function} listener - The notification listener
     * @returns {Promise<boolean>} Success indicator
     */
    async startNotifications(characteristicUUID, listener) {
      this._validateConnection();
      
      const characteristic = this.characteristics[characteristicUUID];
      if (!characteristic) {
        throw new Error(`Characteristic not found: ${characteristicUUID}`);
      }
      
      try {
        await characteristic.startNotifications();
        
        // Add listener
        characteristic.addEventListener('characteristicvaluechanged', listener);
        
        // Keep track of listener for cleanup
        this.listeners.push({
          characteristicUUID,
          listener
        });
        
        return true;
      } catch (error) {
        console.error('Bluetooth notification error:', error);
        throw new Error(`Failed to start notifications: ${error.message}`);
      }
    }
    
    /**
     * Stop notifications for a characteristic
     * @param {string} characteristicUUID - The characteristic UUID
     * @returns {Promise<boolean>} Success indicator
     */
    async stopNotifications(characteristicUUID) {
      if (!this.connected) {
        return true; // Already disconnected
      }
      
      const characteristic = this.characteristics[characteristicUUID];
      if (!characteristic) {
        return true; // No such characteristic
      }
      
      try {
        await characteristic.stopNotifications();
        
        // Remove listeners for this characteristic
        const listeners = this.listeners.filter(
          l => l.characteristicUUID === characteristicUUID
        );
        
        for (const { listener } of listeners) {
          characteristic.removeEventListener('characteristicvaluechanged', listener);
        }
        
        // Update listeners array
        this.listeners = this.listeners.filter(
          l => l.characteristicUUID !== characteristicUUID
        );
        
        return true;
      } catch (error) {
        console.error('Failed to stop notifications:', error);
        return false;
      }
    }
    
    /**
     * Handle device disconnection
     * @private
     */
    _handleDisconnection(event) {
      console.log(`Bluetooth device disconnected: ${this.deviceName}`);
      
      // Clean up resources
      this._cleanUp();
      
      // Notify application
      const disconnectEvent = new CustomEvent('bluetooth-device-disconnected', {
        detail: {
          deviceName: this.deviceName,
          deviceId: this.deviceId
        }
      });
      
      document.dispatchEvent(disconnectEvent);
    }
    
    /**
     * Clean up resources after disconnection
     * @private
     */
    _cleanUp() {
      // Remove all listeners
      for (const { characteristicUUID, listener } of this.listeners) {
        const characteristic = this.characteristics[characteristicUUID];
        if (characteristic) {
          characteristic.removeEventListener('characteristicvaluechanged', listener);
        }
      }
      
      this.listeners = [];
      this.characteristics = {};
      this.service = null;
      this.server = null;
      this.connected = false;
    }
    
    /**
     * Validate connection status
     * @private
     */
    _validateConnection() {
      if (!this.connected || !this.device || !this.device.gatt.connected) {
        throw new Error('Not connected to Bluetooth device. Call connect() first.');
      }
    }
  }
  
  /**
   * Factory function to create the appropriate adapter
   * @param {string} adapterType - The type of adapter to create
   * @param {Object} config - The adapter configuration
   * @returns {Object} The adapter instance
   */
  function createAdapter(adapterType, config) {
    switch (adapterType) {
      case 'fhir':
        return new FHIRAdapter(config);
      case 'hl7v2':
        return new HL7v2Adapter(config);
      case 'cda':
        return new CDAAdapter(config);
      case 'bluetooth':
        return new BluetoothDeviceAdapter(config);
      default:
        throw new Error(`Unsupported adapter type: ${adapterType}`);
    }
  }
  
  // Public API
  return {
    createAdapter,
    adapterTypes: {
      FHIR: 'fhir',
      HL7V2: 'hl7v2',
      CDA: 'cda',
      BLUETOOTH: 'bluetooth'
    }
  };
})();

// Make available to the main integration module
if (typeof CareUnityIntegration !== 'undefined') {
  CareUnityIntegration.adapters = CareUnityIntegrationAdapters;
}
