import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatorItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Can reference either Car or Part
  },
  initiatorItemType: {
    type: String,
    enum: ['car', 'part'],
    required: true
  },
  receiverItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Can reference either Car or Part
  },
  receiverItemType: {
    type: String,
    enum: ['car', 'part'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapRequestSchema.index({ initiator: 1, status: 1 });
swapRequestSchema.index({ receiver: 1, status: 1 });

export default mongoose.model('SwapRequest', swapRequestSchema);