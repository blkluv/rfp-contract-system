const sequelize = require('../config/database');

// Import models - these are already defined with sequelize.define
const User = require('./User');
const RFP = require('./RFP');
const RFPResponse = require('./RFPResponse');
const Document = require('./Document');
const AuditLog = require('./AuditLog');

// Define associations
// User associations
User.hasMany(RFP, { foreignKey: 'buyerId', as: 'rfps' });
User.hasMany(RFPResponse, { foreignKey: 'supplierId', as: 'responses' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// RFP associations
RFP.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
RFP.hasMany(RFPResponse, { foreignKey: 'rfpId', as: 'responses' });
RFP.hasMany(Document, { foreignKey: 'rfpId', as: 'documents' });

// RFPResponse associations
RFPResponse.belongsTo(RFP, { foreignKey: 'rfpId', as: 'rfp' });
RFPResponse.belongsTo(User, { foreignKey: 'supplierId', as: 'supplier' });
RFPResponse.hasMany(Document, { foreignKey: 'responseId', as: 'documents' });

// Document associations
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(RFP, { foreignKey: 'rfpId', as: 'rfp' });
Document.belongsTo(RFPResponse, { foreignKey: 'responseId', as: 'response' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  RFP,
  RFPResponse,
  Document,
  AuditLog
};
