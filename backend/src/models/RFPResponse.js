const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RFPResponse = sequelize.define('RFPResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  proposal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  proposedBudget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  timeline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'submitted'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  evaluationScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  evaluationComments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rfpId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'RFPs',
      key: 'id'
    }
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = RFPResponse;

