const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({
            $or: [{ email: lowerEmail }, { username }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email: lowerEmail,
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
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email: identifier, password } = req.body; // 'email' is the key sent by frontend
    const lowerIdentifier = identifier.toLowerCase();

    try {
        console.log(`[Login] Attempt for: ${lowerIdentifier}`);

        // Find user by email OR username (case-insensitive)
        const user = await User.findOne({
            $or: [
                { email: lowerIdentifier },
                { username: { $regex: new RegExp(`^${lowerIdentifier}$`, 'i') } }
            ]
        });

        if (!user) {
            console.log(`[Login] Failure: User not found for ${lowerIdentifier}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[Login] Password match for ${user.username}: ${isMatch}`);

        if (isMatch) {
            res.json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[Login] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    // Frontend sends 'credential' from GoogleLogin component
    const token = req.body.token || req.body.credential;

    if (!token) {
        return res.status(400).json({ message: 'Google token is required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
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
            let username = name.replace(/\s+/g, '').toLowerCase();

            let userExists = await User.findOne({ username });
            while (userExists) {
                username = name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(7);
                userExists = await User.findOne({ username });
            }

            user = await User.create({
                username,
                email,
                googleId
            });

            res.status(201).json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ message: 'Google login failed' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase();

    try {
        const user = await User.findOne({ email: lowerEmail });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to reset your password: \n\n ${resetUrl}`;

        const html = `
            <h3>Password Reset Request</h3>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password for your CodeArena account.</p>
            <p>Please click on the button below to reset your password. This link is valid for 10 minutes.</p>
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or token expired' });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword
};
