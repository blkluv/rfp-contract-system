const { validationResult } = require('express-validator');
const { RFP, RFPResponse, User, Document } = require('../models');
const { sendResponseNotification, sendStatusUpdateNotification } = require('../utils/email');
const socketService = require('../services/socketService');

const createResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rfpId, proposal, proposedBudget, timeline, notes } = req.body;

    // Check if RFP exists and is published
    const rfp = await RFP.findByPk(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    if (!rfp.isPublic || rfp.status !== 'published') {
      return res.status(400).json({ message: 'RFP is not available for responses' });
    }

    // Check if deadline has passed
    if (new Date() > new Date(rfp.deadline)) {
      return res.status(400).json({ message: 'RFP deadline has passed' });
    }

    // Check if user already submitted a response
    const existingResponse = await RFPResponse.findOne({
      where: { rfpId, supplierId: req.user.id }
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted a response for this RFP' });
    }

    const response = await RFPResponse.create({
      rfpId,
      supplierId: req.user.id,
      proposal,
      proposedBudget,
      timeline,
      notes
    });

    // Update RFP status
    await rfp.update({ status: 'response_submitted' });

    // Notify buyer about new response
    const buyer = await User.findByPk(rfp.buyerId);
    if (buyer) {
      try {
        await sendResponseNotification(buyer, rfp, {
          ...response,
          supplier: req.user
        });
      } catch (emailError) {
        console.error('Error sending response notification:', emailError);
      }
    }

    // WebSocket notification
    socketService.notifyResponseSubmitted(response, rfp);

    res.status(201).json({
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResponses = async (req, res) => {
  try {
    const { rfpId, page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (rfpId) {
      // Check if user has access to this RFP's responses
      const rfp = await RFP.findByPk(rfpId);
      if (!rfp) {
        return res.status(404).json({ message: 'RFP not found' });
      }

      if (req.user.role === 'supplier') {
        whereClause.supplierId = req.user.id;
      } else if (req.user.role === 'buyer' && rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      whereClause.rfpId = rfpId;
    } else if (req.user.role === 'supplier') {
      whereClause.supplierId = req.user.id;
    } else if (req.user.role === 'buyer') {
      // Get responses for buyer's RFPs
      const buyerRFPs = await RFP.findAll({
        where: { buyerId: req.user.id },
        attributes: ['id']
      });
      whereClause.rfpId = { [require('sequelize').Op.in]: buyerRFPs.map(rfp => rfp.id) };
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: responses } = await RFPResponse.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RFP,
          as: 'rfp',
          attributes: ['id', 'title', 'description', 'deadline']
        },
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'firstName', 'lastName', 'company', 'email']
        },
        {
          model: Document,
          as: 'documents',
          where: { isLatest: true },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      responses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResponseById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await RFPResponse.findByPk(id, {
      include: [
        {
          model: RFP,
          as: 'rfp',
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'firstName', 'lastName', 'company', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'supplier',
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

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check access permissions
    if (req.user.role === 'supplier' && response.supplierId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'buyer' && response.rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Get response by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const response = await RFPResponse.findByPk(id);

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    if (response.supplierId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (response.status !== 'submitted') {
      return res.status(400).json({ message: 'Response cannot be updated' });
    }

    const { proposal, proposedBudget, timeline, notes } = req.body;

    await response.update({
      proposal: proposal || response.proposal,
      proposedBudget: proposedBudget !== undefined ? proposedBudget : response.proposedBudget,
      timeline: timeline || response.timeline,
      notes: notes || response.notes
    });

    res.json({
      message: 'Response updated successfully',
      response
    });
  } catch (error) {
    console.error('Update response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reviewResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, evaluationScore, evaluationComments } = req.body;

    const response = await RFPResponse.findByPk(id, {
      include: [
        {
          model: RFP,
          as: 'rfp'
        },
        {
          model: User,
          as: 'supplier'
        }
      ]
    });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    if (response.rfp.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await response.update({
      status,
      evaluationScore,
      evaluationComments,
      reviewedAt: new Date()
    });

    // Update RFP status if approved
    if (status === 'approved') {
      await response.rfp.update({ status: 'approved' });
    }

    // Notify supplier about status change
    try {
      await sendStatusUpdateNotification(response.supplier, response.rfp, status);
    } catch (emailError) {
      console.error('Error sending status update notification:', emailError);
    }

    // WebSocket notification
    socketService.notifyResponseReviewed(response, response.rfp);

    res.json({
      message: 'Response reviewed successfully',
      response
    });
  } catch (error) {
    console.error('Review response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createResponse,
  getResponses,
  getResponseById,
  updateResponse,
  reviewResponse
};
