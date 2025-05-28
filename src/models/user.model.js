const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const locationSchema = new mongoose.Schema({
  coordinates: {
    type: [Number], 
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      trim: true,
    },
    companyName:{
      type:String,
      required:false
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: false,
      private: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    address:{
      type:String,
      required:false
    },
    
    method: {
      type: String,
      enum: ['google'],
      default: undefined 
    },
    type:{
      type:String,
      enum:['Client,Partner,Colleague'],
      default:undefined,
      required:false
    },
    
    userType: {
      type: String,
      default: 'user',
      enum: ['user'],
      immutable: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      }
    },
  
    lastUpdated: Date,
  
    locationHistory: {
      type: [locationSchema],
      default: []
    }
  },
  {
    timestamps: true,
  }
);
userSchema.index({ location: '2dsphere' });
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isPhoneNumberTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
