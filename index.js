
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc'); // swagger-jsdoc იმპორტი
const connectDB = require('./DB/db');
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route');
const isAuth = require('./middlewares/isAuth.middleware');
const authRouter = require('./auth/auth.route');
require('dotenv').config();

const app = express();

// Swagger JSDoc ოფციები
const swaggerOptions = {
    swaggerDefinition: require('./swaggerDef'), // JSDoc დეფინიციები
    apis: ['./routes/*.js', './auth/*.js'], // ფაილები, სადაც JSDoc კომენტარებია
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// შუალედური პროგრამები (Middleware)
app.use(express.json());

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

// სერვერის გაშვება
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`სერვერი გაშვებულია პორტზე ${PORT}`);
    console.log(`Swagger docs ხელმისაწვდომია: http://localhost:${PORT}/api-docs`);
});
