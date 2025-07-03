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
      type: [Number], // [longitude, latitude]
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
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

UserLocationSchema.index({ location: '2dsphere' });

const UserLocation = mongoose.model('UserLocation', UserLocationSchema);
module.exports = UserLocation;
