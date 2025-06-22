
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;


    const commentSchema = new Schema({
        text: {
            type: String,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now 
        }
    });

                                                                            
    const postSchema = new Schema({
        title: {
            type: String,
            required: true 
        },
        content: {
            type: String,
            required: true 
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        },
        coverImage: {
            type: String, 
            default: null 
        },
        reactions: {
            likes: [{
                type: Schema.Types.ObjectId,
                ref: 'User' 
            }],
            dislikes: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        },
        comments: [commentSchema] 
    }, {
        timestamps: true 
    });

    module.exports = mongoose.model('Post', postSchema);
