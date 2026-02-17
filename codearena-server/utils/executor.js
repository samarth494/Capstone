const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Temporary directory for code files
const TEMP_DIR = path.join(__dirname, '../temp_code');

// Ensure temp directory exists (Wait for it properly)
(async () => {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (err) {
        console.error("Failed to create temp directory", err);
    }
})();

const executeCode = async (language, code, input) => {
    let filePath;
    let executionCommand;
    let executionArgs;

    // Ensure temp directory exists again just in case (race condition safety)
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (err) { }

    try {
        if (language === 'javascript') {
            const fileName = `code_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            filePath = path.join(TEMP_DIR, `${fileName}.js`);
            await fs.writeFile(filePath, code);
            executionCommand = 'node';
            executionArgs = [filePath];
        } else if (language === 'python') {
            const fileName = `code_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            filePath = path.join(TEMP_DIR, `${fileName}.py`);
            await fs.writeFile(filePath, code);
            executionCommand = 'python';
            // Fallback for some windows envs
            // command = process.platform === 'win32' ? 'python' : 'python3'; 
            executionArgs = [filePath];
        } else if (language === 'java') {
            // Extract class name
            const classNameMatch = code.match(/class\s+(\w+)/);
            const className = classNameMatch ? classNameMatch[1] : 'Solution';
            const javaFileName = `${className}.java`;
            filePath = path.join(TEMP_DIR, javaFileName);

            await fs.writeFile(filePath, code);

            // Compile
            try {
                await new Promise((resolve, reject) => {
                    const compile = spawn('javac', [filePath]);
                    let error = '';
                    compile.stderr.on('data', (data) => error += data.toString());
                    compile.on('close', (retCode) => {
                        if (retCode === 0) resolve();
                        else reject(new Error(`Compilation Error:\n${error}`));
                    });
                });
            } catch (compileError) {
                // Cleanup source file
                await fs.unlink(filePath).catch(() => { });
                return {
                    output: compileError.message,
                    executionTime: 0,
                    error: true
                };
            }

            executionCommand = 'java';
            // Use -cp to specify classpath
            executionArgs = ['-cp', TEMP_DIR, className];
        } else if (language === 'cpp' || language === 'c') {
            return {
                output: "C/C++ compilation is currently not supported on this server environment (GCC not found). Please use JavaScript, Python, or Java.",
                executionTime: 0,
                error: true
            };
        } else {
            return { output: "Unsupported language", executionTime: 0, error: true };
        }

        // Execute
        const startTime = process.hrtime();
        console.log(`[Executor] Spawning ${executionCommand} with ${executionArgs}`);

        const result = await new Promise((resolve, reject) => {
            const child = spawn(executionCommand, executionArgs);
            console.log(`[Executor] Spawned PID: ${child.pid}`);

            let stdout = '';
            let stderr = '';
            let isDone = false;

            // Timeout after 5 seconds
            const timer = setTimeout(() => {
                if (!isDone) {
                    console.log(`[Executor] Timeout reached for PID ${child.pid}`);
                    try {
                        child.kill();
                    } catch (err) {
                        console.error("[Executor] Failed to kill process:", err);
                    }
                    isDone = true;
                    resolve({
                        output: "Time Limit Exceeded",
                        executionTime: 5000,
                        error: true,
                        status: "TLE"
                    });
                }
            }, 5000);

            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end();

            // Handle stdin errors (e.g., if child process exits before reading input)
            child.stdin.on('error', (err) => {
                console.log("[Executor] Stdin error (ignored):", err.code);
            });

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                console.log(`[Executor] Process closed with code ${code}`);
                if (isDone) return;
                clearTimeout(timer);
                isDone = true;

                // ... rest of logic

                // Calculate duration
                const duration = process.hrtime(startTime);
                const executionTimeMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);

                if (code !== 0) {
                    resolve({
                        output: stderr || stdout || "Runtime Error",
                        executionTime: executionTimeMs,
                        error: true,
                        status: "RE"
                    });
                } else {
                    resolve({
                        output: stdout,
                        executionTime: executionTimeMs,
                        error: false,
                        status: "AC"
                    });
                }
            });

            child.on('error', (err) => {
                if (isDone) return;
                clearTimeout(timer);
                isDone = true;
                resolve({
                    output: `Execution Error: ${err.message}`,
                    executionTime: 0,
                    error: true,
                    status: "RE"
                });
            });
        });

        // Cleanup files
        try {
            if (filePath && await fs.stat(filePath).catch(() => false)) await fs.unlink(filePath);

            // Clean up Java class files
            if (language === 'java') {
                // Java creates .class files, sometimes inner classes too. 
                // For simplicity, we assume the main class file matches logic.
                // We might need a better cleanup strategy for production.
                const classFile = filePath.replace('.java', '.class');
                if (await fs.stat(classFile).catch(() => false)) await fs.unlink(classFile);
            }
        } catch (cleanupErr) {
            console.error("Cleanup error", cleanupErr);
        }

        return result;

    } catch (err) {
        return { output: err.message, executionTime: 0, error: true };
    }
};

module.exports = { executeCode };
