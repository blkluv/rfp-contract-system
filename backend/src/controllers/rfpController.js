const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { RFP, RFPResponse, User, Document } = require('../models');
const { sendRFPNotification, sendStatusUpdateNotification } = require('../utils/email');
const socketService = require('../services/socketService');

const createRFP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      budget,
      currency,
      deadline,
      requirements,
      evaluationCriteria,
      submissionInstructions,
      contactEmail
    } = req.body;

    const rfp = await RFP.create({
      title,
      description,
      category,
      budget,
      currency,
      deadline,
      requirements,
      evaluationCriteria,
      submissionInstructions,
      contactEmail,
      buyerId: req.user.id
    });

    res.status(201).json({
      message: 'RFP created successfully',
      rfp
    });
  } catch (error) {
    console.error('Create RFP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRFPs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, role } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // If user is supplier, only show published RFPs
    if (role === 'supplier') {
      whereClause.isPublic = true;
      whereClause.status = 'published';
    } else if (role === 'buyer') {
      // If user is buyer, show their own RFPs
      whereClause.buyerId = req.user.id;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: rfps } = await RFP.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'company']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      rfps,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get RFPs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRFPById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfp = await RFP.findByPk(id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'company', 'email']
        },
        {
          model: Document,
          as: 'documents',
          where: { isLatest: true },
          required: false
        }
      ]
    });

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    // Check if user has access to this RFP
    if (req.user.role === 'supplier') {
      // Suppliers can access published RFPs or RFPs they have responded to
      const hasResponded = await RFPResponse.findOne({
        where: {
          rfpId: rfp.id,
          supplierId: req.user.id
        }
      });
      
      if (!rfp.isPublic || rfp.status !== 'published') {
        if (!hasResponded) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    if (req.user.role === 'buyer' && rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ rfp });
  } catch (error) {
    console.error('Get RFP by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRFP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    if (rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      category,
      budget,
      currency,
      deadline,
      requirements,
      evaluationCriteria,
      submissionInstructions,
      contactEmail,
      status
    } = req.body;

    const updateData = {
      title: title || rfp.title,
      description: description || rfp.description,
      category: category || rfp.category,
      budget: budget !== undefined ? budget : rfp.budget,
      currency: currency || rfp.currency,
      deadline: deadline || rfp.deadline,
      requirements: requirements || rfp.requirements,
      evaluationCriteria: evaluationCriteria || rfp.evaluationCriteria,
      submissionInstructions: submissionInstructions || rfp.submissionInstructions,
      contactEmail: contactEmail || rfp.contactEmail
    };

    // Handle status change
    if (status && status !== rfp.status) {
      updateData.status = status;
      
      if (status === 'published' && !rfp.isPublic) {
        updateData.isPublic = true;
        updateData.publishedAt = new Date();
        
        // Notify suppliers about new RFP
        const suppliers = await User.findAll({
          where: { role: 'supplier', isActive: true }
        });
        
        if (suppliers.length > 0) {
          try {
            await sendRFPNotification(suppliers, { ...rfp, ...updateData });
          } catch (emailError) {
            console.error('Error sending RFP notifications:', emailError);
          }
        }

        // WebSocket notification
        socketService.notifyRFPPublished({ ...rfp, ...updateData });
      }
    }

    await rfp.update(updateData);

    // WebSocket notification for RFP updates
    socketService.notifyRFPUpdated(rfp);

    res.json({
      message: 'RFP updated successfully',
      rfp
    });
  } catch (error) {
    console.error('Update RFP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    if (rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await rfp.destroy();

    res.json({ message: 'RFP deleted successfully' });
  } catch (error) {
    console.error('Delete RFP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const publishRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    if (rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (rfp.status !== 'draft') {
      return res.status(400).json({ message: 'RFP is not in draft status' });
    }

    await rfp.update({
      status: 'published',
      isPublic: true,
      publishedAt: new Date()
    });

    // Notify suppliers about new RFP
    const suppliers = await User.findAll({
      where: { role: 'supplier', isActive: true }
    });

    if (suppliers.length > 0) {
      try {
        await sendRFPNotification(suppliers, rfp);
      } catch (emailError) {
        console.error('Error sending RFP notifications:', emailError);
      }
    }

    res.json({
      message: 'RFP published successfully',
      rfp
    });
  } catch (error) {
    console.error('Publish RFP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRFP,
  getRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  publishRFP
};
