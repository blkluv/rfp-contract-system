const { Op } = require('sequelize');
const { RFP, RFPResponse, Document, User } = require('../models');

const searchRFPs = async (req, res) => {
  try {
    const { q, category, status, budgetMin, budgetMax, deadlineFrom, deadlineTo, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Text search
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { category: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Filters
    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    if (budgetMin || budgetMax) {
      whereClause.budget = {};
      if (budgetMin) whereClause.budget[Op.gte] = parseFloat(budgetMin);
      if (budgetMax) whereClause.budget[Op.lte] = parseFloat(budgetMax);
    }

    if (deadlineFrom || deadlineTo) {
      whereClause.deadline = {};
      if (deadlineFrom) whereClause.deadline[Op.gte] = new Date(deadlineFrom);
      if (deadlineTo) whereClause.deadline[Op.lte] = new Date(deadlineTo);
    }

    // Role-based access
    if (req.user.role === 'supplier') {
      whereClause.isPublic = true;
      whereClause.status = 'published';
    } else if (req.user.role === 'buyer') {
      whereClause.buyerId = req.user.id;
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
    console.error('Search RFPs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchResponses = async (req, res) => {
  try {
    const { q, status, rfpId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Text search
    if (q) {
      whereClause[Op.or] = [
        { proposal: { [Op.iLike]: `%${q}%` } },
        { notes: { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (rfpId) {
      whereClause.rfpId = rfpId;
    }

    // Role-based access
    if (req.user.role === 'supplier') {
      whereClause.supplierId = req.user.id;
    } else if (req.user.role === 'buyer') {
      // Get responses for buyer's RFPs
      const buyerRFPs = await RFP.findAll({
        where: { buyerId: req.user.id },
        attributes: ['id']
      });
      whereClause.rfpId = { [Op.in]: buyerRFPs.map(rfp => rfp.id) };
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
    console.error('Search responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchDocuments = async (req, res) => {
  try {
    const { q, fileType, rfpId, responseId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Text search
    if (q) {
      whereClause[Op.or] = [
        { originalName: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (fileType) {
      whereClause.fileType = fileType;
    }

    if (rfpId) {
      whereClause.rfpId = rfpId;
    }

    if (responseId) {
      whereClause.responseId = responseId;
    }

    whereClause.isLatest = true;

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;

    // Search RFPs
    let rfpWhereClause = {
      [Op.or]: [
        { title: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
        { category: { [Op.iLike]: searchTerm } }
      ]
    };

    if (req.user.role === 'supplier') {
      rfpWhereClause.isPublic = true;
      rfpWhereClause.status = 'published';
    } else if (req.user.role === 'buyer') {
      rfpWhereClause.buyerId = req.user.id;
    }

    const rfps = await RFP.findAll({
      where: rfpWhereClause,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'company']
        }
      ],
      limit: Math.ceil(limit / 3),
      order: [['createdAt', 'DESC']]
    });

    // Search Responses
    let responseWhereClause = {
      [Op.or]: [
        { proposal: { [Op.iLike]: searchTerm } },
        { notes: { [Op.iLike]: searchTerm } }
      ]
    };

    if (req.user.role === 'supplier') {
      responseWhereClause.supplierId = req.user.id;
    } else if (req.user.role === 'buyer') {
      const buyerRFPs = await RFP.findAll({
        where: { buyerId: req.user.id },
        attributes: ['id']
      });
      responseWhereClause.rfpId = { [Op.in]: buyerRFPs.map(rfp => rfp.id) };
    }

    const responses = await RFPResponse.findAll({
      where: responseWhereClause,
      include: [
        {
          model: RFP,
          as: 'rfp',
          attributes: ['id', 'title', 'description']
        },
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'firstName', 'lastName', 'company']
        }
      ],
      limit: Math.ceil(limit / 3),
      order: [['createdAt', 'DESC']]
    });

    // Search Documents
    const documents = await Document.findAll({
      where: {
        [Op.or]: [
          { originalName: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } }
        ],
        isLatest: true
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: Math.ceil(limit / 3),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      rfps,
      responses,
      documents,
      totalResults: rfps.length + responses.length + documents.length
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchRFPs,
  searchResponses,
  searchDocuments,
  globalSearch
};
