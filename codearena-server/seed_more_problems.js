const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://codearena:Codearena123@samarth.1o6eaea.mongodb.net/?appName=Samarth';

const problemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: String,
    categories: [String],
    slug: { type: String, unique: true },
    xpReward: Number,
    testCases: [{ input: String, output: String }],
    templates: [{ language: String, code: String }]
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

const newProblems = [
    {
        title: "Even or Odd",
        description: "Write a function that takes an integer and returns 'Even' for even numbers or 'Odd' for odd numbers.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        slug: "even-or-odd",
        xpReward: 10,
        testCases: [
            { input: "2", output: "Even" },
            { input: "3", output: "Odd" },
            { input: "0", output: "Even" }
        ],
        templates: [
            { language: "javascript", code: "function solve(n) {\n  return n % 2 === 0 ? 'Even' : 'Odd';\n}" },
            { language: "python", code: "def solve(n):\n    return 'Even' if n % 2 == 0 else 'Odd'" }
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        slug: "reverse-string",
        xpReward: 10,
        testCases: [
            { input: "hello", output: "olleh" },
            { input: "world", output: "dlrow" }
        ],
        templates: [
            { language: "javascript", code: "function solve(s) {\n  return s.split('').reverse().join('');\n}" },
            { language: "python", code: "def solve(s):\n    return s[::-1]" }
        ]
    },
    {
        title: "Find Maximum",
        description: "Write a function that takes an array of numbers and returns the maximum value.",
        difficulty: "Easy",
        categories: ["Algorithms"],
        slug: "find-maximum",
        xpReward: 15,
        testCases: [
            { input: "[1, 2, 3]", output: "3" },
            { input: "[-1, -5, 0]", output: "0" }
        ],
        templates: [
            { language: "javascript", code: "function solve(arr) {\n  return Math.max(...arr);\n}" },
            { language: "python", code: "def solve(arr):\n    return max(arr)" }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');
        for (const p of newProblems) {
            await Problem.updateOne({ slug: p.slug }, p, { upsert: true });
            console.log(`Seeded: ${p.title}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
