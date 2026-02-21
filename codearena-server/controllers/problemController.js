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
        const { id } = req.params;
        let problem;

        // Try find by ID first if it's a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            problem = await Problem.findById(id).select('-testCases.output -testCases.isPrime');
        } else {
            // Otherwise try finding by slug
            problem = await Problem.findOne({ slug: id }).select('-testCases.output -testCases.isPrime');
        }

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

        let problem;
        if (problemId.match(/^[0-9a-fA-F]{24}$/)) {
            problem = await Problem.findById(problemId);
        } else {
            problem = await Problem.findOne({ slug: problemId });
        }

        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // ARCHITECTURE UPGRADE: 
        // Instead of running synchronously here, we hand off to ExecutionService
        const result = await executionService.executeCode({
            userId,
            language,
            code,
            testCases: problem.testCases, // Service will handle iterating through test cases
            problemId: problem._id
        });

        res.json({
            success: true,
            message: "Submission received and queued for execution",
            jobId: result.jobId,
            status: result.status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get user submissions for a problem
const getSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        let query = { user: req.user._id };

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query.problem = id;
        } else {
            const problem = await Problem.findOne({ slug: id });
            if (problem) {
                query.problem = problem._id;
            } else {
                return res.json([]); // No problem found with that slug
            }
        }

        const submissions = await Submission.find(query).sort({ createdAt: -1 });
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
