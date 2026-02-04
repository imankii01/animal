const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    start_time: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    end_time: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      description: 'Duration in seconds',
    },
    milk_quantity: {
      type: Number,
      required: [true, 'Milk quantity is required'],
      min: [0, 'Milk quantity cannot be negative'],
      description: 'Milk quantity in liters',
    },
  },
  {
    timestamps: true,
  }
);

// Validate that end_time is after start_time
sessionSchema.pre('save', function (next) {
  if (this.end_time <= this.start_time) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Index for better query performance
sessionSchema.index({ created_at: -1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
