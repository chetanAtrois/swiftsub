const mongoose = require('mongoose');

const UserLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  locationHistory: [
    {
      coordinates: {
        type: [Number],
        required: true,
      },
      isInside: {
        type: Boolean,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// ✅ Geo index for location
UserLocationSchema.index({ location: '2dsphere' });

// ✅ Prevent OverwriteModelError
const UserLocation = mongoose.models.UserLocation || mongoose.model('UserLocation', UserLocationSchema);

module.exports = UserLocation;
