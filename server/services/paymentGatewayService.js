const { Settings } = require('../schema/schema');
const bulkClixService = require('./bulkClixService');
const axios = require('axios');
const crypto = require('crypto');

class PaymentGatewayService {
  constructor() {
    this.cache = {
      settings: null,
      lastUpdated: null,
      cacheTimeout: 5 * 60 * 1000 // 5 minutes
    };
  }

  /**
   * Get current payment gateway settings
   */
  async getSettings() {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (this.cache.settings && this.cache.lastUpdated && 
        (now - this.cache.lastUpdated) < this.cache.cacheTimeout) {
      return this.cache.settings;
    }

    try {
      const settings = await Settings.getByType('payment_gateway');
      
      if (!settings) {
        // Create default settings - Paystack only
        const defaultSettings = {
          activeGateway: 'paystack',
          paystackEnabled: true,
          paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
          paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || ''
        };

        await Settings.updateByType('payment_gateway', defaultSettings);
        this.cache.settings = defaultSettings;
        this.cache.lastUpdated = now;
        return defaultSettings;
      }

      this.cache.settings = settings.data;
      this.cache.lastUpdated = now;
      return settings.data;
    } catch (error) {
      console.error('Error getting payment gateway settings:', error);
      // Return default settings on error - Paystack only
      return {
        activeGateway: 'paystack',
        paystackEnabled: true
      };
    }
  }

  /**
   * Get the active payment gateway - always returns Paystack
   */
  async getActiveGateway() {
    return 'paystack';
  }

  /**
   * Check if a gateway is enabled - Paystack is always enabled
   */
  async isGatewayEnabled(gateway) {
    return gateway === 'paystack';
  }

  /**
   * Process mobile money deposit using the active gateway
   */
  async processMobileMoneyDeposit(depositData) {
    const settings = await this.getSettings();
    
    console.log(`[PAYMENT_GATEWAY] Processing mobile money deposit with Paystack`);
    
    try {
      return await this.processPaystackDeposit(depositData, settings);
    } catch (error) {
      console.error(`[PAYMENT_GATEWAY] Error processing deposit with Paystack:`, error);
      throw error;
    }
  }


  /**
   * Process deposit using Paystack
   */
  async processPaystackDeposit(depositData, settings) {
    const { amount, phoneNumber, network, userId, email } = depositData;
    
    // Generate reference
    const reference = `MOMO-${crypto.randomBytes(10).toString('hex')}-${Date.now()}`;
    
    try {
      // Calculate total amount with Paystack fees (2.9% + GHS 0.30)
      const paystackFee = (parseFloat(amount) * 0.029) + 0.30;
      const totalAmountWithFee = parseFloat(amount) + paystackFee;
      const paystackAmount = Math.round(totalAmountWithFee * 100); // Convert to pesewas

      // Initiate Paystack payment
      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: email,
          amount: paystackAmount,
          currency: 'GHS',
          reference,
          callback_url: process.env.NODE_ENV === 'production' 
            ? `${process.env.FRONTEND_URL || 'https://www.unlimiteddatagh.com'}/payment/callback?reference=${reference}&source=unlimiteddata`
            : `http://localhost:3000/payment/callback?reference=${reference}&source=unlimiteddata`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Phone Number',
                variable_name: 'phone_number',
                value: phoneNumber
              },
              {
                display_name: 'Network',
                variable_name: 'network',
                value: network
              },
              {
                display_name: 'Payment Method',
                variable_name: 'payment_method',
                value: 'mobile_money'
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${settings.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        gateway: 'paystack',
        reference,
        paystackUrl: paystackResponse.data.data.authorization_url,
        data: {
          amount: parseFloat(amount),
          totalAmountWithFee: totalAmountWithFee,
          fee: paystackFee,
          phoneNumber,
          network
        }
      };
    } catch (error) {
      console.error('[PAYMENT_GATEWAY] Paystack deposit error:', error);
      throw new Error(`Paystack deposit failed: ${error.message}`);
    }
  }

  /**
   * Process withdrawal using the active gateway
   */
  async processWithdrawal(withdrawalData) {
    const settings = await this.getSettings();
    const activeGateway = settings.activeGateway;

    try {
      if (activeGateway === 'bulkclix' && settings.bulkclixEnabled) {
        return await this.processBulkClixWithdrawal(withdrawalData, settings);
      } else if (activeGateway === 'paystack' && settings.paystackEnabled) {
        return await this.processPaystackWithdrawal(withdrawalData, settings);
      } else {
        throw new Error(`Payment gateway ${activeGateway} is not available for withdrawals`);
      }
    } catch (error) {
      console.error(`[PAYMENT_GATEWAY] Error processing withdrawal with ${activeGateway}:`, error);
      throw error;
    }
  }

  /**
   * Process withdrawal using BulkClix
   */
  async processBulkClixWithdrawal(withdrawalData, settings) {
    const { amount, accountNumber, accountName, bankId, network, phoneNumber } = withdrawalData;
    
    try {
      if (bankId) {
        // Bank withdrawal
        const result = await bulkClixService.sendToBank({
          amount: amount.toString(),
          account_number: accountNumber,
          account_name: accountName,
          bank_id: bankId,
          client_reference: `BANK-${crypto.randomBytes(10).toString('hex')}-${Date.now()}`
        });

        return {
          success: true,
          gateway: 'bulkclix',
          type: 'bank',
          transactionId: result.data?.transaction_id,
          data: result.data
        };
      } else if (network && phoneNumber) {
        // Mobile money withdrawal
        const result = await bulkClixService.sendToMobileMoney({
          amount: amount.toString(),
          account_number: phoneNumber,
          channel: network,
          account_name: accountName,
          client_reference: `MOMO-${crypto.randomBytes(10).toString('hex')}-${Date.now()}`
        });

        return {
          success: true,
          gateway: 'bulkClix',
          type: 'mobile_money',
          transactionId: result.data?.transaction_id,
          data: result.data
        };
      } else {
        throw new Error('Invalid withdrawal data');
      }
    } catch (error) {
      console.error('[PAYMENT_GATEWAY] BulkClix withdrawal error:', error);
      throw new Error(`BulkClix withdrawal failed: ${error.message}`);
    }
  }

  /**
   * Process withdrawal using Paystack (if supported)
   */
  async processPaystackWithdrawal(withdrawalData, settings) {
    // Paystack doesn't support direct withdrawals, so we'll throw an error
    throw new Error('Paystack does not support direct withdrawals. Please use BulkClix for withdrawals.');
  }

  /**
   * Clear settings cache (call this when settings are updated)
   */
  clearCache() {
    this.cache.settings = null;
    this.cache.lastUpdated = null;
  }

  /**
   * Get gateway status
   */
  async getGatewayStatus() {
    const settings = await this.getSettings();
    
    const status = {
      active: settings.activeGateway,
      paystack: {
        enabled: settings.paystackEnabled,
        available: !!settings.paystackSecretKey
      },
      bulkclix: {
        enabled: settings.bulkclixEnabled,
        available: !!settings.bulkclixApiKey
      },
      autoSwitch: settings.autoSwitch,
      fallback: settings.fallbackGateway
    };

    return status;
  }
}

module.exports = new PaymentGatewayService();
