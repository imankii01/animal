/**
 * Milk Sale Model
 * Tracks milk sales transactions
 */

const mongoose = require('mongoose');

const MilkSaleSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
      // Unit: liters
    },
    pricePerLiter: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quality: {
      // Optional: milk quality grade (A, B, C)
      type: String,
      enum: ['A', 'B', 'C', ''],
      default: '',
    },
    fatContent: {
      // Optional: fat content percentage
      type: Number,
      min: 0,
      max: 100,
    },
    sno: {
      // Optional: SNF (Solids-Not-Fat)
      type: Number,
      min: 0,
      max: 100,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'other'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'pending',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      // Auto-generated if needed
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    isDelivered: {
      type: Boolean,
      default: true,
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
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

// Compound index for queries
MilkSaleSchema.index({ farmerId: 1, saleDate: -1 });
MilkSaleSchema.index({ farmerId: 1, paymentStatus: 1 });
MilkSaleSchema.index({ saleDate: -1 });

// Virtual for invoice ID
MilkSaleSchema.virtual('invoiceId').get(function () {
  return this.invoiceNumber || `INV-${this._id}`;
});

// Pre-save hook to calculate totalPrice
MilkSaleSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.pricePerLiter;
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('MilkSale', MilkSaleSchema);
