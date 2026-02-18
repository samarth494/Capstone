const runner = require('../utils/runner');

const runCode = async (req, res) => {
    const { language, code, input } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Code is required' });
    }

    try {
        const result = await runner.runCode(language, code, input);

        // If process exited with non-zero and there's stderr, it's an error
        if (result.exitCode !== 0 && result.stderr) {
            return res.status(200).json({
                success: false,
                output: result.stderr,
                executionTime: `${result.executionTime}ms`
            });
        }

        // Combine output — some runtimes may print warnings to stderr
        let output = result.stdout;
        if (result.stderr && result.exitCode === 0) {
            output += '\n[stderr]: ' + result.stderr;
        }

        res.json({
            success: true,
            output: output,
            executionTime: `${result.executionTime}ms`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { runCode };
