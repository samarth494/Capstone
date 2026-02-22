const { addCompileTask } = require('../queue/compileQueue');
const pythonRunner = require('../sandbox/runners/pythonRunner');
const cRunner = require('../sandbox/runners/cRunner');      // C — Blind Coding only
const cppRunner = require('../sandbox/runners/cppRunner');
const javaRunner = require('../sandbox/runners/javaRunner');
const crypto = require('crypto');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Language Registry
// Maps language string → runner instance.
// Add new languages here only — nothing else needs to change.
// ─────────────────────────────────────────────────────────────────────────────
const RUNNERS = {
    python: pythonRunner,
    c: cRunner,   // Blind Coding mode only
    cpp: cppRunner,
    java: javaRunner,
};

class ExecutionService {
    /**
     * Main entry point called by the Controller.
     *
     * @param {object} params
     * @param {string} params.language  - 'python' | 'c' | 'cpp' | 'java'
     * @param {string} params.code      - Raw user source code
     * @param {string} params.input     - Optional stdin string
     * @returns {object} { stdout, stderr, output, status, exitCode, executionTime, jobId }
     */
    async executeCode({ language, code, input = '' }) {
        const lang = language.toLowerCase();
        const jobId = crypto.randomUUID().substring(0, 8);
        const runner = RUNNERS[lang];

        // ── 1. Language Validation ────────────────────────────────────────────
        if (!runner) {
            logger.error(jobId, `Unsupported language: ${lang}`, new Error('No runner'));
            return this._buildResult('', `Language '${lang}' is not supported.`, 1, 0, jobId);
        }

        // ── 2. Structured Log: Submission Received ────────────────────────────
        logger.start(jobId, lang);
        const wallStart = Date.now();

        try {
            // ── 3. Enqueue (throws if > 100 jobs waiting) ─────────────────────
            const result = await addCompileTask(async () => {
                logger.info(jobId, `Slot acquired — launching ${lang} container.`);
                const runResult = await runner.run(lang, code, input, jobId);
                console.log(`[DEBUG] Runner Result for ${jobId}:`, JSON.stringify(runResult));
                return runResult;
            });

            const wallTime = Date.now() - wallStart;

            // ── 4. Structured Log: Execution Finished ─────────────────────────
            logger.finish(jobId, {
                executionTime: result.executionTime,
                exitCode: result.exitCode,
                status: result.exitCode === 0 ? 'success' : 'runtime_error',
                stdout: result.stdout,
                stderr: result.stderr
            });

            return this._buildResult(
                result.stdout,
                result.stderr,
                result.exitCode,
                result.executionTime,
                jobId
            );

        } catch (error) {
            const wallTime = Date.now() - wallStart;

            // ── 5. Structured Log: Error (queue full / Docker crash) ──────────
            logger.error(jobId, 'Execution pipeline failure', error);

            // Queue full — forward the human-readable message to frontend
            const isCapacity = error.message.includes('capacity');
            const isTLE = error.message.toLowerCase().includes('time limit');

            return {
                stdout: '',
                stderr: error.message,
                output: error.message,
                status: isCapacity ? 'queue_full' : isTLE ? 'timeout' : 'system_failure',
                exitCode: -1,
                executionTime: wallTime,
                jobId
            };
        }
    }

    // ── Private: Build uniform response object ────────────────────────────────
    _buildResult(stdout, stderr, exitCode, executionTime, jobId) {
        const isTLE = stderr === 'Time Limit Exceeded';
        const isSuccess = exitCode === 0;

        return {
            stdout,
            stderr,
            // 'output' = what the frontend console shows (stdout preferred, fall back to stderr)
            output: stdout || stderr || 'No output produced.',
            status: isTLE ? 'timeout' : isSuccess ? 'success' : 'runtime_error',
            exitCode,
            executionTime,
            // Alias: frontend reads both 'runtime' and 'executionTime'
            runtime: executionTime,
            jobId
        };
    }
}

module.exports = new ExecutionService();
