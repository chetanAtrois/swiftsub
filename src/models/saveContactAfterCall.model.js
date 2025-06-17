const mongoose = require('mongoose');
const saveContactSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contactDetails:[{
        contactProfile:{
            type:String,
            required:true,
            enum:['client','partner','colleague'],
            default:'client'
        },
        purpose:{
            type:String,
            required:true,
            enum:['New Enquiry','clarafication for a transaction'],
            default:'New Enquiry',
        },
        contactName:{
            type:String,
            required:false
        },
        contactNumber:{
            type:String,
            required:false
        },
        contactNote:{
            type:String,
            required:false
        },
        contactEmail:{
            type:String,
            required:false
        },
        contactCompanyName:{
            type:String,
            required:false
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
      },
});
const saveContactAfterCall = mongoose.model('ContactAfterCall', saveContactSchema);
module.exports = saveContactAfterCall;