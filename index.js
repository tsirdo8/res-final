const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./DB/db');
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route');
const isAuth = require('./middlewares/isAuth.middleware');
const authRouter = require('./auth/auth.route');
require('dotenv').config();

const app = express();


const fullSwaggerDefinition = require('./swaggerDef');


const swaggerOptions = {
  swaggerDefinition: fullSwaggerDefinition, 
  apis: [
   
    './auth/auth.route.js',
    './routes/post.route.js', 
    './routes/user.route.js'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/users', isAuth, userRouter);
app.use('/posts', isAuth, postRouter);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database connection
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Hello World! თქვენი ბლოგის API მუშაობს.");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

module.exports = app;