/**
 * Milk Sales Routes
 */

const express = require('express');
const router = express.Router();
const milkSalesController = require('../controllers/milkSalesController');

/**
 * POST /api/milk-sales
 * Create a new milk sale
 */
router.post('/', milkSalesController.createMilkSale);

/**
 * GET /api/milk-sales
 * Get all milk sales with filters
 */
router.get('/', milkSalesController.getMilkSales);

/**
 * GET /api/milk-sales/stats/overview
 * Get milk sales statistics
 */
router.get('/stats/overview', milkSalesController.getSalesStats);

/**
 * GET /api/milk-sales/:id
 * Get a single milk sale
 */
router.get('/:id', milkSalesController.getMilkSaleById);

/**
 * PATCH /api/milk-sales/:id
 * Update a milk sale
 */
router.patch('/:id', milkSalesController.updateMilkSale);

/**
 * DELETE /api/milk-sales/:id
 * Delete a milk sale
 */
router.delete('/:id', milkSalesController.deleteMilkSale);

module.exports = router;
