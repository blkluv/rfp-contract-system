const express = require('express');
const { body, query } = require('express-validator');
const {
  createRFP,
  getRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  publishRFP
} = require('../controllers/rfpController');
const { auth, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/rfps:
 *   post:
 *     summary: Create a new RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: Website Development Project
 *               description:
 *                 type: string
 *                 example: We need a modern, responsive website for our company
 *               category:
 *                 type: string
 *                 example: Web Development
 *               budget:
 *                 type: number
 *                 format: decimal
 *                 example: 50000.00
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *                 example: USD
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Responsive design", "SEO optimized", "Mobile friendly"]
 *               evaluationCriteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Technical expertise", "Portfolio quality", "Timeline"]
 *               submissionInstructions:
 *                 type: string
 *                 example: Please submit your proposal with portfolio samples
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: contact@company.com
 *     responses:
 *       201:
 *         description: RFP created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RFP created successfully
 *                 rfp:
 *                   $ref: '#/components/schemas/RFP'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Only buyers can create RFPs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', [
  auth,
  requireRole(['buyer']),
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('budget').optional().isDecimal(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('deadline').isISO8601(),
  body('requirements').optional().isArray(),
  body('evaluationCriteria').optional().isArray(),
  body('submissionInstructions').optional().trim(),
  body('contactEmail').optional().isEmail(),
  handleValidationErrors
], createRFP);

/**
 * @swagger
 * /api/rfps:
 *   get:
 *     summary: Get RFPs with filtering and pagination
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, response_submitted, under_review, approved, rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: RFPs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rfps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RFP'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().isIn(['draft', 'published', 'response_submitted', 'under_review', 'approved', 'rejected']),
  handleValidationErrors
], getRFPs);

// Get RFP by ID
router.get('/:id', auth, getRFPById);

// Update RFP (Buyers only)
router.put('/:id', [
  auth,
  requireRole(['buyer']),
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('budget').optional().isDecimal(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('deadline').optional().isISO8601(),
  body('requirements').optional().isArray(),
  body('evaluationCriteria').optional().isArray(),
  body('submissionInstructions').optional().trim(),
  body('contactEmail').optional().isEmail(),
  body('status').optional().isIn(['draft', 'published', 'response_submitted', 'under_review', 'approved', 'rejected']),
  handleValidationErrors
], updateRFP);

// Delete RFP (Buyers only)
router.delete('/:id', [
  auth,
  requireRole(['buyer'])
], deleteRFP);

// Publish RFP (Buyers only)
router.post('/:id/publish', [
  auth,
  requireRole(['buyer'])
], publishRFP);

module.exports = router;

