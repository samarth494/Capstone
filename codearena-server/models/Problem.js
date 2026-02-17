const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: true // Markdown content
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    category: {
        type: String,
        enum: ['Fundamentals', 'Data Structures', 'Algorithms'],
        required: true
    },
    xpReward: {
        type: Number,
        required: true
    },
    templates: [{
        language: String, // 'javascript', 'python', 'java', 'cpp'
        code: String
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testCases: [{ // Hidden test cases for validation
        input: String,
        output: String
    }],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', problemSchema);
