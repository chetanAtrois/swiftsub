const mongoose = require('mongoose');

const AssignedAreaSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subAdmin', // optional
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // optional
    },
    polygon: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]], // [ [ [lng, lat], [lng, lat], ... ] ]
        required: true,
      },
    },
    validForDate: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
    },
  },
  { timestamps: true }
);

AssignedAreaSchema.index({ polygon: '2dsphere' });

const AssignedArea = mongoose.model('AssignedArea', AssignedAreaSchema);
module.exports = AssignedArea;
