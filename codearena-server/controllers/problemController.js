const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const runner = require('../utils/runner');

// Get all problems (filtered by category/difficulty if needed)
const getProblems = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.categories = category;
        }
        if (difficulty && difficulty !== 'All') {
            query.difficulty = difficulty;
        }

        const problems = await Problem.find(query).select('-testCases -templates'); // Hide test cases
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single problem details
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).select('-testCases.output -testCases.isPrime');
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit a solution
const submitSolution = async (req, res) => {
    try {
        const { code, language } = req.body;
        const problemId = req.params.id;
        const userId = req.user._id;

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Run against all test cases
        let passed = 0;
        let total = problem.testCases.length;
        let totalTime = 0;
        let error = null;
        let status = 'Accepted';

        for (const testCase of problem.testCases) {
            try {
                const result = await runner.runCode(language, code, testCase.input);
                totalTime += parseFloat(result.executionTime || 0);

                if (result.stderr) {
                    status = 'Runtime Error';
                    error = result.stderr;
                    break;
                }

                if (result.stdout.trim() !== testCase.output.trim()) {
                    status = 'Wrong Answer';
                    error = `Expected: ${testCase.output.trim()}, Got: ${result.stdout.trim()}`;
                    break; // Stop on first failure
                }
                passed++;
            } catch (err) {
                status = 'Runtime Error';
                error = err.message;
                break;
            }
        }

        // Create submission record
        const submission = new Submission({
            user: userId,
            problem: problemId, // Fixed field name to match model
            language,
            code,
            status,
            passedTestCases: passed,
            totalTestCases: total,
            executionTime: totalTime,
            error
        });

        await submission.save();

        // Calculate XP if accepted
        let xpGained = 0;
        if (status === 'Accepted') {
            // Check if already solved correctly before? Maybe one time reward?
            // For now, simple reward
            xpGained = problem.xpReward;
        }

        res.json({
            submission,
            xpGained
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get user submissions for a problem
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            user: req.user._id,
            problem: req.params.id
        }).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProblems,
    getProblemById,
    submitSolution,
    getSubmissions
};
