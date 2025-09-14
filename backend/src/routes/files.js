const express = require('express');
const { body } = require('express-validator');
const { uploadMiddleware, uploadFile, getFile, getDocuments, deleteFile } = require('../controllers/fileController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Upload file
router.post('/upload', [
  auth,
  uploadMiddleware,
  body('fileType').isIn(['rfp_document', 'response_document', 'attachment']),
  body('rfpId').optional().isUUID(),
  body('responseId').optional().isUUID(),
  body('description').optional().trim(),
  handleValidationErrors
], uploadFile);

// Get file by ID
router.get('/:id', auth, getFile);

// Get documents with filters
router.get('/', [
  auth,
  body('rfpId').optional().isUUID(),
  body('responseId').optional().isUUID(),
  body('fileType').optional().isIn(['rfp_document', 'response_document', 'attachment']),
  handleValidationErrors
], getDocuments);

// Delete file
router.delete('/:id', auth, deleteFile);

module.exports = router;

