/**
 * BaseRunner
 * Responsibility: Define the interface for all code execution types (Local, Docker, etc.)
 */
class BaseRunner {
    async run(language, code, input) {
        throw new Error("Method 'run()' must be implemented.");
    }

    async cleanup() {
        // Implementation for cleaning up temp files/containers
    }
}

module.exports = BaseRunner;
