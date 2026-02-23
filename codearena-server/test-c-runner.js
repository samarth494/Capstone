const cRunner = require('./sandbox/runners/cRunner');

const code = `
#include <stdio.h>
int main() { return 0; }
int main() { return 0; }
`;
const input = "4";

async function test() {
    console.log("Starting C test with DOUBLE MAIN...");
    const result = await cRunner.run('c', code, input, 'test-job-double-main');
    console.log("Result:", JSON.stringify(result, null, 2));
}

test();
