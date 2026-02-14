module.exports = {
    id: 'two-sum',
    testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ],
    validator: (result, expected) => {
        if (!Array.isArray(result) || result.length !== 2) return false;
        return (result[0] === expected[0] && result[1] === expected[1]) ||
            (result[0] === expected[1] && result[1] === expected[0]);
    }
};
