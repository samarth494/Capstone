const http = require('http');

async function testSubmission() {
    // 1. Register/Login
    console.log("Registering user...");
    const user = { username: "tester_" + Date.now(), email: "test" + Date.now() + "@test.com", password: "password123" };

    // Helper fetch since node 18+ has fetch
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("Login failed:", loginData);
        return;
    }
    const token = loginData.token;
    console.log("Got Token:", token.substring(0, 10) + "...");

    // 2. Get Problem ID
    console.log("Fetching problems...");
    const probRes = await fetch('http://127.0.0.1:5000/api/problems');
    const probs = await probRes.json();
    if (!probs.length) {
        console.error("No problems found");
        return;
    }
    const problemId = probs[0]._id;
    console.log("Problem ID:", problemId);

    // 3. Submit Solution
    console.log("Submitting solution...");
    const code = `
function solve(input) {
    const [a, b] = input.split(' ').map(Number);
    return a + b;
}`;

    const submitRes = await fetch(`http://127.0.0.1:5000/api/problems/${problemId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, language: 'javascript' })
    });

    console.log("Submit Status:", submitRes.status);
    const submitData = await submitRes.json();
    console.log("Submit Result:", submitData);
}

testSubmission().catch(console.error);
