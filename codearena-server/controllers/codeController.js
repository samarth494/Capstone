const executionService = require('../services/executionService');

/**
 * Controller: Handles the HTTP request for code execution.
 * 1. extracts payload from body.
 * 2. hands off to ExecutionService.
 * 3. returns job acknowledgment to client.
 */
const runCode = async (req, res) => {
    const { language, code, input, testCases } = req.body;

    try {
        const result = await executionService.executeCode({
            userId: req.user?.id || 'anonymous',
            language,
            code,
            input,
            testCases
        });

        res.json({
            success: true,
            message: "Execution queued successfully",
            jobId: result.jobId,
            status: result.status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { runCode };
