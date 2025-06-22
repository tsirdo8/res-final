const { Router } = require("express");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model"); 
const { upload, deleteFromCloudinary } = require("../config/cloudinary.config");
const { isValidObjectId } = require("mongoose");

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
        
        const users = await userModel.find().sort({ _id: -1 }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('მომხმარებლების მიღების შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლების მიღებისას.' });
    }
});

userRouter.put('/', upload.single('avatar'), async (req, res) => {
    const userId = req.userId; 
    const { email, fullName } = req.body;
    const filePath = req.file ? req.file.path : null; 
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
        }

        const updateFields = {}; 
        if (email) updateFields.email = email;
        if (fullName) updateFields.fullName = fullName;

        if (filePath) {
           
            if (user.avatar) {
                const publicIdMatch = user.avatar.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
            updateFields.avatar = filePath; 
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

   
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "მომხმარებლის ID არასწორია." });
    }

    try {
     
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
    const targetUserId = req.params.id; 
    const userId = req.userId; 
    const userRole = req.role; 


    if (!isValidObjectId(targetUserId)) {
        return res.status(400).json({ message: "მომხმარებლის ID არასწორია." });
    }

    try {
       
        if (userRole !== 'admin' && targetUserId !== userId) {
            return res.status(403).json({ message: "თქვენ არ გაქვთ ნებართვა ამ მომხმარებლის წასაშლელად." });
        }

        const userToDelete = await userModel.findById(targetUserId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' });
        }

       
        if (userToDelete.avatar) {
            const publicIdMatch = userToDelete.avatar.match(/\/blog-app-uploads\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                await deleteFromCloudinary(publicId);
            }
        }

        const postsToDelete = await postModel.find({ author: targetUserId });
        for (const post of postsToDelete) {
            
            if (post.coverImage) {
                const publicIdMatch = post.coverImage.match(/\/blog-app-uploads\/([^.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = `blog-app-uploads/${publicIdMatch[1]}`;
                    await deleteFromCloudinary(publicId);
                }
            }
        }
        await postModel.deleteMany({ author: targetUserId }); 

       
        await userModel.findByIdAndDelete(targetUserId);

        res.status(200).json({ message: 'მომხმარებელი და მისი პოსტები წარმატებით წაიშალა.' });
    } catch (error) {
        console.error('მომხმარებლის წაშლის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა მომხმარებლის წაშლისას.' });
    }
});

module.exports = userRouter;