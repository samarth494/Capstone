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
        title: "Even or Odd",
        description: "Read a single integer and print `Even` if it is even, or `Odd` if it is odd.\n\n### Input\nA single integer.\n\n### Output\n`Even` or `Odd`.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Conditionals", "Math"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    // Your code here\n});\n" },
            { language: "python", code: "n = int(input())\n# Print Even or Odd\n" }
        ],
        testCases: [
            { input: "4", output: "Even" },
            { input: "7", output: "Odd" },
            { input: "0", output: "Even" },
            { input: "-3", output: "Odd" }
        ],
        examples: [
            { input: "4", output: "Even", explanation: "4 is divisible by 2." }
        ]
    },
    {
        title: "Reverse a String",
        description: "Read a string from input and print it in reverse.\n\n### Input\nA single string.\n\n### Output\nThe reversed string.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Strings"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    // Reverse and print\n});\n" },
            { language: "python", code: "s = input()\n# Print the reversed string\n" }
        ],
        testCases: [
            { input: "hello", output: "olleh" },
            { input: "CodeArena", output: "anerAdoC" },
            { input: "a", output: "a" },
            { input: "racecar", output: "racecar" }
        ],
        examples: [
            { input: "hello", output: "olleh", explanation: "Reverse each character." }
        ]
    },
    {
        title: "Fibonacci Number",
        description: "Given an integer `n`, return the `n`-th Fibonacci number.\n\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...\n\nwhere `F(0) = 0`, `F(1) = 1`, and `F(n) = F(n-1) + F(n-2)` for `n > 1`.\n\n### Input\nA single non-negative integer `n`.\n\n### Output\nThe n-th Fibonacci number.",
        difficulty: "Easy",
        categories: ["Fundamentals", "Algorithms"],
        tags: ["Recursion", "Dynamic Programming"],
        xpReward: 15,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    // Compute and print F(n)\n});\n" },
            { language: "python", code: "n = int(input())\n# Compute and print F(n)\n" }
        ],
        testCases: [
            { input: "0", output: "0" },
            { input: "1", output: "1" },
            { input: "5", output: "5" },
            { input: "10", output: "55" }
        ],
        examples: [
            { input: "5", output: "5", explanation: "F(5) = 0,1,1,2,3,5 → answer is 5" }
        ]
    },
    {
        title: "Palindrome Check",
        description: "Read a string from input and print `true` if it is a palindrome, `false` otherwise. A palindrome reads the same forwards and backwards. Ignore case.\n\n### Input\nA single string.\n\n### Output\n`true` or `false`.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Strings", "Two Pointers"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    // Check palindrome\n});\n" },
            { language: "python", code: "s = input()\n# Check if palindrome (case insensitive)\n" }
        ],
        testCases: [
            { input: "racecar", output: "true" },
            { input: "hello", output: "false" },
            { input: "Madam", output: "true" },
            { input: "a", output: "true" }
        ],
        examples: [
            { input: "racecar", output: "true", explanation: "racecar reversed is racecar." }
        ]
    },
    {
        title: "Find Maximum in Array",
        description: "Given a list of integers (space-separated on one line), print the maximum value.\n\n### Input\nA single line of space-separated integers.\n\n### Output\nThe maximum integer.",
        difficulty: "Easy",
        categories: ["Fundamentals", "Data Structures"],
        tags: ["Array", "Iteration"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const nums = line.split(' ').map(Number);\n    // Find and print max\n});\n" },
            { language: "python", code: "nums = list(map(int, input().split()))\n# Print the maximum\n" }
        ],
        testCases: [
            { input: "1 5 3 9 2", output: "9" },
            { input: "10", output: "10" },
            { input: "-1 -5 -3", output: "-1" },
            { input: "0 0 0", output: "0" }
        ],
        examples: [
            { input: "1 5 3 9 2", output: "9", explanation: "9 is the largest number." }
        ]
    },
    {
        title: "FizzBuzz",
        description: "Given an integer `n`, print numbers from 1 to `n`. But for multiples of 3 print `Fizz`, for multiples of 5 print `Buzz`, and for multiples of both 3 and 5 print `FizzBuzz`.\n\nEach output on a new line.\n\n### Input\nA single integer `n`.\n\n### Output\nNumbers from 1 to n with Fizz/Buzz/FizzBuzz replacements, each on a new line.",
        difficulty: "Easy",
        categories: ["Fundamentals"],
        tags: ["Loops", "Conditionals"],
        xpReward: 10,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    // FizzBuzz logic\n});\n" },
            { language: "python", code: "n = int(input())\n# FizzBuzz from 1 to n\n" }
        ],
        testCases: [
            { input: "5", output: "1\n2\nFizz\n4\nBuzz" },
            { input: "15", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
            { input: "1", output: "1" }
        ],
        examples: [
            { input: "5", output: "1\n2\nFizz\n4\nBuzz", explanation: "3 → Fizz, 5 → Buzz." }
        ]
    },
    {
        title: "Binary Search",
        description: "Given a sorted array of integers and a target value, return the index of the target. If the target is not found, return `-1`.\n\n### Input\nFirst line: space-separated sorted integers.\nSecond line: the target integer.\n\n### Output\nThe 0-based index of the target, or `-1`.",
        difficulty: "Medium",
        categories: ["Algorithms"],
        tags: ["Binary Search", "Array"],
        xpReward: 25,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', (line) => lines.push(line));\nrl.on('close', () => {\n    const nums = lines[0].split(' ').map(Number);\n    const target = parseInt(lines[1]);\n    // Binary search\n});\n" },
            { language: "python", code: "nums = list(map(int, input().split()))\ntarget = int(input())\n# Binary search and print index or -1\n" }
        ],
        testCases: [
            { input: "1 3 5 7 9\n5", output: "2" },
            { input: "1 3 5 7 9\n6", output: "-1" },
            { input: "2 4 6 8 10\n10", output: "4" },
            { input: "1\n1", output: "0" }
        ],
        examples: [
            { input: "1 3 5 7 9\n5", output: "2", explanation: "5 is at index 2." }
        ]
    },
    {
        title: "Linked List Cycle Detection",
        description: "Given a sequence of integers representing node values, and an integer `pos` indicating the position (0-indexed) where the tail connects to, determine if there is a cycle.\n\nIf `pos` is `-1`, there is no cycle.\n\nPrint `true` if there is a cycle, `false` otherwise.\n\n### Input\nFirst line: space-separated integers (node values).\nSecond line: an integer `pos`.\n\n### Output\n`true` or `false`.",
        difficulty: "Medium",
        categories: ["Data Structures"],
        tags: ["Linked List", "Two Pointers"],
        xpReward: 30,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', (line) => lines.push(line));\nrl.on('close', () => {\n    const values = lines[0].split(' ').map(Number);\n    const pos = parseInt(lines[1]);\n    // Detect cycle\n});\n" },
            { language: "python", code: "values = list(map(int, input().split()))\npos = int(input())\n# Detect cycle: print true or false\n" }
        ],
        testCases: [
            { input: "3 2 0 -4\n1", output: "true" },
            { input: "1 2\n0", output: "true" },
            { input: "1\n-1", output: "false" }
        ],
        examples: [
            { input: "3 2 0 -4\npos = 1", output: "true", explanation: "Tail connects to node at index 1." }
        ]
    },
    {
        title: "Merge Sort",
        description: "Given a list of integers (space-separated), sort them using the merge sort algorithm and print the sorted array (space-separated).\n\n### Input\nA single line of space-separated integers.\n\n### Output\nThe sorted integers, space-separated.",
        difficulty: "Medium",
        categories: ["Algorithms"],
        tags: ["Sorting", "Divide and Conquer"],
        xpReward: 30,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const nums = line.split(' ').map(Number);\n    // Implement merge sort and print result\n});\n" },
            { language: "python", code: "nums = list(map(int, input().split()))\n# Implement merge sort and print sorted array\n" }
        ],
        testCases: [
            { input: "5 3 8 1 2", output: "1 2 3 5 8" },
            { input: "1", output: "1" },
            { input: "3 1 2", output: "1 2 3" },
            { input: "10 9 8 7 6 5 4 3 2 1", output: "1 2 3 4 5 6 7 8 9 10" }
        ],
        examples: [
            { input: "5 3 8 1 2", output: "1 2 3 5 8", explanation: "Sorted in ascending order." }
        ]
    },
    {
        title: "Longest Common Subsequence",
        description: "Given two strings, find the length of their longest common subsequence (LCS).\n\nA subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.\n\n### Input\nFirst line: string `s1`.\nSecond line: string `s2`.\n\n### Output\nAn integer — the length of the LCS.",
        difficulty: "Hard",
        categories: ["Algorithms"],
        tags: ["Dynamic Programming", "Strings"],
        xpReward: 50,
        templates: [
            { language: "javascript", code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', (line) => lines.push(line));\nrl.on('close', () => {\n    const s1 = lines[0];\n    const s2 = lines[1];\n    // Compute LCS length\n});\n" },
            { language: "python", code: "s1 = input()\ns2 = input()\n# Compute and print LCS length\n" }
        ],
        testCases: [
            { input: "abcde\nace", output: "3" },
            { input: "abc\nabc", output: "3" },
            { input: "abc\ndef", output: "0" },
            { input: "abcd\nabdc", output: "3" }
        ],
        examples: [
            { input: "abcde\nace", output: "3", explanation: "The LCS is 'ace' with length 3." }
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
            { language: "javascript", code: "function solve(input) {\n  const n = parseInt(input);\n  return n * n;\n}" },
            { language: "python", code: "n = int(input())\nprint(n * n)" },
            { language: "c", code: "#include <stdio.h>\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    printf(\"%d\\n\", n * n);\n    return 0;\n}" }
        ],
        testCases: [
            { input: "4", output: "16" },
            { input: "5", output: "25" },
            { input: "10", output: "100" }
        ],
        examples: [
            { input: "4", output: "16", explanation: "4 * 4 = 16" }
        ]
    }
];

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI exists:', !!process.env.MONGO_URI);
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
