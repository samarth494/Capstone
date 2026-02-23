const { exec } = require('child_process');
const BaseRunner = require('./BaseRunner');
const fileUtility = require('../../utils/fileUtility');
const logger = require('../../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// JavaScript (Node.js) Runner
// Image          : node:18-alpine
// Code timeout   : 3s
// exec() timeout : 10s
// Limits         : --memory=128m --cpus=0.5 --pids-limit=64 --network=none
// ─────────────────────────────────────────────────────────────────────────────
class JavascriptRunner extends BaseRunner {
    async run(language, code, input = '', jobId) {
        const { workspacePath } = fileUtility.createWorkspace();
        const fileName = 'solution.js';

        try {
            fileUtility.writeFiles(workspacePath, fileName, code, input);

            const dockerMount = workspacePath.replace(/\\/g, '/');

            const cmd = [
                'docker run --rm',
                '--memory=128m',
                '--cpus=0.5',
                '--pids-limit=64',
                '--network=none',
                '--stop-timeout=3',
                `-v "${dockerMount}:/app"`,
                'node:18-alpine',
                `sh -c "timeout 3 node /app/solution.js < /app/input.txt"`
            ].join(' ');

            logger.launch(jobId, 'node:18-alpine');
            return await this._exec(cmd, jobId);

        } finally {
            fileUtility.cleanupWorkspace(workspacePath);
        }
    }

    _exec(cmd, jobId) {
        return new Promise((resolve) => {
            const start = Date.now();
            exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
                const executionTime = Date.now() - start;

                const isTLE = error?.killed || (error?.code === 124) ||
                    (stderr || '').includes('Killed');

                if (isTLE) {
                    return resolve({ stdout: '', stderr: 'Time Limit Exceeded', exitCode: 124, executionTime });
                }
                if (error) {
                    return resolve({ stdout: stdout.trim(), stderr: this._sanitize(stderr), exitCode: error.code || 1, executionTime });
                }
                resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0, executionTime });
            });
        });
    }

    _sanitize(stderr = '') {
        return stderr
            .replace(/\/app\//g, '')
            .replace(/Error response from daemon:.*/g, 'Container error.')
            .trim();
    }
}

module.exports = new JavascriptRunner();
