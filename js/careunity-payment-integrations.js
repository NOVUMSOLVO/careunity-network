/**
 * CareUnity Payment Integrations
 * Provides specialized functionality for integrating with payment systems
 * and processing healthcare-related financial transactions.
 */

// Payment integrations namespace
const CareUnityPaymentIntegrations = (function() {
  
  // Configuration for different payment providers
  let paymentProviders = {};
  
  // Active payment sessions
  let activeSessions = {};
  
  // Transaction history cache
  let transactionCache = {};
  
  // Constants for payment methods
  const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    ACH: 'ach',
    DIGITAL_WALLET: 'digital_wallet',
    HSA: 'health_savings_account',
    INSURANCE: 'insurance'
  };
  
  // Constants for transaction types
  const TRANSACTION_TYPES = {
    PAYMENT: 'payment',
    REFUND: 'refund',
    AUTHORIZATION: 'authorization',
    CAPTURE: 'capture',
    VOID: 'void'
  };
  
  /**
   * Initialize the payment integrations module
   */
  async function init() {
    console.log('Initializing CareUnity payment integrations');
    await loadPaymentProviders();
    setupEventListeners();
  }
  
  /**
   * Load payment provider configurations from storage
   */
  async function loadPaymentProviders() {
    try {
      const db = await openDatabase();
      
      const transaction = db.transaction(['paymentProviders'], 'readonly');
      const store = transaction.objectStore('paymentProviders');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onerror = event => {
          console.error('Failed to load payment providers:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          const providers = event.target.result || [];
          paymentProviders = {};
          
          providers.forEach(provider => {
            paymentProviders[provider.id] = provider;
          });
          
          console.log(`Loaded ${providers.length} payment providers`);
          resolve(providers);
        };
      });
    } catch (error) {
      console.error('Error loading payment providers:', error);
      return [];
    }
  }
  
  /**
   * Open the payment database
   * @returns {Promise<IDBDatabase>} A promise resolving to the database
   */
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CareUnityDB', 1);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('paymentProviders')) {
          const store = db.createObjectStore('paymentProviders', { keyPath: 'id' });
          store.createIndex('byType', 'type', { unique: false });
          store.createIndex('byStatus', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' });
          store.createIndex('byProvider', 'providerId', { unique: false });
          store.createIndex('byType', 'type', { unique: false });
          store.createIndex('byStatus', 'status', { unique: false });
          store.createIndex('byDate', 'date', { unique: false });
          store.createIndex('byPatient', 'patientId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('paymentMethods')) {
          const store = db.createObjectStore('paymentMethods', { keyPath: 'id' });
          store.createIndex('byPatient', 'patientId', { unique: false });
          store.createIndex('byType', 'type', { unique: false });
        }
      };
      
      request.onerror = event => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
    });
  }
  
  /**
   * Set up event listeners for payment events
   */
  function setupEventListeners() {
    document.addEventListener('payment-process', event => {
      if (event.detail && event.detail.transaction) {
        processPayment(event.detail.transaction);
      }
    });
    
    document.addEventListener('payment-refund', event => {
      if (event.detail && event.detail.transaction) {
        processRefund(event.detail.transaction);
      }
    });
    
    document.addEventListener('payment-method-add', event => {
      if (event.detail && event.detail.paymentMethod) {
        addPaymentMethod(event.detail.paymentMethod);
      }
    });
    
    document.addEventListener('payment-method-remove', event => {
      if (event.detail && event.detail.paymentMethodId) {
        removePaymentMethod(event.detail.paymentMethodId);
      }
    });
  }
  
  /**
   * Register a new payment provider
   * @param {Object} provider - The provider configuration
   */
  async function registerPaymentProvider(provider) {
    // Validate the provider configuration
    validateProviderConfig(provider);
    
    // Ensure it has a unique ID
    if (!provider.id) {
      provider.id = `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add metadata
    provider.createdAt = new Date().toISOString();
    provider.updatedAt = new Date().toISOString();
    provider.status = 'active';
    
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['paymentProviders'], 'readwrite');
      const store = transaction.objectStore('paymentProviders');
      
      return new Promise((resolve, reject) => {
        const request = store.put(provider);
        
        request.onerror = event => {
          console.error('Failed to register payment provider:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          paymentProviders[provider.id] = provider;
          
          console.log(`Registered payment provider: ${provider.name}`);
          
          // Trigger sync with service worker
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
              registration.sync.register('sync-payment-integrations');
            });
          }
          
          resolve(provider);
        };
      });
    } catch (error) {
      console.error('Error registering payment provider:', error);
      throw error;
    }
  }
  
  /**
   * Validate a payment provider configuration
   * @param {Object} provider - The provider configuration to validate
   */
  function validateProviderConfig(provider) {
    const requiredFields = ['name', 'type', 'apiKey', 'endpoints'];
    
    requiredFields.forEach(field => {
      if (!provider[field]) {
        throw new Error(`Payment provider configuration missing required field: ${field}`);
      }
    });
    
    // Validate endpoints
    const requiredEndpoints = ['process', 'refund', 'status'];
    
    requiredEndpoints.forEach(endpoint => {
      if (!provider.endpoints[endpoint]) {
        throw new Error(`Payment provider endpoints missing required endpoint: ${endpoint}`);
      }
    });
    
    return true;
  }
  
  /**
   * Get a payment provider by ID
   * @param {string} providerId - The ID of the provider
   * @returns {Object} The provider configuration
   */
  function getPaymentProvider(providerId) {
    const provider = paymentProviders[providerId];
    
    if (!provider) {
      throw new Error(`Payment provider not found: ${providerId}`);
    }
    
    return provider;
  }
  
  /**
   * Process a payment transaction
   * @param {Object} transaction - The transaction details
   * @returns {Promise<Object>} The transaction result
   */
  async function processPayment(transaction) {
    validateTransaction(transaction);
    
    const provider = getPaymentProvider(transaction.providerId);
    
    // Create a transaction record
    const transactionRecord = {
      ...transaction,
      id: transaction.id || `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: TRANSACTION_TYPES.PAYMENT
    };
    
    // Save the initial transaction record
    await saveTransactionRecord(transactionRecord);
    
    try {
      // Process the payment using the provider
      const result = await callPaymentProviderApi(
        provider,
        'process',
        transactionRecord
      );
      
      // Update the transaction record with the result
      const updatedTransaction = {
        ...transactionRecord,
        status: result.success ? 'completed' : 'failed',
        providerTransactionId: result.transactionId,
        providerResponse: result,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated transaction record
      await saveTransactionRecord(updatedTransaction);
      
      // Notify about the result
      notifyTransactionResult(updatedTransaction);
      
      return updatedTransaction;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Update the transaction record with the error
      const failedTransaction = {
        ...transactionRecord,
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      };
      
      // Save the failed transaction record
      await saveTransactionRecord(failedTransaction);
      
      // Notify about the failure
      notifyTransactionResult(failedTransaction);
      
      throw error;
    }
  }
  
  /**
   * Process a refund transaction
   * @param {Object} transaction - The refund transaction details
   * @returns {Promise<Object>} The refund result
   */
  async function processRefund(transaction) {
    validateRefundTransaction(transaction);
    
    const provider = getPaymentProvider(transaction.providerId);
    
    // Create a refund record
    const refundRecord = {
      ...transaction,
      id: transaction.id || `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: TRANSACTION_TYPES.REFUND
    };
    
    // Save the initial refund record
    await saveTransactionRecord(refundRecord);
    
    try {
      // Process the refund using the provider
      const result = await callPaymentProviderApi(
        provider,
        'refund',
        refundRecord
      );
      
      // Update the refund record with the result
      const updatedRefund = {
        ...refundRecord,
        status: result.success ? 'completed' : 'failed',
        providerTransactionId: result.transactionId,
        providerResponse: result,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated refund record
      await saveTransactionRecord(updatedRefund);
      
      // Notify about the result
      notifyTransactionResult(updatedRefund);
      
      return updatedRefund;
    } catch (error) {
      console.error('Refund processing error:', error);
      
      // Update the refund record with the error
      const failedRefund = {
        ...refundRecord,
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      };
      
      // Save the failed refund record
      await saveTransactionRecord(failedRefund);
      
      // Notify about the failure
      notifyTransactionResult(failedRefund);
      
      throw error;
    }
  }
  
  /**
   * Validate a payment transaction
   * @param {Object} transaction - The transaction to validate
   */
  function validateTransaction(transaction) {
    const requiredFields = ['amount', 'currency', 'providerId', 'paymentMethodId'];
    
    requiredFields.forEach(field => {
      if (!transaction[field]) {
        throw new Error(`Transaction missing required field: ${field}`);
      }
    });
    
    // Validate amount
    if (isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }
    
    return true;
  }
  
  /**
   * Validate a refund transaction
   * @param {Object} transaction - The refund transaction to validate
   */
  function validateRefundTransaction(transaction) {
    const requiredFields = ['amount', 'currency', 'providerId', 'originalTransactionId'];
    
    requiredFields.forEach(field => {
      if (!transaction[field]) {
        throw new Error(`Refund transaction missing required field: ${field}`);
      }
    });
    
    // Validate amount
    if (isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      throw new Error('Refund amount must be a positive number');
    }
    
    return true;
  }
  
  /**
   * Save a transaction record to the database
   * @param {Object} transaction - The transaction record to save
   */
  async function saveTransactionRecord(transaction) {
    try {
      const db = await openDatabase();
      const transaction_db = db.transaction(['transactions'], 'readwrite');
      const store = transaction_db.objectStore('transactions');
      
      return new Promise((resolve, reject) => {
        const request = store.put(transaction);
        
        request.onerror = event => {
          console.error('Failed to save transaction record:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          // Update the cache
          transactionCache[transaction.id] = transaction;
          
          // Trigger offline sync if needed
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
              registration.sync.register('sync-transactions');
            });
          }
          
          resolve(transaction);
        };
      });
    } catch (error) {
      console.error('Error saving transaction record:', error);
      throw error;
    }
  }
  
  /**
   * Call a payment provider API
   * @param {Object} provider - The payment provider configuration
   * @param {string} endpoint - The endpoint to call
   * @param {Object} data - The data to send
   * @returns {Promise<Object>} The API response
   */
  async function callPaymentProviderApi(provider, endpoint, data) {
    const url = provider.endpoints[endpoint];
    
    if (!url) {
      throw new Error(`Payment provider ${provider.name} does not support endpoint: ${endpoint}`);
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
          'X-Partner-ID': provider.partnerId || 'CareUnity',
          'X-Device-ID': getDeviceId()
        },
        body: JSON.stringify(prepareDataForProvider(provider, data))
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment provider API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Payment provider API call failed (${endpoint}):`, error);
      throw error;
    }
  }
  
  /**
   * Prepare data for a specific provider format
   * @param {Object} provider - The payment provider
   * @param {Object} data - The data to prepare
   * @returns {Object} The formatted data
   */
  function prepareDataForProvider(provider, data) {
    // Default implementation - can be extended for specific providers
    switch (provider.type) {
      case 'stripe':
        return formatForStripe(data);
      case 'square':
        return formatForSquare(data);
      case 'paypal':
        return formatForPayPal(data);
      default:
        // Generic format
        return {
          amount: data.amount,
          currency: data.currency,
          reference: data.id,
          description: data.description || 'CareUnity Healthcare Payment',
          metadata: {
            patientId: data.patientId,
            visitId: data.visitId,
            careUnityId: data.id
          },
          paymentMethod: data.paymentMethodId,
          originalTransaction: data.originalTransactionId
        };
    }
  }
  
  /**
   * Format data for Stripe
   * @param {Object} data - The data to format
   * @returns {Object} Stripe-formatted data
   */
  function formatForStripe(data) {
    return {
      amount: Math.round(parseFloat(data.amount) * 100), // Stripe uses cents
      currency: data.currency.toLowerCase(),
      payment_method: data.paymentMethodId,
      description: data.description || 'CareUnity Healthcare Payment',
      metadata: {
        patient_id: data.patientId,
        visit_id: data.visitId,
        care_unity_id: data.id
      },
      payment_method_types: ['card'],
      confirmation_method: 'automatic',
      confirm: true
    };
  }
  
  /**
   * Format data for Square
   * @param {Object} data - The data to format
   * @returns {Object} Square-formatted data
   */
  function formatForSquare(data) {
    return {
      amount_money: {
        amount: Math.round(parseFloat(data.amount) * 100), // Square uses cents
        currency: data.currency
      },
      source_id: data.paymentMethodId,
      idempotency_key: data.id,
      note: data.description || 'CareUnity Healthcare Payment',
      reference_id: data.id
    };
  }
  
  /**
   * Format data for PayPal
   * @param {Object} data - The data to format
   * @returns {Object} PayPal-formatted data
   */
  function formatForPayPal(data) {
    return {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: data.currency,
            value: data.amount.toString()
          },
          reference_id: data.id,
          description: data.description || 'CareUnity Healthcare Payment',
          custom_id: data.id
        }
      ],
      payment_source: {
        token: {
          id: data.paymentMethodId,
          type: 'PAYMENT_METHOD_TOKEN'
        }
      }
    };
  }
  
  /**
   * Notify about a transaction result
   * @param {Object} transaction - The transaction result
   */
  function notifyTransactionResult(transaction) {
    const eventType = transaction.status === 'completed'
      ? (transaction.type === TRANSACTION_TYPES.REFUND ? 'refund-completed' : 'payment-completed')
      : (transaction.type === TRANSACTION_TYPES.REFUND ? 'refund-failed' : 'payment-failed');
    
    const event = new CustomEvent(`payment-${eventType}`, {
      detail: { transaction }
    });
    
    document.dispatchEvent(event);
    
    // Update the UI
    updatePaymentUI(transaction);
  }
  
  /**
   * Update the payment UI with transaction status
   * @param {Object} transaction - The transaction
   */
  function updatePaymentUI(transaction) {
    // This would update any UI elements showing transaction status
    const transactionElements = document.querySelectorAll(`[data-transaction-id="${transaction.id}"]`);
    
    transactionElements.forEach(element => {
      // Update status
      const statusElement = element.querySelector('.transaction-status');
      if (statusElement) {
        statusElement.textContent = transaction.status;
        statusElement.className = `transaction-status status-${transaction.status}`;
      }
      
      // Update amount
      const amountElement = element.querySelector('.transaction-amount');
      if (amountElement) {
        amountElement.textContent = `${transaction.currency} ${transaction.amount}`;
      }
      
      // Update date
      const dateElement = element.querySelector('.transaction-date');
      if (dateElement) {
        dateElement.textContent = new Date(transaction.updatedAt).toLocaleString();
      }
    });
  }
  
  /**
   * Add a payment method
   * @param {Object} paymentMethod - The payment method to add
   * @returns {Promise<Object>} The saved payment method
   */
  async function addPaymentMethod(paymentMethod) {
    validatePaymentMethod(paymentMethod);
    
    // Ensure it has a unique ID
    if (!paymentMethod.id) {
      paymentMethod.id = `pm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add metadata
    paymentMethod.createdAt = new Date().toISOString();
    paymentMethod.updatedAt = new Date().toISOString();
    
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['paymentMethods'], 'readwrite');
      const store = transaction.objectStore('paymentMethods');
      
      return new Promise((resolve, reject) => {
        const request = store.put(paymentMethod);
        
        request.onerror = event => {
          console.error('Failed to save payment method:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          console.log(`Saved payment method: ${paymentMethod.id}`);
          
          // Notify about the new payment method
          const event = new CustomEvent('payment-method-added', {
            detail: { paymentMethod }
          });
          
          document.dispatchEvent(event);
          
          resolve(paymentMethod);
        };
      });
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  }
  
  /**
   * Validate a payment method
   * @param {Object} paymentMethod - The payment method to validate
   */
  function validatePaymentMethod(paymentMethod) {
    const requiredFields = ['type', 'patientId'];
    
    requiredFields.forEach(field => {
      if (!paymentMethod[field]) {
        throw new Error(`Payment method missing required field: ${field}`);
      }
    });
    
    // Validate type-specific fields
    switch (paymentMethod.type) {
      case PAYMENT_METHODS.CREDIT_CARD:
        if (!paymentMethod.tokenizedCard) {
          throw new Error('Credit card payment method missing tokenizedCard field');
        }
        break;
      case PAYMENT_METHODS.ACH:
        if (!paymentMethod.tokenizedAccount) {
          throw new Error('ACH payment method missing tokenizedAccount field');
        }
        break;
      case PAYMENT_METHODS.DIGITAL_WALLET:
        if (!paymentMethod.walletType || !paymentMethod.tokenizedWallet) {
          throw new Error('Digital wallet payment method missing walletType or tokenizedWallet field');
        }
        break;
      case PAYMENT_METHODS.HSA:
        if (!paymentMethod.tokenizedCard || !paymentMethod.hsaType) {
          throw new Error('HSA payment method missing tokenizedCard or hsaType field');
        }
        break;
      case PAYMENT_METHODS.INSURANCE:
        if (!paymentMethod.insuranceProvider || !paymentMethod.policyNumber) {
          throw new Error('Insurance payment method missing insuranceProvider or policyNumber field');
        }
        break;
    }
    
    return true;
  }
  
  /**
   * Remove a payment method
   * @param {string} paymentMethodId - The ID of the payment method to remove
   * @returns {Promise<boolean>} Success indicator
   */
  async function removePaymentMethod(paymentMethodId) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['paymentMethods'], 'readwrite');
      const store = transaction.objectStore('paymentMethods');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(paymentMethodId);
        
        request.onerror = event => {
          console.error('Failed to remove payment method:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          console.log(`Removed payment method: ${paymentMethodId}`);
          
          // Notify about the removed payment method
          const event = new CustomEvent('payment-method-removed', {
            detail: { paymentMethodId }
          });
          
          document.dispatchEvent(event);
          
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }
  
  /**
   * Get payment methods for a patient
   * @param {string} patientId - The patient ID
   * @returns {Promise<Array<Object>>} The patient's payment methods
   */
  async function getPatientPaymentMethods(patientId) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['paymentMethods'], 'readonly');
      const store = transaction.objectStore('paymentMethods');
      const index = store.index('byPatient');
      const request = index.getAll(patientId);
      
      return new Promise((resolve, reject) => {
        request.onerror = event => {
          console.error('Failed to get payment methods:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          const paymentMethods = event.target.result || [];
          resolve(paymentMethods);
        };
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction history for a patient
   * @param {string} patientId - The patient ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} The patient's transactions
   */
  async function getPatientTransactionHistory(patientId, options = {}) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('byPatient');
      const request = index.getAll(patientId);
      
      return new Promise((resolve, reject) => {
        request.onerror = event => {
          console.error('Failed to get transaction history:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          let transactions = event.target.result || [];
          
          // Apply filters
          if (options.status) {
            transactions = transactions.filter(t => t.status === options.status);
          }
          
          if (options.type) {
            transactions = transactions.filter(t => t.type === options.type);
          }
          
          if (options.startDate) {
            const startDate = new Date(options.startDate);
            transactions = transactions.filter(t => new Date(t.createdAt) >= startDate);
          }
          
          if (options.endDate) {
            const endDate = new Date(options.endDate);
            transactions = transactions.filter(t => new Date(t.createdAt) <= endDate);
          }
          
          // Sort by date, newest first
          transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          resolve(transactions);
        };
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }
  
  /**
   * Get a transaction by ID
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} The transaction
   */
  async function getTransaction(transactionId) {
    // Check cache first
    if (transactionCache[transactionId]) {
      return transactionCache[transactionId];
    }
    
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.get(transactionId);
      
      return new Promise((resolve, reject) => {
        request.onerror = event => {
          console.error('Failed to get transaction:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          const transaction = event.target.result;
          
          if (!transaction) {
            reject(new Error(`Transaction not found: ${transactionId}`));
            return;
          }
          
          // Cache the result
          transactionCache[transactionId] = transaction;
          
          resolve(transaction);
        };
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }
  
  /**
   * Check the status of a transaction with the payment provider
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} The updated transaction
   */
  async function checkTransactionStatus(transactionId) {
    try {
      const transaction = await getTransaction(transactionId);
      const provider = getPaymentProvider(transaction.providerId);
      
      // Call the status endpoint
      const result = await callPaymentProviderApi(
        provider,
        'status',
        {
          id: transaction.id,
          providerTransactionId: transaction.providerTransactionId
        }
      );
      
      // Update the transaction status if it has changed
      if (result.status && result.status !== transaction.status) {
        const updatedTransaction = {
          ...transaction,
          status: result.status,
          providerResponse: result,
          updatedAt: new Date().toISOString()
        };
        
        // Save the updated transaction
        await saveTransactionRecord(updatedTransaction);
        
        // Notify about the status change
        notifyTransactionResult(updatedTransaction);
        
        return updatedTransaction;
      }
      
      return transaction;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  }
  
  /**
   * Generate a payment receipt
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} The receipt data
   */
  async function generateReceipt(transactionId) {
    try {
      const transaction = await getTransaction(transactionId);
      
      // Only completed transactions can have receipts
      if (transaction.status !== 'completed') {
        throw new Error(`Cannot generate receipt for transaction with status: ${transaction.status}`);
      }
      
      // Format receipt data
      const receipt = {
        id: `rcpt-${transaction.id}`,
        transactionId: transaction.id,
        patientId: transaction.patientId,
        providerId: transaction.providerId,
        amount: transaction.amount,
        currency: transaction.currency,
        date: transaction.updatedAt,
        description: transaction.description || 'Healthcare Payment',
        type: transaction.type,
        paymentMethod: await getPaymentMethodSummary(transaction.paymentMethodId),
        generatedAt: new Date().toISOString()
      };
      
      // Generate receipt HTML
      const receiptHtml = generateReceiptHtml(receipt);
      
      return {
        receipt,
        html: receiptHtml
      };
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }
  
  /**
   * Get a payment method summary (masked details)
   * @param {string} paymentMethodId - The payment method ID
   * @returns {Promise<Object>} The payment method summary
   */
  async function getPaymentMethodSummary(paymentMethodId) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['paymentMethods'], 'readonly');
      const store = transaction.objectStore('paymentMethods');
      const request = store.get(paymentMethodId);
      
      return new Promise((resolve, reject) => {
        request.onerror = event => {
          console.error('Failed to get payment method:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = event => {
          const paymentMethod = event.target.result;
          
          if (!paymentMethod) {
            resolve({
              id: paymentMethodId,
              type: 'unknown'
            });
            return;
          }
          
          // Create a masked/summarized version for receipts
          const summary = {
            id: paymentMethod.id,
            type: paymentMethod.type,
            isDefault: paymentMethod.isDefault
          };
          
          // Add type-specific summary info
          switch (paymentMethod.type) {
            case PAYMENT_METHODS.CREDIT_CARD:
              summary.cardBrand = paymentMethod.cardBrand || 'Unknown';
              summary.last4 = paymentMethod.last4 || '****';
              break;
            case PAYMENT_METHODS.ACH:
              summary.bankName = paymentMethod.bankName || 'Unknown';
              summary.last4 = paymentMethod.last4 || '****';
              break;
            case PAYMENT_METHODS.DIGITAL_WALLET:
              summary.walletType = paymentMethod.walletType || 'Unknown';
              break;
            case PAYMENT_METHODS.HSA:
              summary.hsaType = paymentMethod.hsaType || 'HSA';
              summary.cardBrand = paymentMethod.cardBrand || 'Unknown';
              summary.last4 = paymentMethod.last4 || '****';
              break;
            case PAYMENT_METHODS.INSURANCE:
              summary.insuranceProvider = paymentMethod.insuranceProvider || 'Unknown';
              summary.policyName = paymentMethod.policyName || 'Unknown';
              break;
          }
          
          resolve(summary);
        };
      });
    } catch (error) {
      console.error('Error getting payment method summary:', error);
      throw error;
    }
  }
  
  /**
   * Generate HTML for a receipt
   * @param {Object} receipt - The receipt data
   * @returns {string} The receipt HTML
   */
  function generateReceiptHtml(receipt) {
    const dateFormatted = new Date(receipt.date).toLocaleDateString();
    const timeFormatted = new Date(receipt.date).toLocaleTimeString();
    
    // Format amount with 2 decimal places
    const amountFormatted = parseFloat(receipt.amount).toFixed(2);
    
    // Payment method info
    let paymentMethodInfo = 'Payment method information unavailable';
    
    if (receipt.paymentMethod) {
      switch (receipt.paymentMethod.type) {
        case PAYMENT_METHODS.CREDIT_CARD:
          paymentMethodInfo = `${receipt.paymentMethod.cardBrand} •••• ${receipt.paymentMethod.last4}`;
          break;
        case PAYMENT_METHODS.ACH:
          paymentMethodInfo = `ACH - ${receipt.paymentMethod.bankName} •••• ${receipt.paymentMethod.last4}`;
          break;
        case PAYMENT_METHODS.DIGITAL_WALLET:
          paymentMethodInfo = receipt.paymentMethod.walletType;
          break;
        case PAYMENT_METHODS.HSA:
          paymentMethodInfo = `${receipt.paymentMethod.hsaType} - ${receipt.paymentMethod.cardBrand} •••• ${receipt.paymentMethod.last4}`;
          break;
        case PAYMENT_METHODS.INSURANCE:
          paymentMethodInfo = `Insurance - ${receipt.paymentMethod.insuranceProvider} (${receipt.paymentMethod.policyName})`;
          break;
      }
    }
    
    return `
      <div class="receipt">
        <div class="receipt-header">
          <h1>CareUnity Receipt</h1>
          <p class="receipt-date">${dateFormatted} at ${timeFormatted}</p>
          <p class="receipt-id">Receipt ID: ${receipt.id}</p>
        </div>
        
        <div class="receipt-body">
          <div class="receipt-amount">
            <h2>${receipt.currency} ${amountFormatted}</h2>
            <p class="receipt-type">${receipt.type === TRANSACTION_TYPES.PAYMENT ? 'Payment' : 'Refund'}</p>
          </div>
          
          <div class="receipt-details">
            <p><strong>Description:</strong> ${receipt.description}</p>
            <p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
            <p><strong>Payment Method:</strong> ${paymentMethodInfo}</p>
          </div>
        </div>
        
        <div class="receipt-footer">
          <p>Thank you for choosing CareUnity for your healthcare needs.</p>
          <p>If you have any questions about this receipt, please contact our billing department.</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Get device ID for tracking transactions
   * @returns {string} The device ID
   */
  function getDeviceId() {
    // Try to get from localStorage
    let deviceId = localStorage.getItem('careunity_device_id');
    
    // Generate if not found
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('careunity_device_id', deviceId);
    }
    
    return deviceId;
  }
  
  /**
   * Public API for the payment integrations module
   */
  return {
    init,
    PAYMENT_METHODS,
    TRANSACTION_TYPES,
    
    // Provider management
    registerPaymentProvider,
    getPaymentProvider,
    
    // Transaction processing
    processPayment,
    processRefund,
    checkTransactionStatus,
    getTransaction,
    getPatientTransactionHistory,
    
    // Payment methods
    addPaymentMethod,
    removePaymentMethod,
    getPatientPaymentMethods,
    
    // Receipts
    generateReceipt
  };
})();

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  CareUnityPaymentIntegrations.init();
});

// Support for service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then(registration => {
      console.log('CareUnity Payment Integrations module registered with service worker');
    });
  });
}
