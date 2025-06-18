const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: {
    trackHistory: { type: Boolean, default: false },
    adminRole: { type: Boolean, default: false },
    createAddress: { type: Boolean, default: false },
    createReports: { type: Boolean, default: false },
    viewContacts: { type: Boolean, default: false },
    createGroups: { type: Boolean, default: false },
    createNotes: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Permission = mongoose.model('permission', permissionSchema);
module.exports = Permission;
