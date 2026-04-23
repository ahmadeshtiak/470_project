import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    // The person giving the rating
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rater is required"],
    },
    // The person receiving the rating
    ratedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rated user is required"],
    },
    // Rating value (1-5)
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    // Review text
    review: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Associated order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
    },
    // Type of interaction (purchase or exchange)
    transactionType: {
      type: String,
      enum: ["purchase", "exchange"],
      default: "purchase",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ratingSchema.index({ ratedUser: 1 });
ratingSchema.index({ ratedBy: 1 });
ratingSchema.index({ order: 1 });

export default mongoose.model("Rating", ratingSchema);
