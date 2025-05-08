const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
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
  BrandTheyUse: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  images: [{
    type: String,  
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
