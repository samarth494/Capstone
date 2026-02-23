const { exec } = require('child_process');
const path = require('path');
const BaseRunner = require('./BaseRunner');
const fileUtility = require('../../utils/fileUtility');
const logger = require('../../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// C++ Runner
// Image   : gcc:latest
// Timeout : 10 000 ms (compile + run)
// Limits  : --memory=128m --cpus=0.5 --pids-limit=64 --network=none
// ─────────────────────────────────────────────────────────────────────────────
class CppRunner extends BaseRunner {
    async run(language, code, input = '', jobId) {
        const { workspacePath } = fileUtility.createWorkspace();
        const sourceFile = 'solution.cpp';
        const binary = 'solution.out';

        try {
            fileUtility.writeFiles(workspacePath, sourceFile, code, input);

            const dockerMount = workspacePath.replace(/\\/g, '/');
            const compileCmd = `g++ /app/${sourceFile} -o /app/${binary}`;
            const runCmd = `/app/${binary} < /app/input.txt`;

            const cmd = [
                'docker run --rm',
                '--memory=128m',
                '--cpus=0.5',
                '--pids-limit=64',
                '--network=none',
                '--stop-timeout=5',
                `-v "${dockerMount}:/app"`,
                'gcc:latest',
                `sh -c "${compileCmd} && timeout 5 ${runCmd}"` // 5s run limit in-container
            ].join(' ');

            logger.launch(jobId, 'gcc:latest');
            return await this._exec(cmd, jobId);

        } finally {
            fileUtility.cleanupWorkspace(workspacePath);
        }
    }

    _exec(cmd, jobId) {
        return new Promise((resolve) => {
            const start = Date.now();
            // 20s = compile + 5s in-container run + Docker startup overhead
            exec(cmd, { timeout: 20000 }, (error, stdout, stderr) => {
                const executionTime = Date.now() - start;
                const sanitized = this._sanitize(stderr);

                const isTLE = error?.killed || (error?.code === 124) ||
                    (stderr || '').includes('Killed');

                if (isTLE) {
                    return resolve({ stdout: '', stderr: 'Time Limit Exceeded', exitCode: 124, executionTime });
                }
                resolve({
                    stdout: stdout.trim(),
                    stderr: sanitized,
                    exitCode: error ? (error.code || 1) : 0,
                    executionTime,
                    isCompilationError: !stdout && sanitized.length > 0
                });
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

module.exports = new CppRunner();
