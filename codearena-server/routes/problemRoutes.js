<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, submitProblem, getSubmissions, seedProblems } = require('../controllers/problemController');
=======

const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, submitSolution, getSubmissions } = require('../controllers/problemController');
>>>>>>> singleplayer
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProblems);
router.get('/:id', getProblemById);
<<<<<<< HEAD
router.get('/:id/submissions', protect, getSubmissions);
router.post('/:id/submit', protect, submitProblem);
router.post('/seed', seedProblems); // Endpoint to seed initial problems
=======
router.post('/:id/submit', protect, submitSolution);
router.get('/:id/submissions', protect, getSubmissions);
>>>>>>> singleplayer

module.exports = router;
