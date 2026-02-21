const { exec } = require('child_process');
const path = require('path');

/**
 * Docker Test Runner
 * Executes test.py inside a python:3.10 Docker container.
 * Handles Windows path escaping for Docker volume mounts.
 */

const runDockerTest = () => {
    return new Promise((resolve, reject) => {
        // Step 1: Build the absolute path to sandbox/temp
        // process.cwd() returns the current working directory (where node was run from)
        // __dirname is more reliable — it is always the directory of THIS script
        const tempPath = path.join(__dirname, 'temp');

        // Step 2: Fix Windows path for Docker
        // Docker on Windows requires forward slashes in volume mount paths.
        // e.g. C:\Users\foo → C:/Users/foo
        const dockerPath = tempPath.replace(/\\/g, '/');

        // Step 3: Construct the Docker command
        const command = `docker run --rm -v "${dockerPath}:/app" python:3.10 python /app/test.py`;

        console.log('--- Docker Test Runner ---');
        console.log(`MOUNT:   ${dockerPath}:/app`);
        console.log(`COMMAND: ${command}`);
        console.log('--------------------------');

        const startTime = Date.now();

        // Step 4: Execute with child_process.exec
        exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            const duration = Date.now() - startTime;

            if (error) {
                // Step 5a: Docker/runtime error
                console.error(`\nERROR (after ${duration}ms):`);
                console.error(stderr || error.message);
                return reject(new Error(stderr || error.message));
            }

            // Step 5b: Success
            console.log(`\nOUTPUT (executed in ${duration}ms):`);
            console.log(stdout.trim());

            if (stderr.trim()) {
                console.warn(`WARNINGS:\n${stderr.trim()}`);
            }

            resolve({ stdout, stderr, duration });
        });
    });
};

// Entry point — run immediately
runDockerTest()
    .then(() => {
        console.log('\n✅ Docker sandbox test passed.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Docker sandbox test failed:', err.message);
        process.exit(1);
    });
