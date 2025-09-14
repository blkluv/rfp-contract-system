const { AuditLog } = require('../models');

class AuditService {
  async logAction(userId, action, entityType, entityId, oldValues = null, newValues = null, req = null, metadata = null) {
    try {
      const auditData = {
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        metadata
      };

      if (req) {
        auditData.ipAddress = req.ip || req.connection.remoteAddress;
        auditData.userAgent = req.get('User-Agent');
      }

      await AuditLog.create(auditData);
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // User actions
  async logUserLogin(userId, req) {
    await this.logAction(userId, 'LOGIN', 'User', userId, null, null, req);
  }

  async logUserLogout(userId, req) {
    await this.logAction(userId, 'LOGOUT', 'User', userId, null, null, req);
  }

  async logUserRegistration(userId, userData, req) {
    await this.logAction(userId, 'REGISTER', 'User', userId, null, userData, req);
  }

  async logUserProfileUpdate(userId, oldData, newData, req) {
    await this.logAction(userId, 'UPDATE_PROFILE', 'User', userId, oldData, newData, req);
  }

  // RFP actions
  async logRFPCreate(userId, rfpId, rfpData, req) {
    await this.logAction(userId, 'CREATE_RFP', 'RFP', rfpId, null, rfpData, req);
  }

  async logRFPUpdate(userId, rfpId, oldData, newData, req) {
    await this.logAction(userId, 'UPDATE_RFP', 'RFP', rfpId, oldData, newData, req);
  }

  async logRFPDelete(userId, rfpId, rfpData, req) {
    await this.logAction(userId, 'DELETE_RFP', 'RFP', rfpId, rfpData, null, req);
  }

  async logRFPPublish(userId, rfpId, rfpData, req) {
    await this.logAction(userId, 'PUBLISH_RFP', 'RFP', rfpId, null, rfpData, req);
  }

  // Response actions
  async logResponseCreate(userId, responseId, responseData, req) {
    await this.logAction(userId, 'CREATE_RESPONSE', 'RFPResponse', responseId, null, responseData, req);
  }

  async logResponseUpdate(userId, responseId, oldData, newData, req) {
    await this.logAction(userId, 'UPDATE_RESPONSE', 'RFPResponse', responseId, oldData, newData, req);
  }

  async logResponseReview(userId, responseId, oldData, newData, req) {
    await this.logAction(userId, 'REVIEW_RESPONSE', 'RFPResponse', responseId, oldData, newData, req);
  }

  // File actions
  async logFileUpload(userId, fileId, fileData, req) {
    await this.logAction(userId, 'UPLOAD_FILE', 'Document', fileId, null, fileData, req);
  }

  async logFileDelete(userId, fileId, fileData, req) {
    await this.logAction(userId, 'DELETE_FILE', 'Document', fileId, fileData, null, req);
  }

  // Search actions
  async logSearch(userId, searchQuery, searchType, resultsCount, req) {
    await this.logAction(userId, 'SEARCH', 'Search', null, null, {
      query: searchQuery,
      type: searchType,
      resultsCount
    }, req);
  }

  // Get audit logs
  async getAuditLogs(filters = {}) {
    const { userId, entityType, entityId, action, startDate, endDate, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (userId) whereClause.userId = userId;
    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (action) whereClause.action = action;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[require('sequelize').Op.lte] = new Date(endDate);
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    return {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  // Get user activity summary
  async getUserActivitySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await AuditLog.findAll({
      where: {
        userId,
        createdAt: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      attributes: [
        'action',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['action'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    return activities;
  }

  // Get system statistics
  async getSystemStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await AuditLog.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      attributes: [
        'entityType',
        'action',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['entityType', 'action'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    return stats;
  }
}

module.exports = new AuditService();
