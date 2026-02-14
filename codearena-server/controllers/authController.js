const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists (email OR username)
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            if (userExists.username === username) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email OR username
        const user = await User.findOne({
            $or: [{ email: email }, { username: email }]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = {
    registerUser,
    loginUser
};
