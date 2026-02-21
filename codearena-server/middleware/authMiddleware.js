const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect  — JWT Auth Middleware
 *
 * Validates the Bearer token, looks up the user in DB, and attaches
 * the user document to req.user for downstream controllers.
 *
 * Errors:
 *   401 — no token, invalid token, expired token, or deleted account
 */
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorised — no token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorised — account no longer exists.' });
        }

        req.user = user;
        next();

    } catch (err) {
        // jwt.verify throws for expired / malformed tokens
        const msg = err.name === 'TokenExpiredError'
            ? 'Session expired — please log in again.'
            : 'Not authorised — invalid token.';

        return res.status(401).json({ message: msg });
    }
};

module.exports = { protect };
