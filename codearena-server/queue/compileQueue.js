const { default: PQueue } = require('p-queue');

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const CONCURRENCY_LIMIT = 5;   // Max simultaneous Docker containers
const QUEUE_SIZE_LIMIT = 100; // Reject new tasks if backlog exceeds this

// ─────────────────────────────────────────────────────────────────────────────
// Queue Instance
// FIFO order is p-queue's default. concurrency = 5 means only 5 Docker
// containers ever run at the same time, regardless of user count.
// ─────────────────────────────────────────────────────────────────────────────
const compileQueue = new PQueue({ concurrency: CONCURRENCY_LIMIT });

// ─────────────────────────────────────────────────────────────────────────────
// addCompileTask
// Wraps every execution request.
// Rejects immediately if the waiting queue is over 100 — this is the
// "overload protection" that prevents memory exhaustion during competition spikes.
// ─────────────────────────────────────────────────────────────────────────────
const addCompileTask = async (task) => {
    // size = waiting jobs | pending = currently running jobs
    if (compileQueue.size >= QUEUE_SIZE_LIMIT) {
        throw new Error(
            `Server is at capacity (${QUEUE_SIZE_LIMIT} jobs queued). ` +
            `Please try again in a moment.`
        );
    }

    console.log(
        `[Queue] Enqueued | Waiting: ${compileQueue.size + 1} | Running: ${compileQueue.pending}/${CONCURRENCY_LIMIT}`
    );

    return await compileQueue.add(task);
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Health Monitoring
// ─────────────────────────────────────────────────────────────────────────────
compileQueue.on('next', () => {
    console.log(
        `[Queue] Task complete | Waiting: ${compileQueue.size} | Running: ${compileQueue.pending}/${CONCURRENCY_LIMIT}`
    );
});

compileQueue.on('idle', () => {
    console.log('[Queue] All tasks complete — queue is idle.');
});

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    compileQueue,
    addCompileTask,
    getQueueStats: () => ({
        waiting: compileQueue.size,
        running: compileQueue.pending,
        concurrency: CONCURRENCY_LIMIT,
        limit: QUEUE_SIZE_LIMIT
    })
};
