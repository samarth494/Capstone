const express = require('express');
const router = express.Router();
const { runCode, submitCode } = require('../controllers/codeController');

// @route   POST /api/code/run
router.post('/run', runCode);

// @route   POST /api/code/submit
router.post('/submit', submitCode);

module.exports = router;
