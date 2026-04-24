import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    requestedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner of the item is required"],
    },
    itemOffered: {
      itemType: {
        type: String,
        enum: ["car", "part"],
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "itemOffered.itemType === 'car' ? 'Car' : 'Part'",
      },
      itemName: String,
      itemImage: String,
    },
    itemRequested: {
      itemType: {
        type: String,
        enum: ["car", "part"],
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "itemRequested.itemType === 'car' ? 'Car' : 'Part'",
      },
      itemName: String,
      itemImage: String,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
    responseMessage: {
      type: String,
      default: "",
      trim: true,
    },
    respondedAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
exchangeRequestSchema.index({ requestedBy: 1 });
exchangeRequestSchema.index({ requestedFrom: 1 });
exchangeRequestSchema.index({ status: 1 });
exchangeRequestSchema.index({ expiresAt: 1 });

const ExchangeRequest = mongoose.model("ExchangeRequest", exchangeRequestSchema);

export default ExchangeRequest;
