import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["order_received", "order_dispatched", "order_delivered", "order_cancelled", "payment_confirmed", "payment_failed", "payment_refunded"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        },
        paymentMethod: {
            type: String,
            enum: ["mastercard", "cod"]
        },
        amount: {
            type: Number
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
