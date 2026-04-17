
const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, submitSolution, getSubmissions, getRecentActivity } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/activity', getRecentActivity);
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/:id/submit', protect, submitSolution);
router.get('/:id/submissions', protect, getSubmissions);

module.exports = router;
