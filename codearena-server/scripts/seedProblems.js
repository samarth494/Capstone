const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const seedProblems = [
    {
        title: "Hello World",
        description: "Write a program that prints `Hello, World!` to the console.\n\nThis is the simplest problem to get you started.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Basics", "Output"],
        xpReward: 5,
        templates: [
            { language: "javascript", code: "// Print Hello, World!\n" },
            { language: "python", code: "# Print Hello, World!\n" }
        ],
        testCases: [
            { input: "", output: "Hello, World!" }
        ],
        examples: [
            { input: "(no input)", output: "Hello, World!", explanation: "Just print the string exactly." }
        ]
    },
    {
        title: "Sum of Two Numbers",
        description: "Read two integers from input (one per line) and print their sum.\n\n### Input\nTwo integers, each on a separate line.\n\n### Output\nA single integer — the sum of the two numbers.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Math", "Input/Output"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', (line) => lines.push(line));\nrl.on('close', () => {\n    // Your code here\n});\n" },
            { language: "python", code: "a = int(input())\nb = int(input())\n# Print the sum\n" }
        ],
        testCases: [
            { input: "3\n5", output: "8" },
            { input: "0\n0", output: "0" },
            { input: "-1\n1", output: "0" },
            { input: "100\n200", output: "300" }
        ],
        examples: [
            { input: "3\n5", output: "8", explanation: "3 + 5 = 8" }
        ]
    },
    {
        title: "Blind Coding Challenge",
        slug: "blind-coding",
        description: "Welcome to the Blind Coding Challenge! Support for C is enabled.\n\nWrite a program that reads an integer `n` and prints its square.\n\n### Input\nA single integer `n`.\n\n### Output\nThe square of `n`.",
        difficulty: "Medium",
        categories: ["Fundamentals"],
        tags: ["Math", "Competition"],
        xpReward: 100,
        templates: [
            { language: "python", code: "n = int(input())\n# Write blind solution below\n" },
            { language: "c", code: "#include <stdio.h>\n\nint main() {\n    // Write your blind solution here...\n\n    return 0;\n}" }
        ],
        testCases: [
            { input: "4", output: "16" },
            { input: "5", output: "25" },
            { input: "10", output: "100" }
        ],
        examples: [
            { input: "4", output: "16", explanation: "4 * 4 = 16" }
        ]
    },
    {
        title: "Blind Coding: Factorial",
        slug: "blind-factorial",
        description: "In this blind challenge, you must compute the factorial of a given number `n`.\n\n### Task\nRead an integer `n` and print its factorial `n!`.\n\n### Constraints\n`0 <= n <= 10`",
        difficulty: "Medium",
        categories: ["Fundamentals"],
        tags: ["Math", "Recursion", "Competition"],
        xpReward: 120,
        templates: [
            { language: "c", code: "#include <stdio.h>\n\nint main() {\n    // Write your blind factorial solution here...\n\n    return 0;\n}" },
            { language: "python", code: "n = int(input())\n# Write blind solution below\n" }
        ],
        testCases: [
            { input: "5", output: "120" },
            { input: "0", output: "1" },
            { input: "10", output: "3628800" }
        ],
        examples: [
            { input: "5", output: "120", explanation: "5 * 4 * 3 * 2 * 1 = 120" }
        ]
    }
];

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected!');

        await Problem.deleteMany({});
        console.log('Cleared existing problems.');

        await Problem.insertMany(seedProblems);
        console.log(`Seeded ${seedProblems.length} problems successfully!`);

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
};

seedDB();
