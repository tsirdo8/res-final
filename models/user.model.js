// models/user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * მომხმარებლის სქემა (User Schema).
 * განსაზღვრავს მონაცემთა სტრუქტურას, რომელიც ინახება 'users' კოლექციაში.
 */
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true // სრული სახელი სავალდებულოა
    },
    email: {
        type: String,
        required: true, // ელფოსტა სავალდებულოა
        unique: true, // ელფოსტა უნიკალური უნდა იყოს
        lowercase: true // ყოველთვის შეინახეთ მცირე ასოებით
    },
    password: {
        type: String,
        required: true, // პაროლი სავალდებულოა (დაიმახსოვრეთ, ის უნდა იყოს ჰეშირებული)
        select: false // ნაგულისხმევად არ აბრუნებს პაროლს მოთხოვნებზე
    },
    avatar: {
        type: String, // ავატარის URL Cloudinary-დან
        default: null // ნაგულისმევად null
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // როლი შეიძლება იყოს 'user' ან 'admin'
        default: 'user' // ნაგულისხმევი როლი არის 'user'
    }
}, {
    timestamps: true // ავტომატურად ამატებს createdAt და updatedAt ველებს
});

module.exports = mongoose.model('User', userSchema);
