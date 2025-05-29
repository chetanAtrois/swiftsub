const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});
const Note = mongoose.model('Note', noteSchema);
module.exports = Note;