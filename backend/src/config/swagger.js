const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RFP Contract Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing Request for Proposal (RFP) contracts between buyers and suppliers',
      contact: {
        name: 'API Support',
        email: 'support@rfp-system.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the user'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (min 6 characters)'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            role: {
              type: 'string',
              enum: ['buyer', 'supplier'],
              description: 'User role in the system'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the user account is active'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        RFP: {
          type: 'object',
          required: ['title', 'description', 'category', 'deadline', 'requirements', 'evaluationCriteria', 'submissionInstructions', 'contactEmail'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the RFP'
            },
            title: {
              type: 'string',
              description: 'RFP title'
            },
            description: {
              type: 'string',
              description: 'Detailed description of the RFP'
            },
            category: {
              type: 'string',
              description: 'RFP category'
            },
            budget: {
              type: 'number',
              format: 'decimal',
              description: 'Budget amount'
            },
            currency: {
              type: 'string',
              default: 'USD',
              description: 'Currency code'
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Submission deadline'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'response_submitted', 'under_review', 'approved', 'rejected'],
              default: 'draft',
              description: 'Current status of the RFP'
            },
            requirements: {
              type: 'object',
              description: 'Detailed requirements in JSON format'
            },
            evaluationCriteria: {
              type: 'object',
              description: 'Evaluation criteria in JSON format'
            },
            submissionInstructions: {
              type: 'string',
              description: 'Instructions for submitting responses'
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              description: 'Contact email for questions'
            },
            isPublic: {
              type: 'boolean',
              default: false,
              description: 'Whether the RFP is publicly visible'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Publication timestamp'
            },
            buyerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the buyer who created the RFP'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        RFPResponse: {
          type: 'object',
          required: ['proposal', 'proposedBudget', 'timeline', 'rfpId', 'supplierId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the response'
            },
            proposal: {
              type: 'string',
              description: 'Detailed proposal text'
            },
            proposedBudget: {
              type: 'number',
              format: 'decimal',
              description: 'Proposed budget amount'
            },
            timeline: {
              type: 'string',
              description: 'Proposed timeline for completion'
            },
            status: {
              type: 'string',
              enum: ['submitted', 'under_review', 'approved', 'rejected'],
              default: 'submitted',
              description: 'Current status of the response'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            evaluationScore: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Evaluation score (0-100)'
            },
            evaluationComments: {
              type: 'string',
              description: 'Comments from the evaluator'
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Submission timestamp'
            },
            reviewedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Review timestamp'
            },
            rfpId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the RFP being responded to'
            },
            supplierId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the supplier submitting the response'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Document: {
          type: 'object',
          required: ['filename', 'originalName', 'filePath', 'fileSize', 'mimeType', 'fileType', 'uploadedBy'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the document'
            },
            filename: {
              type: 'string',
              description: 'Stored filename'
            },
            originalName: {
              type: 'string',
              description: 'Original filename'
            },
            filePath: {
              type: 'string',
              description: 'File path on server'
            },
            fileSize: {
              type: 'integer',
              description: 'File size in bytes'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type of the file'
            },
            fileType: {
              type: 'string',
              enum: ['rfp_document', 'response_document', 'attachment'],
              description: 'Type of document'
            },
            description: {
              type: 'string',
              description: 'Document description'
            },
            version: {
              type: 'integer',
              default: 1,
              description: 'Document version number'
            },
            isLatest: {
              type: 'boolean',
              default: true,
              description: 'Whether this is the latest version'
            },
            uploadedBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who uploaded the document'
            },
            rfpId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the related RFP (if applicable)'
            },
            responseId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the related response (if applicable)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
