const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [false, 'Please add a password'] // Changed to false for Google OAuth
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined values to be non-unique
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    battlesPlayed: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    rank: {
        type: String,
        default: 'Bronze'
    },
    xp: {
        type: Number,
        default: 0
    },
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },
    friends: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});


module.exports = mongoose.model('User', userSchema);

