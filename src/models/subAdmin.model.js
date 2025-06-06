const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const subAdminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      trim: true,
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
        trim: true,
        private: true, // used by the toJSON plugin
      },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    companyName:{
      type:String,
      required:true
    },
    role: {
        type: String,
        enum: roles,
        default: 'subAdmin',
      },
      userType: {
        type: String,
        default: 'subAdmin',
        enum: ['subAdmin'],
        immutable: true, 
      },
      method: {
        type: String,
        enum: ['google'],
        default: undefined 
      },
  },
  {
    timestamps: true,
  }
);

subAdminSchema.plugin(toJSON);
subAdminSchema.plugin(paginate);

subAdminSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

subAdminSchema.statics.isPhoneNumberTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

subAdminSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// admin.model.js
subAdminSchema.pre('save', async function (next) {
  const user = this;
  
  // Only hash password if it exists and is modified
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


const subAdmin = mongoose.model('subAdmin', subAdminSchema);

module.exports = subAdmin;
