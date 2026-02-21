/**
 * Queue Layer
 * Responsibility: Job Management / Buffering.
 * - Ensures requests are processed in order.
 * - Prevents system overload by controlling concurrency.
 * - Provides persistence (if using Redis) so jobs aren't lost on server restart.
 */

// Placeholder for a real Queue like BullMQ
const addJob = async (jobData) => {
    console.log(`[Queue] Adding job for language: ${jobData.language}`);

    // In production: return await workerQueue.add('execute', jobData);
    const mockJobId = `job_${Date.now()}`;

    return { id: mockJobId };
};

module.exports = { addJob };
