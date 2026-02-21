const { exec } = require('child_process');
const BaseRunner = require('./BaseRunner');
const fileUtility = require('../../utils/fileUtility');
const logger = require('../../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Java Runner
// Image          : openjdk:17-slim
// Code timeout   : 5s  (enforced INSIDE the container via `timeout` command)
// exec() timeout : 30s (JVM startup + compile + run + Docker overhead)
// Limits         : --memory=256m --cpus=0.5 --pids-limit=64 --network=none
// ─────────────────────────────────────────────────────────────────────────────
class JavaRunner extends BaseRunner {
    async run(language, code, input = '', jobId) {
        const { workspacePath } = fileUtility.createWorkspace();
        const sourceFile = 'Solution.java';
        const className = 'Solution';

        try {
            fileUtility.writeFiles(workspacePath, sourceFile, code, input);

            const dockerMount = workspacePath.replace(/\\/g, '/');
            const compileCmd = `javac /app/${sourceFile}`;
            // Use `timeout` inside the container for the actual run time limit
            const runCmd = `timeout 5 java -cp /app ${className} < /app/input.txt`;

            const cmd = [
                'docker run --rm',
                '--memory=256m',
                '--cpus=0.5',
                '--pids-limit=64',
                '--network=none',
                '--stop-timeout=5',
                `-v "${dockerMount}:/app"`,
                'openjdk:17-slim',
                `sh -c "${compileCmd} && ${runCmd}"`
            ].join(' ');

            logger.launch(jobId, 'openjdk:17-slim');
            return await this._exec(cmd, jobId);

        } finally {
            fileUtility.cleanupWorkspace(workspacePath);
        }
    }

    _exec(cmd, jobId) {
        return new Promise((resolve) => {
            const start = Date.now();
            // 30s = compile (~5s) + 5s run + JVM startup + Docker overhead
            exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
                const executionTime = Date.now() - start;
                const sanitized = this._sanitize(stderr);

                // timeout command exits 124; exec killed flag fires if 30s host limit hit
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
                    isCompilationError: !stdout && sanitized.includes('error:')
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

module.exports = new JavaRunner();
