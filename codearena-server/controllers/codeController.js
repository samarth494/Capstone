const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a temp directory for code files
const TEMP_DIR = path.join(os.tmpdir(), 'codearena_temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper: generate a unique file name
const generateFileName = () => `code_${Date.now()}_${Math.random().toString(36).substring(7)}`;

// Helper: clean up temp files
const cleanupFiles = (...files) => {
    files.forEach(f => {
        try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
    });
};

// Helper: execute a command with timeout
const executeCommand = (cmd, timeout = 10000, input = '') => {
    return new Promise((resolve) => {
        const child = exec(cmd, { timeout, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
        if (input && child.stdin) {
            child.stdin.write(input);
            child.stdin.end();
        }
    });
};

// Compile and run C code
const runCCode = async (code, input = '') => {
    const fileName = generateFileName();
    const srcFile = path.join(TEMP_DIR, `${fileName}.c`);
    const exeFile = path.join(TEMP_DIR, `${fileName}.exe`);

    try {
        fs.writeFileSync(srcFile, code);

        // Compile
        const compileResult = await executeCommand(`gcc "${srcFile}" -o "${exeFile}" 2>&1`, 15000);

        if (compileResult.error || (compileResult.stderr && compileResult.stderr.includes('error'))) {
            const errorMsg = compileResult.stdout || compileResult.stderr || compileResult.error?.message || 'Unknown compilation error';
            cleanupFiles(srcFile, exeFile);
            return {
                success: false,
                compilationError: true,
                output: errorMsg.replace(new RegExp(srcFile.replace(/\\/g, '\\\\'), 'g'), 'solution.c'),
                executionTime: '0.00s'
            };
        }

        // Run
        const startTime = Date.now();
        const runResult = await executeCommand(`"${exeFile}"`, 10000, input);
        const execTime = ((Date.now() - startTime) / 1000).toFixed(3);

        cleanupFiles(srcFile, exeFile);

        if (runResult.error) {
            // Runtime error
            const errorMsg = runResult.stderr || runResult.error.message || 'Runtime error';
            return {
                success: false,
                compilationError: false,
                output: errorMsg,
                executionTime: `${execTime}s`
            };
        }

        return {
            success: true,
            output: (runResult.stdout || '').trim(),
            executionTime: `${execTime}s`
        };

    } catch (err) {
        cleanupFiles(srcFile, exeFile);
        return {
            success: false,
            compilationError: false,
            output: err.message,
            executionTime: '0.00s'
        };
    }
};

// Compile and run C++ code
const runCppCode = async (code, input = '') => {
    const fileName = generateFileName();
    const srcFile = path.join(TEMP_DIR, `${fileName}.cpp`);
    const exeFile = path.join(TEMP_DIR, `${fileName}.exe`);

    try {
        fs.writeFileSync(srcFile, code);

        // Compile
        const compileResult = await executeCommand(`g++ "${srcFile}" -o "${exeFile}" 2>&1`, 15000);

        if (compileResult.error || (compileResult.stderr && compileResult.stderr.includes('error'))) {
            const errorMsg = compileResult.stdout || compileResult.stderr || compileResult.error?.message || 'Unknown compilation error';
            cleanupFiles(srcFile, exeFile);
            return {
                success: false,
                compilationError: true,
                output: errorMsg.replace(new RegExp(srcFile.replace(/\\/g, '\\\\'), 'g'), 'solution.cpp'),
                executionTime: '0.00s'
            };
        }

        // Run
        const startTime = Date.now();
        const runResult = await executeCommand(`"${exeFile}"`, 10000, input);
        const execTime = ((Date.now() - startTime) / 1000).toFixed(3);

        cleanupFiles(srcFile, exeFile);

        if (runResult.error) {
            const errorMsg = runResult.stderr || runResult.error.message || 'Runtime error';
            return {
                success: false,
                compilationError: false,
                output: errorMsg,
                executionTime: `${execTime}s`
            };
        }

        return {
            success: true,
            output: (runResult.stdout || '').trim(),
            executionTime: `${execTime}s`
        };

    } catch (err) {
        cleanupFiles(srcFile, exeFile);
        return {
            success: false,
            compilationError: false,
            output: err.message,
            executionTime: '0.00s'
        };
    }
};

// Run JavaScript code
const runJsCode = async (code, input = '') => {
    const fileName = generateFileName();
    const srcFile = path.join(TEMP_DIR, `${fileName}.js`);

    try {
        fs.writeFileSync(srcFile, code);

        const startTime = Date.now();
        const runResult = await executeCommand(`node "${srcFile}"`, 10000, input);
        const execTime = ((Date.now() - startTime) / 1000).toFixed(3);

        cleanupFiles(srcFile);

        if (runResult.error) {
            const errorMsg = (runResult.stderr || runResult.error.message || 'Runtime error')
                .replace(new RegExp(srcFile.replace(/\\/g, '\\\\'), 'g'), 'solution.js');
            return {
                success: false,
                compilationError: true,
                output: errorMsg,
                executionTime: `${execTime}s`
            };
        }

        return {
            success: true,
            output: (runResult.stdout || '').trim(),
            executionTime: `${execTime}s`
        };

    } catch (err) {
        cleanupFiles(srcFile);
        return {
            success: false,
            compilationError: false,
            output: err.message,
            executionTime: '0.00s'
        };
    }
};

// @desc    Run code (actual compilation and execution)
// @route   POST /api/code/run
// @access  Private
const runCode = async (req, res) => {
    const { code, language, input } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            message: 'No code provided'
        });
    }

    try {
        let result;

        switch (language) {
            case 'c':
                result = await runCCode(code, input || '');
                break;
            case 'cpp':
                result = await runCppCode(code, input || '');
                break;
            case 'javascript':
            default:
                result = await runJsCode(code, input || '');
                break;
        }

        res.status(200).json({
            success: result.success,
            output: result.output,
            executionTime: result.executionTime,
            compilationError: result.compilationError || false
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

// @desc    Submit code for blind coding (runs against test cases)
// @route   POST /api/code/submit
// @access  Private
const submitCode = async (req, res) => {
    const { code, language, problemId, input } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            message: 'No code provided'
        });
    }

    try {
        // Load test cases for the problem
        let testCases = [];
        try {
            const problemFile = require(`../problems/${problemId || 'even-odd-digit-sum'}`);
            testCases = problemFile.testCases || [];
        } catch (e) {
            // Default test cases if problem file not found
            testCases = [
                { input: '12', expectedOutput: 'Even, Sum: 3' },
                { input: '15', expectedOutput: 'Odd, Sum: 6' },
                { input: '0', expectedOutput: 'Even, Sum: 0' },
                { input: '7', expectedOutput: 'Odd, Sum: 7' },
                { input: '100', expectedOutput: 'Even, Sum: 1' },
            ];
        }

        // First, do a quick compilation check without running test cases
        let compileCheck;
        switch (language) {
            case 'c':
                compileCheck = await runCCode(code, '0');
                break;
            case 'cpp':
                compileCheck = await runCppCode(code, '0');
                break;
            case 'javascript':
            default:
                compileCheck = await runJsCode(code, '0');
                break;
        }

        // If compilation itself fails, return immediately
        if (!compileCheck.success && compileCheck.compilationError) {
            return res.status(200).json({
                success: false,
                compilationError: true,
                output: compileCheck.output,
                executionTime: compileCheck.executionTime,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                score: 0,
                message: 'Compilation Error'
            });
        }

        // Run against each test case
        const results = [];
        let passedCount = 0;

        for (const tc of testCases) {
            let tcResult;
            switch (language) {
                case 'c':
                    tcResult = await runCCode(code, tc.input + '\n');
                    break;
                case 'cpp':
                    tcResult = await runCppCode(code, tc.input + '\n');
                    break;
                case 'javascript':
                default:
                    tcResult = await runJsCode(code, tc.input + '\n');
                    break;
            }

            // Compare output (trim and normalize)
            const actualOutput = (tcResult.output || '').trim();
            const expectedOutput = (tc.expectedOutput || '').trim();
            const passed = tcResult.success && actualOutput === expectedOutput;

            if (passed) passedCount++;

            results.push({
                input: tc.input,
                expectedOutput: expectedOutput,
                actualOutput: actualOutput,
                passed: passed,
                executionTime: tcResult.executionTime,
                error: tcResult.success ? null : tcResult.output
            });
        }

        const totalTests = testCases.length;
        const allPassed = passedCount === totalTests;
        const score = Math.round((passedCount / totalTests) * 100);

        res.status(200).json({
            success: allPassed,
            compilationError: false,
            testCasesPassed: passedCount,
            totalTestCases: totalTests,
            score: score,
            results: results,
            executionTime: compileCheck.executionTime,
            message: allPassed ? 'All test cases passed!' : `${passedCount}/${totalTests} test cases passed.`,
            output: allPassed
                ? `All ${totalTests} test cases passed!`
                : `Failed: ${totalTests - passedCount} test case(s)\n\n` +
                results.filter(r => !r.passed).map((r, i) =>
                    `Test Case: Input="${r.input}"\nExpected: "${r.expectedOutput}"\nGot:      "${r.actualOutput}"${r.error ? `\nError: ${r.error}` : ''}`
                ).join('\n\n')
        });

    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during submission',
            error: error.message
        });
    }
};

module.exports = {
    runCode,
    submitCode
};
