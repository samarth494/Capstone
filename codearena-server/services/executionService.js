/**
 * ExecutionService
 * Responsibility: High-level orchestration.
 * 1. Receives code execution requests from Controllers.
 * 2. Validates inputs and prepares job metadata.
 * 3. Adds the job to the ExecutionQueue.
 * 4. Returns a job ID to the controller for polling or socket updates.
 */

const executionQueue = require('../queue/executionQueue');

const executeCode = async (data) => {
    const { userId, language, code, input, testCases } = data;

    // Validate inputs
    if (!code || !language) {
        throw new Error('Code and Language are required');
    }

    // Add to Redis/Bull queue
    const job = await executionQueue.addJob({
        userId,
        language,
        code,
        input,
        testCases,
        timestamp: Date.now()
    });

    return {
        jobId: job.id,
        status: 'queued'
    };
};

module.exports = {
    executeCode
};
