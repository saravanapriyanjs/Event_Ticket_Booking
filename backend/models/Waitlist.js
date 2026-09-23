const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['WAITING', 'NOTIFIED', 'CONVERTED', 'CANCELLED'],
      default: 'WAITING',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate active waitlist entries for the same user and event
waitlistSchema.index({ userId: 1, eventId: 1, status: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
