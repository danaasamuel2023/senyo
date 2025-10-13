
// Fallback purchase handler for when DataMart API is unavailable
const handleFallbackPurchase = async (userId, phoneNumber, network, capacity, price) => {
  try {
    // Validate price against fallback pricing
    const fallbackPricing = require('./fallback-pricing.json');
    const networkPricing = fallbackPricing[network];
    
    if (!networkPricing || !networkPricing[capacity]) {
      throw new Error(`Unsupported network/capacity: ${network}/${capacity}`);
    }
    
    const expectedPrice = networkPricing[capacity];
    const priceDifference = Math.abs(price - expectedPrice);
    const tolerance = expectedPrice * 0.05; // 5% tolerance
    
    if (priceDifference > tolerance) {
      throw new Error(`Price mismatch: expected ₵${expectedPrice}, got ₵${price}`);
    }
    
    // Process purchase with fallback method
    const orderReference = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      status: 'success',
      data: {
        orderReference,
        status: 'pending',
        message: 'Order processed in fallback mode',
        processingMethod: 'fallback',
        network,
        capacity,
        price,
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX'
      }
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      processingMethod: 'fallback'
    };
  }
};

module.exports = { handleFallbackPurchase };
