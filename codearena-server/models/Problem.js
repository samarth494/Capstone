const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
<<<<<<< HEAD
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
=======
        required: true
    },
    description: {
        type: String, // Store as Markdown
        required: true
>>>>>>> singleplayer
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
<<<<<<< HEAD
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
=======
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
>>>>>>> singleplayer
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
<<<<<<< HEAD
    testCases: [{ // Hidden test cases for validation
        input: String,
        output: String
    }],
    tags: [String],
=======
>>>>>>> singleplayer
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', problemSchema);
