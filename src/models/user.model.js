const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true
    },
    lastName: {
      type: String,
      required: true
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
      private: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    ethnicity: {
      type: String,
    },
    language: [{
      type: String,
      default: 'english'
    }],
    education: {
      type: String,
    },
    personality: [
      {
        type: String,
      }
    ],
    interests: [{
      type: String,
    }],
    profession: {
      type: String,
    },
    religion: {
      type: String,
    },
    martialStatus: {
      type: String,
    },
    hangout: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'not to specify'],
      default: 'null',
    },
    userType: {
      type: String,
      default: 'user',
      enum: ['user'],
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
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
  return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
