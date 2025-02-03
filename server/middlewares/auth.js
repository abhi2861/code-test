const jwt = require('jsonwebtoken');
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });
const User = require('../models/user');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generate a JWT token
const generateToken = (userId, role) => {
    const token = jwt.sign({ userId: userId, role: role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRATION_TIME });
    return token;
};

const verifyToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decodedToken.userId;
    } catch (error) {
        return null;
    }
};

const authenticateUser = catchAsync(async (req, res, next) => {
    let token = req.headers.authorization;

    if (req.method === 'OPTIONS') {
        return next();
    }
    
    if (!token) {
        throw new AppError('No token provided', 401);
    }
    if (token) {
        token = token.replace(/^Bearer\s+/, "");
    }
    const userId = verifyToken(token);

    if (!userId) {
        throw new AppError('Unauthorized', 401);
    }

    const generatedToken = generateToken(userId)
    req.body.loggedInUserId = userId;
    res.locals.token = generatedToken

    next();
})


module.exports = { generateToken, authenticateUser, verifyToken };
