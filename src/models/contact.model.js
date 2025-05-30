const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contactDetails:[{
        contactName:{
            type:String,
            required:true
        },
        contactNumber:{
            type:String,
            required:true
        },
        contactNote:{
            type:String,
            required:false
        },
        contactEmail:{
            type:String,
            required:false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
      },
});
const contact = mongoose.model('Contact', contactSchema);
module.exports = contact;