const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const { Document, RFP, RFPResponse } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

const uploadMiddleware = upload.single('file');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { rfpId, responseId, fileType, description } = req.body;

    // Validate file type
    if (!['rfp_document', 'response_document', 'attachment'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    // Check if user has permission to upload to this RFP/Response
    if (rfpId) {
      const rfp = await RFP.findByPk(rfpId);
      if (!rfp) {
        return res.status(404).json({ message: 'RFP not found' });
      }
      if (req.user.role === 'supplier' && (!rfp.isPublic || rfp.status !== 'published')) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (responseId) {
      const response = await RFPResponse.findByPk(responseId);
      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }
      if (req.user.role === 'supplier' && response.supplierId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && response.rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Create document record
    const document = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType: fileType,
      description: description || null,
      uploadedBy: req.user.id,
      rfpId: rfpId || null,
      responseId: responseId || null
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        fileType: document.fileType,
        description: document.description,
        uploadedAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check permissions
    if (document.rfpId) {
      const rfp = await RFP.findByPk(document.rfpId);
      if (req.user.role === 'supplier' && (!rfp.isPublic || rfp.status !== 'published')) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (document.responseId) {
      const response = await RFPResponse.findByPk(document.responseId);
      if (req.user.role === 'supplier' && response.supplierId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && response.rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { rfpId, responseId, fileType } = req.query;
    let whereClause = {};

    if (rfpId) {
      whereClause.rfpId = rfpId;
      // Check RFP access
      const rfp = await RFP.findByPk(rfpId);
      if (!rfp) {
        return res.status(404).json({ message: 'RFP not found' });
      }
      if (req.user.role === 'supplier' && (!rfp.isPublic || rfp.status !== 'published')) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (responseId) {
      whereClause.responseId = responseId;
      // Check response access
      const response = await RFPResponse.findByPk(responseId);
      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }
      if (req.user.role === 'supplier' && response.supplierId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'buyer' && response.rfp.buyerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (fileType) {
      whereClause.fileType = fileType;
    }

    whereClause.isLatest = true;

    const documents = await Document.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check permissions
    if (document.uploadedBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await document.destroy();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadMiddleware,
  uploadFile,
  getFile,
  getDocuments,
  deleteFile
};
