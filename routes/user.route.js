const { Router } = require("express");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model"); // საჭიროა პოსტების კასკადური წაშლისთვის
const { upload, deleteFromCloudinary } = require("../config/cloudinary.config");
const { isValidObjectId } = require("mongoose"); // ObjectId ვალიდაციისთვის

const userRouter = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - მომხმარებლები
 *     summary: ყველა მომხმარებლის მიღება
 *     responses:
 *       200:
 *         description: მომხმარებლების სია
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: არავტორიზებული
 *       500:
 *         description: სერვერის შეცდომა
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - მომხმარებლები
 *     summary: ავთენტიფიცირებული მომხმარებლის პროფილის განახლება (ელფოსტა, სრული სახელი, ავატარი)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: მომხმარებელი წარმატებით განახლდა
 *       401:
 *         description: არავტორიზებული
 *       404:
 *         description: მომხმარებელი ვერ მოიძებნა
 *       500:
 *         description: სერვერის შეცდომა
 */
userRouter.get('/', async (req, res) => {
    try {
        // პაროლის ველის გამორიცხვა
        const users = await userModel.find().sort({ _id: -1 }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('მომხმარებლების მიღების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლების მიღებისას.' });
    }
});

userRouter.put('/', upload.single('avatar'), async (req, res) => {
    const userId = req.userId; // ავთენტიფიცირებული მომხმარებლის ID
    const { email, fullName } = req.body;
    const filePath = req.file ? req.file.path : null; // ატვირთული ფაილის გზა Cloudinary-დან

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
        }

        const updateFields = {}; // განახლების ველების ობიექტი
        if (email) updateFields.email = email;
        if (fullName) updateFields.fullName = fullName;

        if (filePath) {
            // თუ ძველი ავატარი არსებობს, წაშალეთ იგი Cloudinary-დან
            if (user.avatar) {
                // public ID-ის ამოღება Cloudinary URL-დან
                const publicIdMatch = user.avatar.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
            updateFields.avatar = filePath; // ახალი ავატარის URL
        }

        await userModel.findByIdAndUpdate(userId, updateFields, { new: true });
        res.status(200).json({ message: "მომხმარებელი წარმატებით განახლდა" });

    } catch (error) {
        console.error('მომხმარებლის განახლების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლის განახლებისას.' });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - მომხმარებლები
 *     summary: კონკრეტული მომხმარებლის მიღება ID-ის მიხედვით
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: მომხმარებლის ID
 *     responses:
 *       200:
 *         description: მომხმარებლის დეტალები
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: არასწორი ID
 *       401:
 *         description: არავტორიზებული
 *       404:
 *         description: მომხმარებელი ვერ მოიძებნა
 *       500:
 *         description: სერვერის შეცდომა
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - მომხმარებლები
 *     summary: მომხმარებლის წაშლა (ადმინისტრატორის ან საკუთარი თავის წაშლა)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: მომხმარებლის ID, რომელიც უნდა წაიშალოს
 *     responses:
 *       200:
 *         description: მომხმარებელი და მისი პოსტები წარმატებით წაიშალა.
 *       400:
 *         description: არასწორი ID
 *       401:
 *         description: არავტორიზებული
 *       403:
 *         description: არ გაქვთ ნებართვა
 *       404:
 *         description: მომხმარებელი ვერ მოიძებნა
 *       500:
 *         description: სერვერის შეცდომა
 */
userRouter.get('/:id', async (req, res) => {
    const { id } = req.params;

    // შემოწმება, არის თუ არა ID ვალიდური ObjectId
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "მომხმარებლის ID არასწორია." });
    }

    try {
        // მომხმარებლის პოვნა ID-ის მიხედვით, პაროლის გამორიცხვა
        const user = await userModel.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('მომხმარებლის მიღების შეცდომა ID-ის მიხედვით:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლის მიღებისას.' });
    }
});

userRouter.delete('/:id', async (req, res) => {
    const targetUserId = req.params.id; // წასაშლელი მომხმარებლის ID
    const userId = req.userId; // ავთენტიფიცირებული მომხმარებლის ID
    const userRole = req.role; // ავთენტიფიცირებული მომხმარებლის როლი

    // შემოწმება, არის თუ არა ID ვალიდური ObjectId
    if (!isValidObjectId(targetUserId)) {
        return res.status(400).json({ message: "მომხმარებლის ID არასწორია." });
    }

    try {
        // შემოწმება, არის თუ არა ავთენტიფიცირებული მომხმარებელი ადმინისტრატორი ან თავად წაშლის საკუთარ ანგარიშს
        if (userRole !== 'admin' && targetUserId !== userId) {
            return res.status(403).json({ message: "თქვენ არ გაქვთ ნებართვა ამ მომხმარებლის წასაშლელად." });
        }

        const userToDelete = await userModel.findById(targetUserId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
        }

        // მომხმარებლის ავატარის წაშლა Cloudinary-დან, თუ ის არსებობს
        if (userToDelete.avatar) {
            const publicIdMatch = userToDelete.avatar.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }

        // წაშლილი მომხმარებლის ყველა პოსტის წაშლა
        const postsToDelete = await postModel.find({ author: targetUserId });
        for (const post of postsToDelete) {
            // პოსტის ქავერ სურათის წაშლა Cloudinary-დან, თუ ის არსებობს
            if (post.coverImage) {
                const publicIdMatch = post.coverImage.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
        }
        await postModel.deleteMany({ author: targetUserId }); // პოსტების წაშლა

        // მომხმარებლის წაშლა
        await userModel.findByIdAndDelete(targetUserId);

        res.status(200).json({ message: 'მომხმარებელი და მისი პოსტები წარმატებით წაიშალა.' });
    } catch (error) {
        console.error('მომხმარებლის წაშლის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლის წაშლისას.' });
    }
});

module.exports = userRouter;