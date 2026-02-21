/**
 * ExecutionWorker
 * Responsibility: Job Consumer.
 * 1. Listens for new jobs from the ExecutionQueue.
 * 2. Calls Sandbox Runner (DockerRunner) based on job details.
 * 3. Handles results (success, failure, timeout).
 * 4. Communicates status/results back via WebSockets or Webhooks.
 */

const dockerRunner = require('../../sandbox/runners/DockerRunner');

// Mock processing logic
const processJob = async (job) => {
    const { language, code, input } = job.data;

    try {
        console.log(`Processing Job ID: ${job.id}`);
        const result = await dockerRunner.run(language, code, input);

        // Update database with result or send socket event
        console.log(`Job Result:`, result);
    } catch (error) {
        console.error(`Job failed:`, error);
    }
};

module.exports = { processJob };
