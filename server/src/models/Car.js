import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    condition: {
      type: String,
      enum: ["new", "used"],
      required: [true, "Condition is required"],
    },
  images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 10;
        },
        message: "Maximum 10 images allowed"
      }
    },
    customizationOptions: {
      colors: { type: [String], default: [] },
      rims: { type: [String], default: [] },
      accessories: { type: [String], default: [] },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);

