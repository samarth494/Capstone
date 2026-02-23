const path = require('path');
const fs = require('fs');
const executionService = require('../services/executionService');

/**
 * executionHandler.js  — Battle Arena Sandbox Bridge
 *
 * UPGRADED: was Node vm module (JS-only, insecure)
 *             NOW: Docker sandbox runners (Python, C++, Java, safe + resource-limited)
 *
 * Output contract is unchanged — battleSocket.js reads:
 *   { success, executionTime, logs }
 * This wrapper maps ExecutionService's rich result → that shape.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Problem Loader
// Loads test cases from /problems/<id>.js
// Falls back to a basic "Hello World" stdout match if no file found.
// ─────────────────────────────────────────────────────────────────────────────
const getProblem = (problemId) => {
    try {
        const problemPath = path.join(__dirname, '..', 'problems', `${problemId}.js`);
        if (fs.existsSync(problemPath)) {
            return require(problemPath);
        }
        return null;
    } catch (error) {
        console.error(`[ExecutionHandler] Failed to load problem ${problemId}:`, error.message);
        return null;
    }
};

/**
 * executeSubmission
 * Called by battleSocket.js on the "battle:submit" event.
 *
 * @param {object} params
 * @param {string} params.code        - User's submitted code
 * @param {string} params.language    - 'python' | 'cpp' | 'java' (from frontend)
 * @param {string} params.problemId   - e.g. 'hello-world'
 * @param {string} [params.roomId]    - Battle room (for logging)
 *
 * @returns {object} { success, executionTime, logs }
 */
const executeSubmission = async ({ code, language = 'python', problemId = 'hello-world', roomId = '?' }) => {
    const startTime = Date.now();

    // ── 1. Load Problem Definition ────────────────────────────────────────────
    const problem = getProblem(problemId);

    if (!problem) {
        return {
            success: false,
            executionTime: 0,
            logs: `Problem definition not found for: ${problemId}`
        };
    }

    const testCases = problem.testCases || [];
    let passedCount = 0;
    const failedLogs = [];

    // ── 2. Run Each Test Case Through Docker Sandbox ──────────────────────────
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];

        // Convert input to string for stdin piping
        // problem files store { input: {}, expected: "Hello World" }
        // For hello-world, expected output is just the printed string
        const stdinInput = typeof tc.input === 'string'
            ? tc.input
            : JSON.stringify(tc.input);

        let result;
        try {
            result = await executionService.executeCode({
                language,
                code,
                input: stdinInput
            });
        } catch (err) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                logs: `Docker Execution Error: ${err.message}`
            };
        }

        // ── 3. Handle Timeout / Runtime Errors ───────────────────────────────
        if (result.status === 'timeout') {
            return {
                success: false,
                executionTime: result.executionTime || 0,
                logs: `Time Limit Exceeded on Test Case #${i + 1}`
            };
        }

        if (result.exitCode !== 0) {
            return {
                success: false,
                executionTime: result.executionTime || 0,
                logs: `Runtime Error on Test Case #${i + 1}:\n${result.stderr}`
            };
        }

        // ── 4. Validate Output ────────────────────────────────────────────────
        const actual = (result.stdout || '').trim();
        const expected = String(tc.expected).trim();

        // Use problem's own validator if provided, otherwise plain string match
        const isCorrect = typeof problem.validator === 'function'
            ? problem.validator(actual, expected)
            : actual === expected;

        if (isCorrect) {
            passedCount++;
        } else {
            failedLogs.push(
                `Test Case #${i + 1} Failed:\n  Expected: ${expected}\n  Got:      ${actual}`
            );
        }
    }

    // ── 5. Build Response (same shape battleSocket.js expects) ────────────────
    const totalTime = Date.now() - startTime;
    const success = passedCount === testCases.length;

    console.log(`[ExecutionHandler][${roomId}] ${passedCount}/${testCases.length} passed in ${totalTime}ms`);

    return {
        success,
        executionTime: totalTime,
        logs: success
            ? `✅ All ${passedCount}/${testCases.length} test cases passed! (${totalTime}ms)`
            : `❌ ${passedCount}/${testCases.length} passed.\n${failedLogs.join('\n')}`
    };
};

module.exports = { executeSubmission };
