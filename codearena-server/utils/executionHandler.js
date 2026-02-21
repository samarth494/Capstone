const vm = require('vm');

const path = require('path');
const fs = require('fs');

/**
 * Dynamic Problem Loader
 */
const getProblem = (problemId) => {
    try {
        const problemPath = path.join(__dirname, '..', 'problems', `${problemId}.js`);
        if (fs.existsSync(problemPath)) {
            return require(problemPath);
        }
        return null;
    } catch (error) {
        console.error(`Error loading problem ${problemId}:`, error);
        return null;
    }
};

/**
 * Safely executes user code against test cases
 * @param {Object} submissionData - Contains code, roomId, problemId, etc.
 */
const executeSubmission = async ({ code, problemId = 'hello-world' }) => {
    const startTime = Date.now();
    const problem = getProblem(problemId);

    if (!problem) {
        return { success: false, error: "Problem definition not found", executionTime: 0 };
    }

    let passedCount = 0;
    const results = [];

    try {
        // Prepare simulation of test cases
        for (let i = 0; i < problem.testCases.length; i++) {
            const { input, expected } = problem.testCases[i];

            // Create a custom context for each execution
            const context = {
                console: { log: () => { } }, // Suppress console logs in sandbox
                input: input
            };
            vm.createContext(context);

            // Wrap user code to execute the solve function
            const scriptCode = `
                ${code}
                const result = typeof solve === 'function' ? solve(input) : null;
                result;
            `;

            const script = new vm.Script(scriptCode);

            // Run with 2 second timeout per test case
            const result = script.runInContext(context, { timeout: 2000 });

            const isCorrect = problem.validator(result, expected);

            if (isCorrect) {
                passedCount++;
            } else {
                results.push(`Test Case #${i + 1} Failed: Expected ${JSON.stringify(expected)}, Got ${JSON.stringify(result)}`);
            }
        }

        const success = passedCount === problem.testCases.length;

        return {
            success,
            executionTime: Date.now() - startTime,
            logs: success
                ? `All ${passedCount} test cases passed!`
                : `${passedCount}/${problem.testCases.length} test cases passed.\n${results.join('\n')}`
        };

    } catch (error) {
        return {
            success: false,
            error: `Runtime Error: ${error.message}`,
            executionTime: Date.now() - startTime,
            logs: "Execution stopped due to error."
        };
    }
};

module.exports = { executeSubmission };
