const { Router } = require("express");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const authRouter = Router();

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     tags:
 *       - ავთენტიფიკაცია
 *     summary: ახალი მომხმარებლის რეგისტრაცია
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: მომხმარებელი წარმატებით დარეგისტრირდა
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: არასწორი მოთხოვნა ან მომხმარებელი უკვე არსებობს
 *       500:
 *         description: სერვერის შეცდომა
 */
authRouter.post('/sign-up', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'ყველა ველი (fullName, email, password) სავალდებულოა.' });
    }

    try {
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'ამ ელფოსტის მქონე მომხმარებელი უკვე არსებობს.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await userModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        const payload = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'მომხმარებელი წარმატებით დარეგისტრირდა',
            token,
            userId: user._id,
            role: user.role
        });
    } catch (error) {
        console.error('რეგისტრაციის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა რეგისტრაციის დროს.' });
    }
});

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     tags:
 *       - ავთენტიფიკაცია
 *     summary: მომხმარებლის შესვლა და JWT ტოკენის მიღება
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: წარმატებით შეხვედით სისტემაში
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: არასწორი მონაცემები
 *       500:
 *         description: სერვერის შეცდომა
 */
authRouter.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'ელფოსტა და პაროლი სავალდებულოა.' });
    }

    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'არასწორი მონაცემები.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'არასწორი მონაცემები.' });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'წარმატებით შეხვედით სისტემაში',
            token,
            userId: user._id,
            role: user.role
        });
    } catch (error) {
        console.error('შესვლის შეცდომა:', error.message);
        res.status(500).json({ message: 'სერვერის შეცდომა შესვლის დროს.' });
    }
});

module.exports = authRouter;