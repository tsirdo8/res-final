// routes/post.route.js
const { Router } = require("express");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model"); // კომენტარის ავტორის პოპულაციისთვის
const { isValidObjectId } = require("mongoose");
const { upload, deleteFromCloudinary } = require("../config/cloudinary.config");

const postRouter = Router();

/**
 * @swagger
 * /posts:
 * get:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * summary: ყველა პოსტის მიღება
 * responses:
 * 200:
 * description: პოსტების სია
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Post'
 * 401:
 * description: არავტორიზებული
 * 500:
 * description: სერვერის შეცდომა
 * post:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * summary: ახალი პოსტის შექმნა სურვილისამებრ ქავერ სურათით
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * $ref: '#/components/schemas/PostCreate'
 * responses:
 * 201:
 * description: პოსტი წარმატებით შეიქმნა
 * 400:
 * description: არასწორი მოთხოვნა (შინაარსი ან სათაური აკლია)
 * 401:
 * description: არავტორიზებული
 * 500:
 * description: სერვერის შეცდომა
 */
postRouter.get('/', async (req, res) => {
    try {
        const posts = await postModel
            .find()
            .sort({ _id: -1 })
            .populate({ path: 'author', select: 'fullName email avatar' }) // ავტორის სრული სახელის, ელფოსტის და ავატარის პოპულაცია
            .populate({ path: 'comments.author', select: 'fullName email avatar' }); // კომენტარების ავტორების პოპულაცია

        res.status(200).json(posts);
    } catch (error) {
        console.error('პოსტების მიღების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა პოსტების მიღებისას.' });
    }
});

postRouter.post('/', upload.single('coverImage'), async (req, res) => {
    const { content, title } = req.body;
    const filePath = req.file ? req.file.path : null; // ატვირთული ფაილის გზა Cloudinary-დან

    // შემოწმება, არის თუ არა შინაარსი და სათაური მოწოდებული
    if (!content || !title) {
        // თუ შინაარსი ან სათაური აკლია და ფაილი აიტვირთა, წაშალეთ იგი
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        return res.status(400).json({ message: 'შინაარსი და სათაური სავალდებულოა.' });
    }

    try {
        await postModel.create({ content, title, author: req.userId, coverImage: filePath });
        res.status(201).json({ message: "პოსტი წარმატებით შეიქმნა" });
    } catch (error) {
        console.error('პოსტის შექმნის შეცდომა:', error.message);
        // თუ შეცდომა მოხდა პოსტის შექმნისას ფაილის ატვირთვის შემდეგ, სცადეთ ატვირთული ფაილის წაშლა
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        res.status(500).json({ message: 'სერვერის შეცდომა პოსტის შექმნისას.' });
    }
});

/**
 * @swagger
 * /posts/{id}:
 * get:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * summary: კონკრეტული პოსტის მიღება ID-ის მიხედვით
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID
 * responses:
 * 200:
 * description: პოსტის დეტალები
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Post'
 * 400:
 * description: არასწორი ID
 * 401:
 * description: არავტორიზებული
 * 404:
 * description: პოსტი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 * delete:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * summary: პოსტის წაშლა
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID, რომელიც უნდა წაიშალოს
 * responses:
 * 200:
 * description: პოსტი წარმატებით წაიშალა
 * 400:
 * description: არასწორი ID
 * 401:
 * description: არავტორიზებული (თქვენ არ ხართ პოსტის ავტორი ან ადმინი)
 * 404:
 * description: პოსტი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 * put:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * summary: პოსტის განახლება სურვილისამებრ ქავერ სურათით
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID, რომელიც უნდა განახლდეს
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * $ref: '#/components/schemas/PostUpdate'
 * responses:
 * 200:
 * description: პოსტი წარმატებით განახლდა
 * 400:
 * description: არასწორი ID
 * 401:
 * description: არავტორიზებული (თქვენ არ ხართ პოსტის ავტორი ან ადმინი)
 * 404:
 * description: პოსტი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 */
postRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    // შემოწმება, არის თუ არა ID ვალიდური ObjectId
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "პოსტის ID არასწორია." });
    }

    try {
        const post = await postModel.findById(id)
            .populate({ path: 'author', select: 'fullName email avatar' })
            .populate({ path: 'comments.author', select: 'fullName email avatar' });
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('პოსტის მიღების შეცდომა ID-ის მიხედვით:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა პოსტის მიღებისას.' });
    }
});

postRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // შემოწმება, არის თუ არა ID ვალიდური ObjectId
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "პოსტის ID არასწორია." });
    }

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        // შეამოწმეთ, არის თუ არა ავთენტიფიცირებული მომხმარებელი პოსტის ავტორი ან ადმინისტრატორი
        if (post.author.toString() !== req.userId && req.role !== 'admin') {
            return res.status(401).json({ message: 'თქვენ არ გაქვთ ნებართვა ამ პოსტის წასაშლელად.' });
        }

        // ქავერ სურათის წაშლა Cloudinary-დან, თუ ის არსებობს
        if (post.coverImage) {
            const publicIdMatch = post.coverImage.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }

        await postModel.findByIdAndDelete(id);
        res.status(200).json({ message: "პოსტი წარმატებით წაიშალა" });
    } catch (error) {
        console.error('პოსტის წაშლის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა პოსტის წაშლისას.' });
    }
});

postRouter.put('/:id', upload.single('coverImage'), async (req, res) => {
    const { id } = req.params;
    // შემოწმება, არის თუ არა ID ვალიდური ObjectId
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "პოსტის ID არასწორია." });
    }

    const { title, content } = req.body;
    const filePath = req.file ? req.file.path : null;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        // შეამოწმეთ, არის თუ არა ავთენტიფიცირებული მომხმარებელი პოსტის ავტორი ან ადმინისტრატორი
        if (post.author.toString() !== req.userId && req.role !== 'admin') {
            // თუ ფაილი აიტვირთა, მაგრამ მომხმარებელს არ აქვს ნებართვა, წაშალეთ ატვირთული ფაილი
            if (filePath) {
                const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
            return res.status(401).json({ message: 'თქვენ არ გაქვთ ნებართვა ამ პოსტის განახლებისთვის.' });
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (content) updateFields.content = content;

        if (filePath) {
            // თუ ძველი ქავერ სურათი არსებობს, წაშალეთ იგი Cloudinary-დან
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
        res.status(200).json({ message: "პოსტი წარმატებით განახლდა" });

    } catch (error) {
        console.error('პოსტის განახლების შეცდომა:', error.message);
        // თუ შეცდომა მოხდა პოსტის განახლებისას ფაილის ატვირთვის შემდეგ, სცადეთ ატვირთული ფაილის წაშლა
        if (filePath) {
            const publicIdMatch = filePath.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }
        res.status(500).json({ message: 'სერვერის შეცდომა პოსტის განახლებისას.' });
    }
});

/**
 * @swagger
 * /posts/{id}/reactions:
 * post:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * - რეაქციები
 * summary: რეაქციის (like/dislike) დამატება/წაშლა პოსტზე
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/PostReaction'
 * responses:
 * 200:
 * description: რეაქცია წარმატებით განახლდა.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * reactions:
 * $ref: '#/components/schemas/ReactionCount'
 * 400:
 * description: არასწორი მოთხოვნა (არასწორი რეაქციის ტიპი ან ID)
 * 401:
 * description: არავტორიზებული
 * 404:
 * description: პოსტი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 */
