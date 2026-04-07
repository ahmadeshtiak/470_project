# MasterCard Payment Gateway & Transaction System

## Overview

This document describes the new MasterCard payment gateway integration and transaction history system implemented in the MotorWala application.

## Features Implemented

### 1. MasterCard Payment Gateway
- **Secure card payment processing** with full validation
- **Card details validation** including:
  - Luhn algorithm validation for card numbers
  - MasterCard BIN range validation (51-55, 2221-2720)
  - Expiry date validation (MM/YY format)
  - CVV validation (3-4 digits)
- **Simulated payment processing** with transaction ID generation
- **95% success rate simulation** for testing purposes

### 2. Transaction History System
- **Complete transaction tracking** for all payments
- **User transaction history** view with filters
- **Admin transaction management** with comprehensive statistics
- **Transaction details** including payment method, amount, date, and status
- **Refund processing** with reason tracking

### 3. Notification System
- **Payment confirmation notifications** for users
- **Payment failure notifications** with reason
- **Payment refund notifications** with refund ID
- **Order notifications for sellers** with payment details
- **Admin notifications** for payment events

## Database Models

### Transaction Model
```javascript
{
  orderId: ObjectId (ref: Order),
  buyer: ObjectId (ref: User),
  amount: Number,
  paymentMethod: String (enum: ["mastercard", "cod"]),
  mastercardDetails: {
    lastFourDigits: String,
    cardholderName: String,
    transactionId: String (unique)
  },
  status: String (enum: ["pending", "completed", "failed", "refunded"]),
  statusDescription: String,
  processingTime: Date,
  refundDate: Date,
  refundReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String
  },
  timestamps: true
}
```

### Order Model Updates
- Changed `paymentMethod` enum from ["cod", "card"] to ["cod", "mastercard"]
- Added `transaction` field (ref: Transaction)

### Notification Model Updates
- Added new notification types:
  - `payment_confirmed`: Payment successfully processed
  - `payment_failed`: Payment declined
  - `payment_refunded`: Refund processed
- Added optional fields:
  - `transactionId`: Link to transaction
  - `paymentMethod`: MasterCard or COD
  - `amount`: Payment amount

## API Endpoints

### Transaction Endpoints

#### POST `/api/transactions/process-mastercard`
Process a MasterCard payment for an order.

**Request Body:**
```javascript
{
  orderId: String,
  cardNumber: String (numeric only, 13-19 digits),
  cardholderName: String,
  expiryDate: String (MM/YY format),
  cvv: String (3-4 digits),
  amount: Number
}
```

**Response:**
```javascript
{
  success: Boolean,
  data: {
    transaction: Transaction,
    order: Order,
    transactionId: String,
    message: String
  }
}
```

#### GET `/api/transactions/my`
Get transaction history for the current user.

**Response:**
```javascript
{
  success: Boolean,
  data: [Transaction]
}
```

#### GET `/api/transactions/:transactionId`
Get detailed transaction information.

**Response:**
```javascript
{
  success: Boolean,
  data: Transaction
}
```

#### POST `/api/transactions/:transactionId/refund`
Request a refund for a completed transaction.

**Request Body:**
```javascript
{
  reason: String
}
```

**Response:**
```javascript
{
  success: Boolean,
  data: Transaction,
  message: String
}
```

#### GET `/api/transactions/admin/all`
Get all transactions (admin only).

**Response:**
```javascript
{
  success: Boolean,
  data: [Transaction]
}
```

#### GET `/api/transactions/admin/stats`
Get transaction statistics (admin only).

**Response:**
```javascript
{
  success: Boolean,
  data: {
    byStatus: [
      {
        _id: String (status),
        count: Number,
        totalAmount: Number
      }
    ],
    overall: {
      totalTransactions: Number,
      totalRevenue: Number,
      totalCompleted: Number,
      totalRefunded: Number
    }
  }
}
```

## Client Components

### Checkout Page (`Checkout.jsx`)
- **MasterCard Payment Form** with fields:
  - Card Number (with validation)
  - Cardholder Name
  - Expiry Date (MM/YY)
  - CVV (password input for security)
- **Form Validation** for all card details
- **Payment Processing Flow**:
  1. Create order with pending payment status
  2. Process payment with MasterCard gateway
  3. Create transaction record
  4. Update order with payment confirmation
  5. Navigate to invoice with payment details
- **Error Handling** with user-friendly messages
- **Security Indicators** showing encrypted payment

### Transaction History Page (`TransactionHistory.jsx`)
- **Transaction List** with status filters
- **Status Indicators** (completed, pending, failed, refunded)
- **Transaction Details Modal** showing:
  - Basic information (Order ID, Transaction ID, Amount, Status)
  - Payment details (Method, Card holder, Card last 4 digits, Gateway ID)
  - Timeline (Created, Processed, Refunded dates)
  - Order items breakdown
- **Refund Request Feature** for completed transactions
- **Filters** by transaction status
- **Responsive Design** with dark theme

### Admin Transaction Management (`AdminTransactions.jsx`)
- **Dashboard Statistics**:
  - Total transactions count
  - Total revenue
  - Completed transactions
  - Refunded transactions
- **Transaction Table** with columns:
  - Transaction ID
  - Customer name and email
  - Amount
  - Payment method
  - Status
  - Date
  - Action (View details)
- **Filters** by transaction status
- **Refresh Button** to reload data
- **Transaction Details Modal** with:
  - Customer information
  - Transaction information
  - MasterCard details (if applicable)
  - Timeline of events
  - Order details
- **Responsive** table view

