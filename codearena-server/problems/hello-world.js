module.exports = {
    id: 'hello-world',
    testCases: [
        { input: {}, expected: "Hello World" }
    ],
    validator: (result, expected) => {
        return result === expected;
    }
};
