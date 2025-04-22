const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: {type:String},
    industry: {type:String},
    totalEmployees:{
      type:String,
      require:true
    },
    address:{
      type:String,
      required:true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  });
  companySchema.plugin(toJSON);
  companySchema.plugin(paginate);
  const Company = mongoose.model('Company', companySchema);
  
  module.exports = Company;
  