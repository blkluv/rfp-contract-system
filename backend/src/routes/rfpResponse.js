const express = require('express');
const { body, query } = require('express-validator');
const {
  createResponse,
  getResponses,
  getResponseById,
  updateResponse,
  reviewResponse
} = require('../controllers/rfpResponseController');
const { auth, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Create response (Suppliers only)
router.post('/', [
  auth,
  requireRole(['supplier']),
  body('rfpId').isUUID(),
  body('proposal').notEmpty().trim(),
  body('proposedBudget').optional().isDecimal(),
  body('timeline').optional().trim(),
  body('notes').optional().trim(),
  handleValidationErrors
], createResponse);

// Get responses
router.get('/', [
  auth,
  query('rfpId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['submitted', 'under_review', 'approved', 'rejected']),
  handleValidationErrors
], getResponses);

// Get response by ID
router.get('/:id', auth, getResponseById);

// Update response (Suppliers only)
router.put('/:id', [
  auth,
  requireRole(['supplier']),
  body('proposal').optional().trim(),
  body('proposedBudget').optional().isDecimal(),
  body('timeline').optional().trim(),
  body('notes').optional().trim(),
  handleValidationErrors
], updateResponse);

// Review response (Buyers only)
router.put('/:id/review', [
  auth,
  requireRole(['buyer']),
  body('status').isIn(['approved', 'rejected']),
  body('evaluationScore').optional().isInt({ min: 0, max: 100 }),
  body('evaluationComments').optional().trim(),
  handleValidationErrors
], reviewResponse);

module.exports = router;

