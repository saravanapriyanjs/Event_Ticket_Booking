const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      default: 'organizer',
      enum: ['organizer'],
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organizer', organizerSchema);
