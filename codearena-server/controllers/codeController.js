const { executeCode } = require('../utils/executor');

// @desc    Run code
// @route   POST /api/code/run
// @access  Private (or Public for now)
const runCode = async (req, res) => {
    const { code, language, input } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'No code provided'
        });
    }

    try {
        let wrappedCode = code;

        // Auto-wrap for JavaScript
        // Check if 'solve' function is defined.
        // We wrap if we see 'function solve' and likely no manual invocation (heuristically)
        // or just basic detection that it's a function submission.
        // The previous check failed because 'function solve(input)' contains 'solve('.

        const hasSolveDefJS = code.includes('function solve');
        const hasSolveDefPy = code.includes('def solve');
        const solveCalls = (code.match(/solve\s*\(/g) || []).length;

        // If defined, and appears effectively once (definition only), or if we just want to be helpful:
        // We'll proceed if it's defined and we don't see obvious manual stdin reading.

        if (language === 'javascript' && hasSolveDefJS && !code.includes('readFileSync')) {
            wrappedCode += `\n
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    const result = solve(input);
    console.log(result);
} catch (e) {
    console.error(e);
}
            `;
        }
        // Auto-wrap for Python
        else if (language === 'python' && hasSolveDefPy && !code.includes('sys.stdin')) {
            wrappedCode += `\n
import sys
try:
    input_data = sys.stdin.read().strip()
    print(solve(input_data))
except Exception as e:
    print(e)
            `;
        }

        const { output, error, executionTime } = await executeCode(language, wrappedCode, input);

        if (error) {
            return res.status(200).json({
                success: false,
                message: output // Send error message here
            });
        }

        res.status(200).json({
            success: true,
            output: output,
            executionTime: `${executionTime}ms`,
        });

    } catch (error) {
        console.error('Code execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during execution',
            error: error.message
        });
    }
};

module.exports = {
    runCode
};
