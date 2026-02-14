// @desc    Run code (Simulation)
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
        // Simulate code execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic mock logic based on input presence
        // In a real scenario, this would send code to a Docker container or sandboxed environment

        let output = '';
        const inputStr = input ? input.toString() : '';

        // Simple mock response logic
        if (code.includes('console.log')) {
            // Extract what's inside console.log for a fake echo effect
            const match = code.match(/console\.log\((.*)\)/);
            output = match ? `> ${match[1].replace(/['"]/g, '')}` : 'Hello World';
        } else if (inputStr) {
            output = `Process finished.\nInput received: ${inputStr}\nCalculated result: 42`;
        } else {
            output = 'Process finished with exit code 0\nResult: undefined';
        }


        // Simulate occasional runtime error
        if (code.includes('error')) {
            return res.status(200).json({
                success: false,
                output: 'ReferenceError: x is not defined\n    at Object.<anonymous> (script.js:3:5)',
                executionTime: '0.04s',
            });
        }

        res.status(200).json({
            success: true,
            output: output,
            executionTime: '0.012s',
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
