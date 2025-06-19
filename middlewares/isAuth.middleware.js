// middlewares/isAuth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // გარემოს ცვლადების ჩატვირთვა

/**
 * ავთენტიფიკაციის შუალედური პროგრამა (middleware).
 * ამოწმებს, არის თუ არა მოთხოვნა ავთენტიფიცირებული JWT ტოკენის გამოყენებით.
 * @param {object} req - Express-ის მოთხოვნის ობიექტი.
 * @param {object} res - Express-ის პასუხის ობიექტი.
 * @param {function} next - შემდეგი შუალედური პროგრამის ფუნქცია.
 */
const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // თუ ავტორიზაციის ჰედერი არ არის მოწოდებული
    if (!authHeader) {
        return res.status(401).json({ message: "თქვენ არ გაქვთ ნებართვა" });
    }

    // ჰედერში ტოკენის ტიპისა და ტოკენის განცალკევება ("Bearer TOKEN")
    const [type, token] = authHeader.split(' ');

    // თუ ფორმატი არასწორია ან ტოკენი არ არის მოწოდებული
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: "არასწორი ავტორიზაციის ფორმატი" });
    }

    try {
        // JWT ტოკენის ვერიფიკაცია
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // მომხმარებლის ID და როლის მიმაგრება მოთხოვნის ობიექტზე
        req.userId = payload.userId;
        req.role = payload.role;
        // გადასვლა შემდეგ შუალედურ პროგრამაზე
        next();
    } catch (err) {
        // თუ ტოკენი არასწორია ან ვადა გაუვიდა
        return res.status(401).json({ message: "არასწორი ან ვადაგასული ტოკენი" });
    }
};

module.exports = isAuth;
