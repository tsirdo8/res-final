// auth/auth.route.js
const { Router } = require("express");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs"); // პაროლის ჰეშირებისთვის
const jwt = require("jsonwebtoken"); // JWT ტოკენების გენერირებისთვის
require('dotenv').config(); // გარემოს ცვლადების ჩატვირთვა

const authRouter = Router();

/**
 * @swagger
 * /auth/sign-up:
 * post:
 * tags:
 * - ავთენტიფიკაცია
 * summary: ახალი მომხმარებლის რეგისტრაცია
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserRegister'
 * responses:
 * 201:
 * description: მომხმარებელი წარმატებით დარეგისტრირდა
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * token:
 * type: string
 * userId:
 * type: string
 * role:
 * type: string
 * 400:
 * description: არასწორი მოთხოვნა ან მომხმარებელი უკვე არსებობს
 * 500:
 * description: სერვერის შეცდომა
 */
authRouter.post('/sign-up', async (req, res) => {
    const { fullName, email, password } = req.body;

    // შემოწმება, არის თუ არა ყველა ველი მოწოდებული
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'ყველა ველი (fullName, email, password) სავალდებულოა.' });
    }

    try {
        // შეამოწმეთ, არსებობს თუ არა მომხმარებელი მოცემული ელფოსტით
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'ამ ელფოსტის მქონე მომხმარებელი უკვე არსებობს.' });
        }

        // პაროლის ჰეშირება
        const salt = await bcrypt.genSalt(10); // მარილის გენერირება
        const hashedPassword = await bcrypt.hash(password, salt); // პაროლის ჰეშირება მარილთან ერთად

        // ახალი მომხმარებლის შექმნა
        user = await userModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        // JWT ტოკენის გენერირება
        const payload = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // ტოკენი მოქმედებს 1 საათის განმავლობაში

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
 * post:
 * tags:
 * - ავთენტიფიკაცია
 * summary: მომხმარებლის შესვლა და JWT ტოკენის მიღება
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserLogin'
 * responses:
 * 200:
 * description: წარმატებით შეხვედით სისტემაში
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * token:
 * type: string
 * userId:
 * type: string
 * role:
 * type: string
 * 400:
 * description: არასწორი მონაცემები
 * 500:
 * description: სერვერის შეცდომა
 */
authRouter.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    // შემოწმება, არის თუ არა ელფოსტა და პაროლი მოწოდებული
    if (!email || !password) {
        return res.status(400).json({ message: 'ელფოსტა და პაროლი სავალდებულოა.' });
    }

    try {
        // შეამოწმეთ, არსებობს თუ არა მომხმარებელი (პაროლის ველის ჩათვლით)
        const user = await userModel.findOne({ email }).select('+password'); // Explicitly select password
        if (!user) {
            return res.status(400).json({ message: 'არასწორი მონაცემები.' });
        }

        // პაროლის შედარება ჰეშირებულ პაროლთან
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'არასწორი მონაცემები.' });
        }

        // JWT ტოკენის გენერირება
        const payload = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // ტოკენი მოქმედებს 1 საათის განმავლობაში

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
