/**
 * MasterCard Payment Gateway Service
 * Simulates MasterCard payment processing
 * In production, integrate with actual payment gateway like Stripe, Square, etc.
 */

// Simulate payment processing
export const processMastercardPayment = async (paymentDetails) => {
  try {
    const {
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      amount,
      orderId
    } = paymentDetails;

    // Validate card details
    if (!validateCardNumber(cardNumber)) {
      return {
        success: false,
        error: "Invalid card number",
        transactionId: null
      };
    }

    if (!validateExpiryDate(expiryDate)) {
      return {
        success: false,
        error: "Card has expired",
        transactionId: null
      };
    }

    if (!validateCVV(cvv)) {
      return {
        success: false,
        error: "Invalid CVV",
        transactionId: null
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: "Invalid amount",
        transactionId: null
      };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate transaction ID (in production, this comes from payment gateway)
    const transactionId = generateTransactionId();

    // Simulate 95% success rate (for testing purposes)
    const isSuccessful = Math.random() < 0.95;

    if (isSuccessful) {
      return {
        success: true,
        transactionId: transactionId,
        message: "Payment processed successfully",
        lastFourDigits: cardNumber.slice(-4),
        amount: amount
      };
    } else {
      return {
        success: false,
        error: "Payment declined. Please check your card details.",
        transactionId: null
      };
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: "Payment processing failed",
      transactionId: null
    };
  }
};

// Validate card number using Luhn algorithm
const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check if it's a valid MasterCard (starts with 51-55 or 2221-2720)
  if (!isMastercardNumber(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Check if card number starts with MasterCard BIN
const isMastercardNumber = (cardNumber) => {
  const firstTwoDigits = parseInt(cardNumber.substring(0, 2));
  const firstFourDigits = parseInt(cardNumber.substring(0, 4));

  // MasterCard range: 51-55 or 2221-2720
  return (firstTwoDigits >= 51 && firstTwoDigits <= 55) ||
         (firstFourDigits >= 2221 && firstFourDigits <= 2720);
};

// Validate expiry date (MM/YY format)
const validateExpiryDate = (expiryDate) => {
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month), 0);
  return expiry > new Date();
};

// Validate CVV (3 or 4 digits)
const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv.replace(/\s/g, ''));
};

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MCC-${timestamp}-${random}`;
};

// Process refund (in production, connect to actual payment gateway)
export const processRefund = async (transactionId, amount, reason) => {
  try {
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate refund transaction ID
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      refundId: refundId,
      originalTransactionId: transactionId,
      amount: amount,
      reason: reason,
      message: "Refund processed successfully"
    };
  } catch (error) {
    console.error("Refund processing error:", error);
    return {
      success: false,
      error: "Refund processing failed"
    };
  }
};

// Get payment status
export const getPaymentStatus = async (transactionId) => {
  try {
    // In production, query the payment gateway
    return {
      transactionId: transactionId,
      status: "completed",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
};
