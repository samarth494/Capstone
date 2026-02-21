const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Map languages to file extensions and execution commands
const LANGUAGE_CONFIG = {
    'javascript': { ext: 'js', cmd: 'node', args: [] },
    'python': { ext: 'py', cmd: 'python', args: [] },
    'cpp': { ext: 'cpp', cmd: 'g++', args: [] }, // Requires g++ installed
    'java': { ext: 'java', cmd: 'javac', args: [] }, // Requires javac installed
    'c': { ext: 'c', cmd: 'gcc', args: [] } // Requires gcc installed
};

/**
 * Run code in a specific language with given input
 * @param {string} language - Programming language (javascript, python, etc.)
 * @param {string} code - Source code to execute
 * @param {string} input - Input to provide to stdin
 * @returns {Promise<{stdout: string, stderr: string, executionTime: number}>}
 */
const runCode = (language, code, input) => {
    return new Promise(async (resolve, reject) => {
        const config = LANGUAGE_CONFIG[language];
        if (!config) {
            return reject(new Error(`Language '${language}' is not supported.`));
        }

        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const fileName = `job_${timestamp}_${randomId}`;
        const filePath = path.join(TEMP_DIR, `${fileName}.${config.ext}`);

        let processCmd = config.cmd;
        let processArgs = [...config.args, filePath];

        // Write code to file
        try {
            await fs.promises.writeFile(filePath, code);
        } catch (err) {
            return reject(new Error(`Failed to write code file: ${err.message}`));
        }

        // Special handling for compiled languages (simulated/basic) or adjusting args
        // For simplicity in this environment, we focus on interpreting JS/Python directly.
        // C++/Java would typically require a compile step then run step.
        // Here we'll just try to run them if the command exists, or fail gracefully.

        const startTime = process.hrtime();

        const child = spawn(processCmd, processArgs);

        let stdout = '';
        let stderr = '';
        let errorOccurred = false;

        // Write input to stdin
        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        } else {
            child.stdin.end();
        }

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (err) => {
            errorOccurred = true;
            cleanup(filePath);
            reject(new Error(`Failed to start subprocess: ${err.message}`));
        });

        child.on('close', (code) => {
            if (errorOccurred) return;
            cleanup(filePath);

            const [seconds, nanoseconds] = process.hrtime(startTime);
            const executionTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2); // ms

            resolve({
                stdout,
                stderr,
                executionTime,
                exitCode: code
            });
        });

        // Timeout safety
        setTimeout(() => {
            if (!child.killed) {
                child.kill();
                errorOccurred = true;
                cleanup(filePath);
                reject(new Error('Execution timed out (5000ms limit)'));
            }
        }, 5000);
    });
};

const cleanup = (filePath) => {
    fs.unlink(filePath, (err) => {
        // Ignore ENOENT — file was already deleted (race condition between close + timeout)
        if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete temp file ${filePath}:`, err);
        }
    });
};

module.exports = { runCode };
