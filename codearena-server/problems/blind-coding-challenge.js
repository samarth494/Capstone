/**
 * blind-coding-challenge.js — Blind Coding Competition problem
 * Language: C only. Users cannot see their code while typing.
 * Task: Print exactly "Hello, World!" to stdout.
 */
module.exports = {
    id: 'blind-coding-challenge',
    title: 'Blind Coding Challenge',
    testCases: [
        { input: '', expected: 'Hello, World!' }
    ],
    validator: (actual, expected) => actual.trim() === expected.trim()
};
