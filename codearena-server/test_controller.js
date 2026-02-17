const { executeCode } = require('./utils/executor');

async function testController() {
    console.log("Starting Controller Test...");

    const language = 'javascript';
    const code = `
function solve(input) {
    const [a, b] = input.split(' ').map(Number);
    return a + b;
}`;

    // Simulate Wrapper Logic
    let wrappedCode = code;
    const hasSolveDefJS = code.includes('function solve');

    if (language === 'javascript' && hasSolveDefJS && !code.includes('process.stdin')) {
        wrappedCode += `\n
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    // Check if input is empty string which might break split/map logic for some problems
    const result = solve(input);
    console.log(result);
} catch (e) {
    console.error(e);
}
        `;
    }

    console.log("Wrapped Code:", wrappedCode);

    // Simulate Test Cases
    const testCases = [
        { input: "3 4", output: "7" },
        { input: "10 20", output: "30" }
    ];

    for (const testCase of testCases) {
        console.log(`Executing case: ${testCase.input}`);
        const result = await executeCode(language, wrappedCode, testCase.input);
        console.log("Result:", result);
    }

    console.log("Controller Test Complete");
}

testController().catch(err => console.error("Controller Test Failed:", err));
