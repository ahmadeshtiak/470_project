import mongoose from "mongoose";

const userDesignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional - allows guest uploads
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    carInfo: {
      brand: String,
      model: String,
      selections: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserDesign", userDesignSchema);

