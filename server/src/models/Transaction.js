import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["mastercard", "cod"],
      required: true
    },
    mastercardDetails: {
      lastFourDigits: {
        type: String,
        required: function() {
          return this.paymentMethod === "mastercard";
        }
      },
      cardholderName: {
        type: String,
        required: function() {
          return this.paymentMethod === "mastercard";
        }
      },
      transactionId: {
        type: String,
        unique: true,
        sparse: true
      }
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    statusDescription: {
      type: String,
      default: ""
    },
    processingTime: {
      type: Date
    },
    refundDate: {
      type: Date
    },
    refundReason: {
      type: String
    },
    metadata: {
      ipAddress: String,
      userAgent: String
    }
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ 'mastercardDetails.transactionId': 1 });

export default mongoose.model("Transaction", transactionSchema);
