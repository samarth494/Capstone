const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { executeCode } = require('../utils/executor');

// @desc    Get all problems
// @route   GET /api/problems
const getProblems = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        const problems = await Problem.find(query).select('-testCases -examples.explanation');
        // Hide test cases and explanations in list view
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).select('-testCases');
        // Hide hidden test cases
        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for a problem
// @route   GET /api/problems/:id/submissions
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            problem: req.params.id,
            user: req.user._id
        }).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a solution
// @route   POST /api/problems/:id/submit
const submitProblem = async (req, res) => {
    const { code, language } = req.body;
    const problemId = req.params.id;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Cooldown Check (e.g., 10 seconds)
        console.log(`[Submit] User ${req.user._id} submitting for ${problemId}`);
        const lastSubmission = await Submission.findOne({
            user: req.user._id,
            problem: problemId
        }).sort({ createdAt: -1 });

        if (lastSubmission) {
            const timeDiff = Date.now() - new Date(lastSubmission.createdAt).getTime();
            if (timeDiff < 10000) { // 10 seconds
                console.log("[Submit] Cooldown active");
                return res.status(429).json({ message: `Please wait ${Math.ceil((10000 - timeDiff) / 1000)}s before submitting again.` });
            }
        }

        let passedCases = 0;
        let totalTime = 0;
        let status = 'Accepted';
        let errorMsg = null;

        // wrapper logic
        let wrappedCode = code;

        const hasSolveDefJS = code.includes('function solve');
        const hasSolveDefPy = code.includes('def solve');

        if (language === 'javascript' && hasSolveDefJS && !code.includes('process.stdin')) {
            wrappedCode += `\n
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    // Check if input is empty string which might break split/map logic for some problems
    const result = solve(input);
    console.log(result);
} catch (e) {
    console.error(e);
}
            `;
        } else if (language === 'python' && hasSolveDefPy && !code.includes('sys.stdin')) {
            wrappedCode += `\n
import sys
try:
    input_data = sys.stdin.read().strip()
    print(solve(input_data))
except Exception as e:
    print(e)
            `;
        }

        console.log("[Submit] Starting Test Cases");
        for (const testCase of problem.testCases) {
            const { output, executionTime, error, status: execStatus } = await executeCode(language, wrappedCode, testCase.input);

            // Handle TLE or Run Error
            if (execStatus === 'TLE') {
                status = 'Time Limit Exceeded';
                errorMsg = 'Execution exceeded the time limit.';
                break;
            }

            if (execStatus === 'RE' || error) {
                status = 'Runtime Error';
                errorMsg = output; // Show the error output
                break;
            }

            // Normalize line endings and trim
            const expected = testCase.output.trim().replace(/\r\n/g, '\n');
            const actual = output ? output.trim().replace(/\r\n/g, '\n') : '';

            if (expected === actual) {
                passedCases++;
                totalTime += parseFloat(executionTime);
            } else {
                status = 'Wrong Answer';
                // Only showing expected for the first failed case might be okay, or hide it.
                // Keeping it hidden for competitive feel, unless it's an example case.
                errorMsg = `Output mismatch on test case ${passedCases + 1}.`;
                break;
            }
        }

        console.log(`[Submit] Loop Done. Status: ${status}`);

        const submission = await Submission.create({
            user: req.user._id,
            problem: problemId,
            code,
            language,
            status,
            executionTime: totalTime,
            passedTestCases: passedCases,
            totalTestCases: problem.testCases.length,
            error: errorMsg
        });

        console.log(`[Submit] Submission Saved: ${submission._id}`);

        // XP Reward logic
        let xpGained = 0;
        if (status === 'Accepted') {
            // Check if already solved
            const existing = await Submission.findOne({
                user: req.user._id,
                problem: problemId,
                status: 'Accepted',
                _id: { $ne: submission._id }
            });

            if (!existing) {
                console.log("[Submit] First time solve. Awarding XP.");
                xpGained = problem.xpReward;
                // Update User XP
                req.user.xp = (req.user.xp || 0) + xpGained;

                // Initialize if missing
                if (!req.user.solvedProblems) {
                    req.user.solvedProblems = [];
                }

                // Check if problem is already solved (handling ObjectId vs String)
                const alreadySolved = req.user.solvedProblems.some(
                    (id) => id.toString() === problemId
                );

                if (!alreadySolved) {
                    req.user.solvedProblems.push(problemId);
                }

                await req.user.save();
                console.log("[Submit] User XP Updated");
            }
        }

        res.json({
            message: status,
            submission,
            xpGained
        });
        console.log("[Submit] Response Sent");

    } catch (error) {
        console.error("[Submit] Critical Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Seed initial problems
// @route   POST /api/problems/seed
const seedProblems = async (req, res) => {
    try {
        await Problem.deleteMany({});

        const problems = [
            {
                title: "Sum of Two Numbers",
                slug: "sum-of-two-numbers",
                difficulty: "Easy",
                category: "Fundamentals",
                xpReward: 50,
                description: "Write a function `solve(input)` that takes two space-separated integers as input and returns their sum.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    const [a, b] = input.split(' ').map(Number);\n    return a + b;\n}" },
                    { language: "python", code: "def solve(input_data):\n    a, b = map(int, input_data.split())\n    return a + b" }
                ],
                examples: [
                    { input: "3 4", output: "7", explanation: "3 + 4 = 7" }
                ],
                testCases: [
                    { input: "3 4", output: "7" },
                    { input: "10 20", output: "30" },
                    { input: "-5 5", output: "0" }
                ],
                tags: ["Loop", "Math"]
            },
            {
                title: "Reverse String",
                slug: "reverse-string",
                difficulty: "Easy",
                category: "Fundamentals",
                xpReward: 50,
                description: "Write a function `solve(input)` that reverses the given string.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    return input.split('').reverse().join('');\n}" },
                    { language: "python", code: "def solve(input_data):\n    return input_data[::-1]" }
                ],
                examples: [
                    { input: "hello", output: "olleh", explanation: "hello reversed is olleh" }
                ],
                testCases: [
                    { input: "hello", output: "olleh" },
                    { input: "CodeArena", output: "aneraedoC" },
                    { input: "12345", output: "54321" }
                ],
                tags: ["String"]
            },
            {
                title: "Check Prime",
                slug: "check-prime",
                difficulty: "Medium",
                category: "Algorithms",
                xpReward: 100,
                description: "Write a function `solve(input)` that returns 'true' if the number is prime, and 'false' otherwise.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    const n = parseInt(input);\n    if (n <= 1) return 'false';\n    for (let i = 2; i * i <= n; i++) {\n        if (n % i === 0) return 'false';\n    }\n    return 'true';\n}" },
                    { language: "python", code: "def solve(input_data):\n    n = int(input_data)\n    if n <= 1: return 'false'\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return 'false'\n    return 'true'" }
                ],
                examples: [
                    { input: "7", output: "true", explanation: "7 is prime" },
                    { input: "10", output: "false", explanation: "10 is 2*5" }
                ],
                testCases: [
                    { input: "7", output: "true" },
                    { input: "10", output: "false" },
                    { input: "23", output: "true" },
                    { input: "1", output: "false" }
                ],
                tags: ["Math", "Prime"]
            },
            {
                title: "Max Element",
                slug: "max-element",
                difficulty: "Easy",
                category: "Data Structures",
                xpReward: 50,
                description: "Write a function `solve(input)` that finds the maximum element in an array of numbers.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    const arr = input.split(' ').map(Number);\n    return Math.max(...arr);\n}" },
                    { language: "python", code: "def solve(input_data):\n    arr = list(map(int, input_data.split()))\n    return max(arr)" }
                ],
                examples: [
                    { input: "1 5 3 9 2", output: "9", explanation: "9 is the largest." }
                ],
                testCases: [
                    { input: "1 2 3", output: "3" },
                    { input: "-1 -5 -2", output: "-1" },
                    { input: "10", output: "10" }
                ],
                tags: ["Array"]
            },
            {
                title: "Valid Parentheses",
                slug: "valid-parentheses",
                difficulty: "Medium",
                category: "Data Structures",
                xpReward: 150,
                description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    const stack = [];\n    const map = { '(': ')', '{': '}', '[': ']' };\n    for (let char of input) {\n        if (map[char]) stack.push(map[char]);\n        else if (stack.pop() !== char) return 'false';\n    }\n    return stack.length === 0 ? 'true' : 'false';\n}" },
                    { language: "python", code: "def solve(input_data):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in input_data:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element: return 'false'\n        else:\n            stack.append(char)\n    return 'true' if not stack else 'false'" }
                ],
                examples: [
                    { input: "()[]{}", output: "true", explanation: "Closed correctly." },
                    { input: "(]", output: "false", explanation: "Mismatched." }
                ],
                testCases: [
                    { input: "()", output: "true" },
                    { input: "()[]{}", output: "true" },
                    { input: "(]", output: "false" },
                    { input: "([)]", output: "false" },
                    { input: "{[]}", output: "true" }
                ],
                tags: ["Stack", "String"]
            },
            {
                title: "Merge Sorted Arrays",
                slug: "merge-sorted-arrays",
                difficulty: "Medium",
                category: "Algorithms",
                xpReward: 100,
                description: "Given two sorted arrays (input as two lines), merge them into a single sorted array. Return the result as a space-separated string.",
                templates: [
                    { language: "javascript", code: "function solve(input) {\n    const lines = input.trim().split('\\n');\n    const arr1 = lines[0].split(' ').map(Number);\n    const arr2 = lines[1].split(' ').map(Number);\n    // Merge logic here\n    // For simplicity, using concat and sort, though O(n+m) is better\n    const merged = arr1.concat(arr2).sort((a,b) => a - b);\n    return merged.join(' ');\n}" }
                ],
                examples: [
                    { input: "1 3 5\n2 4 6", output: "1 2 3 4 5 6", explanation: "Merged sorted order." }
                ],
                testCases: [
                    { input: "1 3\n2", output: "1 2 3" },
                    { input: "10 20\n5 15", output: "5 10 15 20" }
                ],
                tags: ["Array", "Sorting"]
            }
        ];

        await Problem.insertMany(problems);
        res.json({ message: "Problems seeded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProblems,
    getProblemById,
    submitProblem,
    getSubmissions,
    seedProblems
};
