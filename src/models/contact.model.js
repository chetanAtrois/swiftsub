const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contactDetails: [
    {
      type: Schema.Types.Mixed // ✅ This works now
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
