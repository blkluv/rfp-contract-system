const express = require('express');
const { query } = require('express-validator');
const { searchRFPs, searchResponses, searchDocuments, globalSearch } = require('../controllers/searchController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Search RFPs
router.get('/rfps', [
  auth,
  query('q').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().isIn(['draft', 'published', 'response_submitted', 'under_review', 'approved', 'rejected']),
  query('budgetMin').optional().isDecimal(),
  query('budgetMax').optional().isDecimal(),
  query('deadlineFrom').optional().isISO8601(),
  query('deadlineTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
], searchRFPs);

// Search responses
router.get('/responses', [
  auth,
  query('q').optional().trim(),
  query('status').optional().isIn(['submitted', 'under_review', 'approved', 'rejected']),
  query('rfpId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
], searchResponses);

// Search documents
router.get('/documents', [
  auth,
  query('q').optional().trim(),
  query('fileType').optional().isIn(['rfp_document', 'response_document', 'attachment']),
  query('rfpId').optional().isUUID(),
  query('responseId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
], searchDocuments);

// Global search
router.get('/', [
  auth,
  query('q').notEmpty().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
], globalSearch);

module.exports = router;

