// models/post.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * კომენტარის სქემა (Comment Schema).
 * ეს სქემა ჩაშენდება Post სქემაში.
 */
const commentSchema = new Schema({
    text: {
        type: String,
        required: true // კომენტარის ტექსტი სავალდებულოა
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // მომხმარებლის მოდელზე მიბმა (ავტორი)
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // კომენტარის შექმნის დრო
    }
});

/**
 * პოსტის სქემა (Post Schema).
 * განსაზღვრავს მონაცემთა სტრუქტურას, რომელიც ინახება 'posts' კოლექციაში.
 */
const postSchema = new Schema({
    title: {
        type: String,
        required: true // სათაური სავალდებულოა
    },
    content: {
        type: String,
        required: true // შინაარსი სავალდებულოა
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // მომხმარებლის მოდელზე მიბმა (ავტორი)
        required: true
    },
    coverImage: {
        type: String, // ქავერ სურათის URL Cloudinary-დან
        default: null // ნაგულისხმევად null
    },
    reactions: {
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User' // მომხმარებლის ID-ები, რომელთაც მოეწონათ
        }],
        dislikes: [{
            type: Schema.Types.ObjectId,
            ref: 'User' // მომხმარებლის ID-ები, რომელთაც არ მოეწონათ
        }]
    },
    comments: [commentSchema] // კომენტარების მასივი (ჩაშენებული დოკუმენტები)
}, {
    timestamps: true // ავტომატურად ამატებს createdAt და updatedAt ველებს
});

module.exports = mongoose.model('Post', postSchema);
