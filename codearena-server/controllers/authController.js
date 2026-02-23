const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const buildUserPayload = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    rank: user.rank || 'Bronze',
    xp: user.xp || 0,
    wins: user.wins || 0,
    losses: user.losses || 0,
    battlesPlayed: user.battlesPlayed || 0,
    isAdmin: user.isAdmin || false,
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ message: 'Username, email and password are all required.' });
    }

    // Validate email format
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Password strength
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });

        if (existing) {
            if (existing.email === email.toLowerCase()) {
                return res.status(409).json({ message: 'An account with this email already exists.' });
            }
            return res.status(409).json({ message: 'That username is already taken.' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        return res.status(201).json({
            user: buildUserPayload(user),
            token: generateToken(user._id),
        });

    } catch (err) {
        console.error('[Auth] registerUser error:', err.message);
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    try {
        // Allow login with email OR username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { username: email.trim() },
            ],
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Deliberate vagueness — don't hint which field was wrong
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        return res.json({
            user: buildUserPayload(user),
            token: generateToken(user._id),
        });

    } catch (err) {
        console.error('[Auth] loginUser error:', err.message);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

module.exports = { registerUser, loginUser };
