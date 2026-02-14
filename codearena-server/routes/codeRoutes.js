const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/codeController');

// @route   POST /api/code/run
router.post('/run', runCode);

module.exports = router;
