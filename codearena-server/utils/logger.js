/**
 * Structured Logger for CodeArena Sandbox
 * Responsibility: Provide consistent, readable logs for debugging executions.
 */

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    red: "\x1b[31m"
};

const formatLog = (level, jobId, message, data = null) => {
    const timestamp = new Date().toISOString();
    const idTag = jobId ? `[${jobId}]` : '';
    const levelTag = `[${level.toUpperCase()}]`;

    let color = colors.reset;
    if (level === 'info') color = colors.blue;
    if (level === 'start') color = colors.green;
    if (level === 'finish') color = colors.cyan;
    if (level === 'warn') color = colors.yellow;
    if (level === 'error') color = colors.red;

    let output = `${colors.dim}${timestamp}${colors.reset} ${color}${colors.bright}${levelTag}${colors.reset}${idTag} ${message}`;

    if (data) {
        output += `\n${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`;
    }

    return output;
};

const sandboxLogger = {
    info: (jobId, message) => console.log(formatLog('info', jobId, message)),
    start: (jobId, language) => console.log(formatLog('start', jobId, `Execution Started: ${language.toUpperCase()}`)),
    launch: (jobId, container) => console.log(formatLog('info', jobId, `Container Launched: ${container}`)),
    finish: (jobId, result) => {
        const message = `Execution Finished (${result.executionTime}ms) - ExitCode: ${result.exitCode}`;
        console.log(formatLog('finish', jobId, message, {
            status: result.status,
            stdoutLength: result.stdout?.length || 0,
            hasError: !!result.stderr
        }));
    },
    error: (jobId, message, error) => {
        console.log(formatLog('error', jobId, message, {
            errorMessage: error.message,
            stack: error.stack?.split('\n')[1].trim() // Just the first line of stack for clarity
        }));
    }
};

module.exports = sandboxLogger;