postRouter.post('/:id/reactions', async (req, res) => {
    const postId = req.params.id;
    const { type } = req.body;
    const userId = req.userId; // ავთენტიფიცირებული მომხმარებლის ID

    // შემოწმება, არის თუ არა პოსტის ID ვალიდური ObjectId
    if (!isValidObjectId(postId)) {
        return res.status(400).json({ message: "პოსტის ID არასწორია." });
    }

    const supportReactionType = ['like', 'dislike'];
    if (!supportReactionType.includes(type)) {
        return res.status(400).json({ error: "არასწორი რეაქციის ტიპი. მხარდაჭერილი ტიპებია 'like' და 'dislike'." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        const alreadyLikedIndex = post.reactions.likes.findIndex(el => el.toString() === userId);
        const alreadyDislikedIndex = post.reactions.dislikes.findIndex(el => el.toString() === userId);

        if (type === 'like') {
            if (alreadyLikedIndex !== -1) {
                // მომხმარებელს უკვე მოწონებული აქვს, ასე რომ მოწონების გაუქმება
                post.reactions.likes.splice(alreadyLikedIndex, 1);
            } else {
                // მომხმარებელს არ მოწონებული აქვს, ასე რომ მოწონება
                post.reactions.likes.push(userId);
                // თუ მომხმარებელს ადრე არ მოწონებული ჰქონდა, წაშალეთ ის არ მოწონება
                if (alreadyDislikedIndex !== -1) {
                    post.reactions.dislikes.splice(alreadyDislikedIndex, 1);
                }
            }
        } else if (type === 'dislike') { // type === 'dislike'
            if (alreadyDislikedIndex !== -1) {
                // მომხმარებელს უკვე არ მოწონებული აქვს, ასე რომ არ მოწონების გაუქმება
                post.reactions.dislikes.splice(alreadyDislikedIndex, 1);
            } else {
                // მომხმარებელს არ არ მოწონებული აქვს, ასე რომ არ მოწონება
                post.reactions.dislikes.push(userId);
                // თუ მომხმარებელს ადრე მოწონებული ჰქონდა, წაშალეთ ის მოწონება
                if (alreadyLikedIndex !== -1) {
                    post.reactions.likes.splice(alreadyLikedIndex, 1);
                }
            }
        }

        await post.save(); // ცვლილებების შენახვა მონაცემთა ბაზაში
        res.status(200).json({ message: `რეაქცია '${type}' წარმატებით განახლდა.`, reactions: post.reactions });

    } catch (error) {
        console.error('რეაქციის განახლების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა რეაქციის განახლებისას.' });
    }
});

/**
 * @swagger
 * /posts/{id}/comments:
 * post:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * - კომენტარები
 * summary: კომენტარის დამატება პოსტზე
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CommentCreate'
 * responses:
 * 201:
 * description: კომენტარი წარმატებით დაემატა.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * comment:
 * $ref: '#/components/schemas/Comment'
 * 400:
 * description: არასწორი მოთხოვნა (კომენტარის ტექსტი აკლია ან არასწორი ID)
 * 401:
 * description: არავტორიზებული
 * 404:
 * description: პოსტი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 */
postRouter.post('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.userId; // ავთენტიფიცირებული მომხმარებლის ID

    // შემოწმება, არის თუ არა პოსტის ID ვალიდური ObjectId
    if (!isValidObjectId(postId)) {
        return res.status(400).json({ message: "პოსტის ID არასწორია." });
    }
    // შემოწმება, არის თუ არა კომენტარის ტექსტი მოწოდებული
    if (!text) {
        return res.status(400).json({ message: "კომენტარის ტექსტი სავალდებულოა." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        const newComment = {
            text,
            author: userId // კომენტარის ავტორის დაყენება ავთენტიფიცირებული მომხმარებლის ID-ზე
        };
        post.comments.push(newComment); // კომენტარის დამატება პოსტის კომენტარების მასივში
        await post.save(); // ცვლილებების შენახვა

        // სურვილისამებრ, ახალი კომენტარის პოპულაცია ავტორის დეტალებით
        await post.populate({ path: 'comments.author', select: 'fullName email avatar' });
        const addedComment = post.comments[post.comments.length - 1]; // მიიღეთ ახლად დამატებული კომენტარი

        res.status(201).json({ message: 'კომენტარი წარმატებით დაემატა.', comment: addedComment });
    } catch (error) {
        console.error('კომენტარის დამატების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა კომენტარის დამატებისას.' });
    }
});

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 * put:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * - კომენტარები
 * summary: კომენტარის განახლება პოსტზე
 * parameters:
 * - name: postId
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID
 * - name: commentId
 * in: path
 * required: true
 * schema:
 * type: string
 * description: კომენტარის ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CommentUpdate'
 * responses:
 * 200:
 * description: კომენტარი წარმატებით განახლდა.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * comment:
 * $ref: '#/components/schemas/Comment'
 * 400:
 * description: არასწორი მოთხოვნა (კომენტარის ტექსტი აკლია ან არასწორი ID)
 * 401:
 * description: არავტორიზებული
 * 403:
 * description: თქვენ არ გაქვთ ნებართვა ამ კომენტარის განახლებისთვის.
 * 404:
 * description: პოსტი ან კომენტარი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 * delete:
 * security:
 * - bearerAuth: []
 * tags:
 * - პოსტები
 * - კომენტარები
 * summary: კომენტარის წაშლა პოსტიდან
 * parameters:
 * - name: postId
 * in: path
 * required: true
 * schema:
 * type: string
 * description: პოსტის ID
 * - name: commentId
 * in: path
 * required: true
 * schema:
 * type: string
 * description: კომენტარის ID
 * responses:
 * 200:
 * description: კომენტარი წარმატებით წაიშალა.
 * 400:
 * description: არასწორი მოთხოვნა (არასწორი ID)
 * 401:
 * description: არავტორიზებული
 * 403:
 * description: თქვენ არ გაქვთ ნებართვა ამ კომენტარის წასაშლელად.
 * 404:
 * description: პოსტი ან კომენტარი ვერ მოიძებნა
 * 500:
 * description: სერვერის შეცდომა
 */
postRouter.put('/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    // შემოწმება, არის თუ არა პოსტის და კომენტარის ID-ები ვალიდური ObjectId-ები
    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
        return res.status(400).json({ message: "პოსტის ან კომენტარის ID არასწორია." });
    }
    // შემოწმება, არის თუ არა კომენტარის ტექსტი მოწოდებული
    if (!text) {
        return res.status(400).json({ message: "კომენტარის ტექსტი სავალდებულოა." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        // Mongoose-ის დამხმარე ფუნქცია subdocument-ის ID-ით მოსაძებნად
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'კომენტარი ვერ მოიძებნა.' });
        }

        // მხოლოდ კომენტარის ავტორს ან ადმინისტრატორს შეუძლია კომენტარის განახლება
        if (comment.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'თქვენ არ გაქვთ ნებართვა ამ კომენტარის განახლებისთვის.' });
        }

        comment.text = text; // კომენტარის ტექსტის განახლება
        await post.save(); // ცვლილებების შენახვა

        // სურვილისამებრ, განახლებული კომენტარის პოპულაცია ავტორის დეტალებით
        await post.populate({ path: 'comments.author', select: 'fullName email avatar' });
        const updatedComment = post.comments.id(commentId);

        res.status(200).json({ message: 'კომენტარი წარმატებით განახლდა.', comment: updatedComment });

    } catch (error) {
        console.error('კომენტარის განახლების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა კომენტარის განახლებისას.' });
    }
});

postRouter.delete('/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    // შემოწმება, არის თუ არა პოსტის და კომენტარის ID-ები ვალიდური ObjectId-ები
    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
        return res.status(400).json({ message: "პოსტის ან კომენტარის ID არასწორია." });
    }

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'პოსტი ვერ მოიძებნა.' });
        }

        // კომენტარის ინდექსის პოვნა
        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ message: 'კომენტარი ვერ მოიძებნა.' });
        }

        const comment = post.comments[commentIndex];

        // მხოლოდ კომენტარის ავტორს ან ადმინისტრატორს შეუძლია კომენტარის წაშლა
        if (comment.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'თქვენ არ გაქვთ ნებართვა ამ კომენტარის წასაშლელად.' });
        }

        post.comments.splice(commentIndex, 1); // კომენტარის წაშლა მასივიდან
        await post.save(); // ცვლილებების შენახვა
        res.status(200).json({ message: 'კომენტარი წარმატებით წაიშალა.' });

    } catch (error) {
        console.error('კომენტარის წაშლის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა კომენტარის წაშლისას.' });
    }
});

module.exports = postRouter;
