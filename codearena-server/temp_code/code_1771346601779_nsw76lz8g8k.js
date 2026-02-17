
function solve(input) {
    const [a, b] = input.split(' ').map(Number);
    return a + b;
}

const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    // Check if input is empty string which might break split/map logic for some problems
    const result = solve(input);
    console.log(result);
} catch (e) {
    console.error(e);
}
            