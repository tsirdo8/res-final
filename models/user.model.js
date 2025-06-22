
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: {
        type: String,
        required: true, 
        select: false 
    },
    avatar: {
        type: String,
        default: null 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user' 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
