// index.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./DB/db');
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route');
const isAuth = require('./middlewares/isAuth.middleware');
const authRouter = require('./auth/auth.route');
require('dotenv').config();

const app = express(); // Express აპლიკაციის ინსტანცია

// Swagger JSDoc ოფციები
const swaggerOptions = {
    swaggerDefinition: require('./swaggerDef'),
    // მიუთითეთ ფაილები, სადაც Swagger-ის JSDoc კომენტარებია
    apis: ['./auth/*.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// შუალედური პროგრამები (Middleware)
app.use(express.json()); // JSON მოთხოვნის სხეულის დასამუშავებლად

// ავთენტიფიკაციის მარშრუტები (არ საჭიროებს isAuth-ს)
app.use('/auth', authRouter);

// ავტორიზაციის შუალედური პროგრამის გამოყენება იმ მარშრუტებზე, რომლებიც ავთენტიფიკაციას საჭიროებენ
app.use('/users', isAuth, userRouter);
app.use('/posts', isAuth, postRouter);

// Swagger დოკუმენტაციის მარშრუტი
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB-სთან დაკავშირება
connectDB();

// ძირითადი root მარშრუტი
app.get("/", (req, res) => {
    res.send("Hello World! თქვენი ბლოგის API მუშაობს.");
});

// IMPORTANT: For Vercel, you should export the app instance.
// Vercel handles the server listening internally.
module.exports = app;
