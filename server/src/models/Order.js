import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'items.productType' },
    productType: { type: String, required: true, enum: ['Car', 'Part'], default: 'Part' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // Total price
    basePrice: { type: Number }, // Base price before customizations
    quantity: { type: Number, required: true, min: 1 },
    customizations: {
      color: mongoose.Schema.Types.Mixed, // Can be String or { name, price }
      rims: mongoose.Schema.Types.Mixed,
      tyres: mongoose.Schema.Types.Mixed,
      interior: mongoose.Schema.Types.Mixed,
      accessories: [mongoose.Schema.Types.Mixed]
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String }
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "mastercard"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isRatedByBuyer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

