const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

/**
 * @route   POST /api/sessions
 * @desc    Create a new milking session
 * @access  Public
 */
router.post('/', sessionController.createSession);

/**
 * @route   GET /api/sessions
 * @desc    Get all milking sessions (with pagination & sorting)
 * @access  Public
 * @query   sortBy (default: -created_at), limit, skip
 */
router.get('/', sessionController.getAllSessions);

/**
 * @route   GET /api/sessions/stats/overview
 * @desc    Get session statistics
 * @access  Public
 */
router.get('/stats/overview', sessionController.getSessionStats);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a single milking session by ID
 * @access  Public
 */
router.get('/:id', sessionController.getSessionById);

/**
 * @route   PATCH /api/sessions/:id
 * @desc    Update a milking session
 * @access  Public
 */
router.patch('/:id', sessionController.updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete a milking session
 * @access  Public
 */
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
