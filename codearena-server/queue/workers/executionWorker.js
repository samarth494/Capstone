const dockerRunner = require('../../sandbox/runners/DockerRunner');

/**
 * Queue Worker (Consumer)
 * Responsibility: Executing the queued jobs.
 * - Listens for new jobs from the Queue.
 * - Hands off the job data to the DockerRunner.
 * - Communicates back results (via database update or Socket.io).
 */
const processJob = async (job) => {
    const { language, code, input, userId } = job.data;

    console.log(`[Worker] Started processing Job: ${job.id} for User: ${userId}`);

    try {
        // 1. Execute in Sandbox
        const result = await dockerRunner.run(language, code, input);

        // 2. Placeholder: Update database with verdict
        console.log(`[Worker] Job ${job.id} finished. Result:`, result);

        // 3. Placeholder: Emit socket event to notify frontend
        // io.to(userId).emit('codeResult', { jobId: job.id, ...result });

    } catch (error) {
        console.error(`[Worker] Job ${job.id} failed:`, error);
        // Update database with 'System Error' verdict
    }
};

module.exports = { processJob };
