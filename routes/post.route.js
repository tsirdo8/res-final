const { Router } = require("express");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { isValidObjectId } = require("mongoose");
const { upload, deleteFromCloudinary } = require("../config/cloudinary.config");

const postRouter = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Create a new post with optional cover image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PostCreate'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request (missing content or title)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
postRouter.get('/', async (req, res) => {
    try {
        const posts = await postModel
            .find()
            .sort({ _id: -1 })
            .populate({ path: 'author', select: 'fullName email avatar' })
            .populate({ path: 'comments.author', select: 'fullName email avatar' });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error.message);
        res.status(500).json({ message: 'Server error while getting posts.' });
    }
});

postRouter.post('/', upload.single('coverImage'), async (req, res) => {
    const { content, title } = req.body;
    const filePath = req.file ? req.file.path : null;

    if (!content || !title) {
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        return res.status(400).json({ message: 'Content and title are required.' });
    }

    try {
        await postModel.create({ content, title, author: req.userId, coverImage: filePath });
        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error('Error creating post:', error.message);
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Get a specific post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Delete a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized (not author or admin)
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Update a post with optional cover image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PostUpdate'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized (not author or admin)
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    try {
        const post = await postModel.findById(id)
            .populate({ path: 'author', select: 'fullName email avatar' })
            .populate({ path: 'comments.author', select: 'fullName email avatar' });
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error getting post:', error.message);
        res.status(500).json({ message: 'Server error while getting post.' });
    }
});

postRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author.toString() !== req.userId && req.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized to delete this post.' });
        }

        if (post.coverImage) {
            const publicIdMatch = post.coverImage.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }

        await postModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        res.status(500).json({ message: 'Server error while deleting post.' });
    }
});

postRouter.put('/:id', upload.single('coverImage'), async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    const { title, content } = req.body;
    const filePath = req.file ? req.file.path : null;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author.toString() !== req.userId && req.role !== 'admin') {
            if (filePath) {
                const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
            return res.status(401).json({ message: 'Unauthorized to update this post.' });
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (content) updateFields.content = content;

        if (filePath) {
            if (post.coverImage) {
                const publicIdMatch = post.coverImage.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
            updateFields.coverImage = filePath;
        }

        await postModel.findByIdAndUpdate(id, updateFields, { new: true });
        res.status(200).json({ message: "Post updated successfully" });

    } catch (error) {
        console.error('Error updating post:', error.message);
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        res.status(500).json({ message: 'Server error while updating post.' });
    }
});

/**
 * @swagger
 * /posts/{id}/reactions:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *       - Reactions
 *     summary: Add/remove reaction (like/dislike) to a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostReaction'
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reactions:
 *                   $ref: '#/components/schemas/ReactionCount'
 *       400:
 *         description: Bad request (invalid reaction type or ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.post('/:id/reactions', async (req, res) => {
    const postId = req.params.id;
    const { type } = req.body;
    const userId = req.userId;

    if (!isValidObjectId(postId)) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    const supportReactionType = ['like', 'dislike'];
    if (!supportReactionType.includes(type)) {
        return res.status(400).json({ error: "Invalid reaction type. Supported types are 'like' and 'dislike'." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const alreadyLikedIndex = post.reactions.likes.findIndex(el => el.toString() === userId);
        const alreadyDislikedIndex = post.reactions.dislikes.findIndex(el => el.toString() === userId);

        if (type === 'like') {
            if (alreadyLikedIndex !== -1) {
                post.reactions.likes.splice(alreadyLikedIndex, 1);
            } else {
                post.reactions.likes.push(userId);
                if (alreadyDislikedIndex !== -1) {
                    post.reactions.dislikes.splice(alreadyDislikedIndex, 1);
                }
            }
        } else if (type === 'dislike') {
            if (alreadyDislikedIndex !== -1) {
                post.reactions.dislikes.splice(alreadyDislikedIndex, 1);
            } else {
                post.reactions.dislikes.push(userId);
                if (alreadyLikedIndex !== -1) {
                    post.reactions.likes.splice(alreadyLikedIndex, 1);
                }
            }
        }

        await post.save();
        res.status(200).json({ 
            message: `Reaction '${type}' updated successfully.`, 
            reactions: post.reactions 
        });

    } catch (error) {
        console.error('Error updating reaction:', error.message);
        res.status(500).json({ message: 'Server error while updating reaction.' });
    }
});

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *       - Comments
 *     summary: Add a comment to a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request (missing text or invalid ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.post('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.userId;

    if (!isValidObjectId(postId)) {
        return res.status(400).json({ message: "Invalid post ID." });
    }
    if (!text) {
        return res.status(400).json({ message: "Comment text is required." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = {
            text,
            author: userId
        };
        post.comments.push(newComment);
        await post.save();

        await post.populate({ path: 'comments.author', select: 'fullName email avatar' });
        const addedComment = post.comments[post.comments.length - 1];

        res.status(201).json({ 
            message: 'Comment added successfully.', 
            comment: addedComment 
        });
    } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(500).json({ message: 'Server error while adding comment.' });
    }
});

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *       - Comments
 *     summary: Update a comment on a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdate'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request (missing text or invalid ID)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not comment author or admin)
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *       - Comments
 *     summary: Delete a comment from a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Bad request (invalid ID)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not comment author or admin)
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
postRouter.put('/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
        return res.status(400).json({ message: "Invalid post or comment ID." });
    }
    if (!text) {
        return res.status(400).json({ message: "Comment text is required." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        if (comment.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this comment.' });
        }

        comment.text = text;
        await post.save();

        await post.populate({ path: 'comments.author', select: 'fullName email avatar' });
        const updatedComment = post.comments.id(commentId);

        res.status(200).json({ 
            message: 'Comment updated successfully.', 
            comment: updatedComment 
        });

    } catch (error) {
        console.error('Error updating comment:', error.message);
        res.status(500).json({ message: 'Server error while updating comment.' });
    }
});

postRouter.delete('/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
        return res.status(400).json({ message: "Invalid post or comment ID." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const comment = post.comments[commentIndex];

        if (comment.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this comment.' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.status(200).json({ message: 'Comment deleted successfully.' });

    } catch (error) {
        console.error('Error deleting comment:', error.message);
        res.status(500).json({ message: 'Server error while deleting comment.' });
    }
});

module.exports = postRouter;