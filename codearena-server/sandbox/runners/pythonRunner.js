const { exec } = require('child_process');
const BaseRunner = require('./BaseRunner');
const fileUtility = require('../../utils/fileUtility');
const logger = require('../../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Python Runner
// Image          : python:3.10
// Code timeout   : 3s  (enforced INSIDE the container via `timeout` command)
// exec() timeout : 10s (Docker startup overhead on cold pull can take a few sec)
// Limits         : --memory=128m --cpus=0.5 --pids-limit=64 --network=none
// ─────────────────────────────────────────────────────────────────────────────
class PythonRunner extends BaseRunner {
    async run(language, code, input = '', jobId) {
        const { workspacePath } = fileUtility.createWorkspace();
        const fileName = 'solution.py';

        try {
            fileUtility.writeFiles(workspacePath, fileName, code, input);

            // Convert Windows backslashes → forward slashes for Docker
            const dockerMount = workspacePath.replace(/\\/g, '/');

            const cmd = [
                'docker run --rm',
                '--memory=128m',
                '--cpus=0.5',
                '--pids-limit=64',
                '--network=none',
                '--stop-timeout=3',
                `-v "${dockerMount}:/app"`,
                'python:3.10',
                // Wrap in sh -c so the < redirect happens INSIDE the container (Linux),
                // not on the Windows host where PowerShell does not support < redirection.
                `sh -c "timeout 3 python /app/solution.py < /app/input.txt"`
            ].join(' ');

            logger.launch(jobId, 'python:3.10');
            return await this._exec(cmd, jobId);

        } finally {
            fileUtility.cleanupWorkspace(workspacePath);
        }
    }

    _exec(cmd, jobId) {
        return new Promise((resolve) => {
            const start = Date.now();
            // 10s exec timeout = 3s code + ~7s Docker startup headroom
            exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
                const executionTime = Date.now() - start;

                // timeout command exits with code 124 when time exceeded
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

module.exports = new PythonRunner();
