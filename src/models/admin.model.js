const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const adminSchema = mongoose.Schema(
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
        minlength: 8,
        validate(value) {
          if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            throw new Error('Password must contain at least one letter and one number');
          }
        },
        private: true, // used by the toJSON plugin
      },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
        type: String,
        enum: roles,
        default: 'admin',
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

adminSchema.plugin(toJSON);
adminSchema.plugin(paginate);

adminSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

adminSchema.statics.isPhoneNumberTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

adminSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// admin.model.js
adminSchema.pre('save', async function (next) {
  const user = this;
  
  // Only hash password if it exists and is modified
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
