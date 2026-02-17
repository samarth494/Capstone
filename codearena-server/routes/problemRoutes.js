const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, submitProblem, getSubmissions, seedProblems } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.get('/:id/submissions', protect, getSubmissions);
router.post('/:id/submit', protect, submitProblem);
router.post('/seed', seedProblems); // Endpoint to seed initial problems

module.exports = router;
