import mongoose from 'mongoose';

// Define PromoCode schema
const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
  },
  isFreePass: {
    type: Boolean,
    default: false,
  },
  maxUses: {
    type: Number,
    required: true,
    min: 1,
    default: 10,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a method to check if the code is valid
PromoCodeSchema.methods.isValid = function() {
  // Check if code is active
  if (!this.isActive) return false;
  
  // Check if code has reached max uses
  if (this.currentUses >= this.maxUses) return false;
  
  // Check if code has expired
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  
  return true;
};

// Add pre-save middleware to set discount to 100% for free passes
PromoCodeSchema.pre('save', function(next) {
  if (this.isFreePass) {
    this.discount = 100;
  }
  this.updatedAt = new Date();
  next();
});

// Try to get the existing model, or create a new one
const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);

export default PromoCode;
