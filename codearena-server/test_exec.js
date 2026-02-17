const { executeCode } = require('./utils/executor');

async function test() {
    console.log("Testing JS execution...");
    const jsCode = "console.log('Hello JS');";
    const resJS = await executeCode('javascript', jsCode, '');
    console.log("JS Result:", resJS);

    console.log("Testing Python execution...");
    const pyCode = "print('Hello Python')";
    const resPy = await executeCode('python', pyCode, '');
    console.log("Python Result:", resPy);
}

test().catch(err => console.error("Test failed:", err));
