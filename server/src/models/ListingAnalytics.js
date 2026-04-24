import mongoose from "mongoose";

const listingAnalyticsSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "listingType"
    },
    listingType: {
      type: String,
      enum: ["Car", "Part"],
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: String, // Store listing title for easier reference
    viewCount: {
      type: Number,
      default: 0
    },
    saveCount: {
      type: Number,
      default: 0
    },
    viewers: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        viewedAt: { type: Date, default: Date.now }
      }
    ],
    savers: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        savedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Index for faster queries
listingAnalyticsSchema.index({ seller: 1, createdAt: -1 });

export default mongoose.model("ListingAnalytics", listingAnalyticsSchema);
