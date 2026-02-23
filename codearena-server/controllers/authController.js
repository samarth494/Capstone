const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

        if (user && (user.password && await bcrypt.compare(password, user.password))) {
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

// @desc    Authenticate a user via Google
// @route   POST /api/auth/google
// @access  Public
console.log("ENV CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // User exists, login
            // Update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            res.json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id)
            });
        } else {
            // User does not exist, create new user
            let username = name.replace(/\s+/g, '').toLowerCase();

            // Check if username exists, if so append random numbers
            let userExists = await User.findOne({ username });
            while (userExists) {
                username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);
                userExists = await User.findOne({ username });
            }

            const newUser = await User.create({
                username,
                email,
                googleId,
                // password is not required
            });

            if (newUser) {
                res.status(201).json({
                    user: {
                        _id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                    },
                    token: generateToken(newUser._id)
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        }
    } catch (error) {
        console.error("Error in googleLogin:", error);
        res.status(500).json({ message: 'Google login failed' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "There is no user with that email" });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In local development, it might be http://localhost:3000/resetpassword/${resetToken}
        const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
                html: `<p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: 'Server error during forgot password' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: 'Server error during password reset' });
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
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword
};
