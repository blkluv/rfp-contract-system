const express = require('express');
const { query } = require('express-validator');
const { getAuditLogs, getUserActivitySummary, getSystemStats } = require('../services/auditService');
const { auth, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get audit logs (Admin only)
router.get('/logs', [
  auth,
  requireRole(['buyer']), // Only buyers can view audit logs for now
  query('userId').optional().isUUID(),
  query('entityType').optional().isIn(['User', 'RFP', 'RFPResponse', 'Document', 'Search']),
  query('entityId').optional().isUUID(),
  query('action').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      action: req.query.action,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await getAuditLogs(filters);
    res.json(result);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activity summary
router.get('/user-activity/:userId', [
  auth,
  query('days').optional().isInt({ min: 1, max: 365 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Check if user can view this activity
    if (req.user.role !== 'buyer' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activities = await getUserActivitySummary(userId, days);
    res.json({ activities });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics (Admin only)
router.get('/stats', [
  auth,
  requireRole(['buyer']), // Only buyers can view system stats for now
  query('days').optional().isInt({ min: 1, max: 365 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await getSystemStats(days);
    res.json({ stats });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