## Frontend Integration

### Routes Added to App.js
- `/transactions` - User transaction history (protected)
- `/admin/transactions` - Admin transaction management (protected, admin only)

### Navbar Updates
- Added "💳 Transactions" link for logged-in users
- Added "Admin Transactions" link for admin users

## Payment Processing Flow

### MasterCard Payment Flow

```
1. User selects MasterCard payment method
   ↓
2. Form validation (card details, expiry, CVV)
   ↓
3. Create order with pending payment status
   ↓
4. Submit payment to /transactions/process-mastercard
   ↓
5. Backend validation and processing
   ↓
6. If successful:
   - Create transaction record (status: "completed")
   - Update order (paymentStatus: "paid", status: "confirmed")
   - Create notifications for buyer and sellers
   - Return transaction details
   ↓
7. If failed:
   - Return error message
   - User can retry or use different payment method
   ↓
8. Navigate to invoice with payment details
```

### Refund Flow

```
1. User requests refund from transaction history
   ↓
2. Enter refund reason
   ↓
3. Backend processes refund
   ↓
4. Transaction status updated to "refunded"
   ↓
5. Order status updated to "cancelled"
   ↓
6. Notifications created for buyer and sellers
```

## Security Features

### Client-Side Security
- Password input for CVV (not visible while typing)
- Masked card number display (shows only last 4 digits)
- Real-time validation without server requests
- HTTPS required for production

### Server-Side Security
- Card details only stored as last 4 digits + transaction ID
- Full card details never stored in database
- IP address and user agent tracking for fraud detection
- Transaction ID uniqueness enforcement
- User authorization checks for all endpoints
- Admin-only access to statistics and all transactions

### Validation
- Luhn algorithm for card numbers
- MasterCard BIN range validation
- Expiry date validation against current date
- CVV format validation
- Amount validation

## Testing

### Test Card Numbers
Use these card numbers to test the payment gateway:

**Valid MasterCard (Success):**
- 5555555555554444
- 2221000010000010

**Invalid Cards:**
- 4111111111111111 (Visa, not MasterCard)
- 1234567890123456 (Invalid number)

### Test Expiry Dates
- 12/25 (valid)
- 01/24 (expired if current date is after Jan 2024)

### Test CVV
- Valid: 123, 1234
- Invalid: 12, 12345

## Environment Setup

### Required Files Created
1. `/server/src/models/Transaction.js` - Transaction data model
2. `/server/src/routes/transactions.js` - Transaction API endpoints
3. `/server/src/utils/paymentGateway.js` - Payment processing logic
4. `/client/src/pages/TransactionHistory.jsx` - User transaction history page
5. `/client/src/pages/AdminTransactions.jsx` - Admin transaction management page

### Updated Files
1. `/server/src/models/Order.js` - Added transaction reference
2. `/server/src/models/Notification.js` - Added payment notification types
3. `/server/src/server.js` - Added transaction routes
4. `/server/src/routes/orders.js` - Minor updates for payment handling
5. `/client/src/pages/Checkout.jsx` - Added MasterCard payment form
6. `/client/src/App.js` - Added new routes
7. `/client/src/components/Navbar.js` - Added transaction links

## Production Considerations

### For Real Payment Gateway Integration

To integrate with a real payment gateway (Stripe, Square, etc.):

1. **Update `paymentGateway.js`**:
   - Replace simulated processing with actual gateway API calls
   - Implement proper error handling for gateway responses
   - Add webhook support for payment confirmations

2. **Environment Variables**:
   - Add `PAYMENT_GATEWAY_KEY`
   - Add `PAYMENT_GATEWAY_SECRET`
   - Add `PAYMENT_WEBHOOK_SECRET`

3. **Security**:
   - Use PCI-DSS compliant payment provider
   - Never transmit full card numbers through your servers
   - Use tokenization for storing card references
   - Enable 3D Secure authentication

4. **Error Handling**:
   - Implement proper retry logic
   - Add logging for all transactions
   - Create alerting for failed transactions

5. **Compliance**:
   - Implement PCI-DSS compliance
   - Add terms and conditions for payments
   - Create privacy policy for payment data
   - Implement GDPR compliance for user data

## Troubleshooting

### Common Issues

**Payment validation fails:**
- Ensure card number contains only digits
- Check expiry date format (MM/YY)
- Verify CVV is 3-4 digits
- Confirm it's a valid MasterCard (starts with 51-55 or 2221-2720)

**Transaction not appearing in history:**
- Refresh the transactions page
- Check browser console for errors
- Verify user is logged in
- Ensure API endpoint is responding

**Notification not received:**
- Check notification settings in user profile
- Verify email is correct
- Check email spam folder
- Review notification logs in admin panel

## Future Enhancements

1. **Multiple Payment Methods**:
   - Visa, American Express, Discover
   - Digital wallets (Apple Pay, Google Pay)
   - Bank transfers
   - Mobile money

2. **Advanced Features**:
   - Payment plans and installments
   - Recurring billing
   - Subscription management
   - Gift cards and vouchers

3. **Analytics**:
   - Payment trends and charts
   - Customer payment behavior analysis
   - Fraud detection and prevention
   - Revenue reporting and forecasting

4. **Localization**:
   - Support for multiple currencies
   - Regional payment methods
   - Local payment gateways
   - Language-specific communications

## Support and Documentation

For more information:
- Review API documentation in route files
- Check model schemas for data structure
- Review payment gateway utility for processing logic
- Inspect component files for UI implementation

---

**Last Updated:** December 19, 2025
**Version:** 1.0.0
