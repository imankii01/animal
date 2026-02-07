/**
 * Buyer Model
 * Tracks milk buyers/dairies
 */

const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      // Type of buyer
      type: String,
      enum: ['dairy', 'cooperative', 'individual', 'corporate'],
      default: 'dairy',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    alternatePhone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    distance: {
      // Distance from farm in km
      type: Number,
      default: 0,
    },
    pricePerLiter: {
      // Standard price offered by this buyer
      type: Number,
      default: 0,
    },
    pickupAvailable: {
      type: Boolean,
      default: false,
    },
    minOrderQuantity: {
      // Minimum liters required per order
      type: Number,
      default: 0,
    },
    paymentTerms: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on_demand'],
      default: 'daily',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    reviews: [
      {
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalQuantitySold: {
      // Total liters sold to this buyer
      type: Number,
      default: 0,
    },
    totalRevenue: {
      // Total money earned from this buyer
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    upiId: {
      type: String,
      default: '',
    },
    tags: [String],
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for geospatial queries
BuyerSchema.index({ 'location.coordinates': '2dsphere' });
BuyerSchema.index({ farmerId: 1, isActive: 1 });
BuyerSchema.index({ farmerId: 1, name: 1 });

// Pre-save hook
BuyerSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Buyer', BuyerSchema);
