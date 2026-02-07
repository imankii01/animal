/**
 * Buyer Routes
 */

const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');

/**
 * POST /api/buyers
 * Create a new buyer
 */
router.post('/', buyerController.createBuyer);

/**
 * GET /api/buyers
 * Get all buyers
 */
router.get('/', buyerController.getBuyers);

/**
 * GET /api/buyers/nearby
 * Get nearby buyers (geospatial query)
 */
router.get('/nearby', buyerController.getNearbyBuyers);

/**
 * GET /api/buyers/:id
 * Get a single buyer
 */
router.get('/:id', buyerController.getBuyerById);

/**
 * PATCH /api/buyers/:id
 * Update a buyer
 */
router.patch('/:id', buyerController.updateBuyer);

/**
 * DELETE /api/buyers/:id
 * Delete a buyer
 */
router.delete('/:id', buyerController.deleteBuyer);

/**
 * POST /api/buyers/:id/review
 * Add review for a buyer
 */
router.post('/:id/review', buyerController.addReview);

module.exports = router;
