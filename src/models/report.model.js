const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: true,
  },
  title:{
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },

  reportDate: {
    type: Date,
    required: true,
  },
  reportTime: {
    type: String,
    required: true,
  },

  file: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: true,
    },
  },

  images: [
    {
      type: String,
      required: true,
    },
  ],
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  businessSize: {
    type: String,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
