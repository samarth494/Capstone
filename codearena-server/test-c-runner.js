const cRunner = require('./sandbox/runners/cRunner');

const code = ` `;
const input = "4";

async function test() {
    console.log("Starting C test with SINGLE SPACE CODE...");
    const result = await cRunner.run('c', code, input, 'test-job-space');
    console.log("Result:", JSON.stringify(result, null, 2));
}

test();
