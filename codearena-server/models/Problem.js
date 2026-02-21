const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String, // Store as Markdown
        required: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    categories: [{
        type: String,
        enum: ['Fundamentals', 'Data Structures', 'Algorithms'],
        default: 'Fundamentals'
    }],
    tags: [String],
    xpReward: {
        type: Number,
        default: 10
    },
    templates: [{
        language: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    }],
    testCases: [{
        input: String,
        output: String,
        explanation: String,
        isPrime: { // Hidden test cases
            type: Boolean,
            default: false
        }
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', problemSchema);
