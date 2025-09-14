# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer",
  "company": "Acme Corp",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "company": "Acme Corp",
    "phone": "+1234567890"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "company": "Acme Corp",
    "phone": "+1234567890"
  }
}
```

### GET /auth/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /auth/profile

Update current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "company": "Acme Corp",
    "phone": "+1234567890"
  }
}
```

## RFP Endpoints

### GET /rfps

Get list of RFPs with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `category` (string): Filter by category
- `status` (string): Filter by status

**Response:**
```json
{
  "rfps": [
    {
      "id": "uuid",
      "title": "Website Development RFP",
      "description": "We need a new website...",
      "category": "Technology",
      "budget": 50000,
      "currency": "USD",
      "deadline": "2024-02-01T00:00:00.000Z",
      "status": "published",
      "requirements": ["React", "Node.js"],
      "evaluationCriteria": ["Price", "Timeline"],
      "submissionInstructions": "Submit via email",
      "contactEmail": "contact@example.com",
      "isPublic": true,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "buyerId": "uuid",
      "buyer": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "company": "Acme Corp"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### POST /rfps

Create a new RFP (Buyers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Website Development RFP",
  "description": "We need a new website...",
  "category": "Technology",
  "budget": 50000,
  "currency": "USD",
  "deadline": "2024-02-01T00:00:00.000Z",
  "requirements": ["React", "Node.js"],
  "evaluationCriteria": ["Price", "Timeline"],
  "submissionInstructions": "Submit via email",
  "contactEmail": "contact@example.com"
}
```

**Response:**
```json
{
  "message": "RFP created successfully",
  "rfp": {
    "id": "uuid",
    "title": "Website Development RFP",
    "description": "We need a new website...",
    "category": "Technology",
    "budget": 50000,
    "currency": "USD",
    "deadline": "2024-02-01T00:00:00.000Z",
    "status": "draft",
    "requirements": ["React", "Node.js"],
    "evaluationCriteria": ["Price", "Timeline"],
    "submissionInstructions": "Submit via email",
    "contactEmail": "contact@example.com",
    "isPublic": false,
    "buyerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /rfps/:id

Get RFP by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "rfp": {
    "id": "uuid",
    "title": "Website Development RFP",
    "description": "We need a new website...",
    "category": "Technology",
    "budget": 50000,
    "currency": "USD",
    "deadline": "2024-02-01T00:00:00.000Z",
    "status": "published",
    "requirements": ["React", "Node.js"],
    "evaluationCriteria": ["Price", "Timeline"],
    "submissionInstructions": "Submit via email",
    "contactEmail": "contact@example.com",
    "isPublic": true,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "buyerId": "uuid",
    "buyer": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "email": "john@example.com"
    },
    "documents": [
      {
        "id": "uuid",
        "filename": "rfp-doc.pdf",
        "originalName": "RFP Document.pdf",
        "filePath": "/uploads/rfp-doc.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "fileType": "rfp_document",
        "description": "Main RFP document",
        "version": 1,
        "isLatest": true,
        "uploadedBy": "uuid",
        "rfpId": "uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /rfps/:id

Update RFP (Buyers only, own RFPs only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Website Development RFP",
  "description": "Updated description...",
  "category": "Technology",
  "budget": 60000,
  "currency": "USD",
  "deadline": "2024-02-15T00:00:00.000Z",
  "requirements": ["React", "Node.js", "TypeScript"],
  "evaluationCriteria": ["Price", "Timeline", "Quality"],
  "submissionInstructions": "Submit via portal",
  "contactEmail": "newcontact@example.com",
  "status": "published"
}
```

**Response:**
```json
{
  "message": "RFP updated successfully",
  "rfp": {
    "id": "uuid",
    "title": "Updated Website Development RFP",
    "description": "Updated description...",
    "category": "Technology",
    "budget": 60000,
    "currency": "USD",
    "deadline": "2024-02-15T00:00:00.000Z",
    "status": "published",
    "requirements": ["React", "Node.js", "TypeScript"],
    "evaluationCriteria": ["Price", "Timeline", "Quality"],
    "submissionInstructions": "Submit via portal",
    "contactEmail": "newcontact@example.com",
    "isPublic": true,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "buyerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /rfps/:id

Delete RFP (Buyers only, own RFPs only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "RFP deleted successfully"
}
```

### POST /rfps/:id/publish

Publish RFP (Buyers only, own RFPs only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "RFP published successfully",
  "rfp": {
    "id": "uuid",
    "title": "Website Development RFP",
    "description": "We need a new website...",
    "category": "Technology",
    "budget": 50000,
    "currency": "USD",
    "deadline": "2024-02-01T00:00:00.000Z",
    "status": "published",
    "isPublic": true,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "buyerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## RFP Response Endpoints

### GET /responses

Get list of responses with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `rfpId` (string): Filter by RFP ID
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status

**Response:**
```json
{
  "responses": [
    {
      "id": "uuid",
      "proposal": "We can deliver this project...",
      "proposedBudget": 45000,
      "timeline": "8 weeks",
      "status": "submitted",
      "notes": "Additional notes...",
      "evaluationScore": null,
      "evaluationComments": null,
      "submittedAt": "2024-01-15T00:00:00.000Z",
      "reviewedAt": null,
      "rfpId": "uuid",
      "supplierId": "uuid",
      "rfp": {
        "id": "uuid",
        "title": "Website Development RFP",
        "description": "We need a new website...",
        "deadline": "2024-02-01T00:00:00.000Z"
      },
      "supplier": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "company": "Tech Solutions Inc",
        "email": "jane@techsolutions.com"
      },
      "documents": [
        {
          "id": "uuid",
          "filename": "response-doc.pdf",
          "originalName": "Proposal.pdf",
          "filePath": "/uploads/response-doc.pdf",
          "fileSize": 512000,
          "mimeType": "application/pdf",
          "fileType": "response_document",
          "description": "Detailed proposal",
          "version": 1,
          "isLatest": true,
          "uploadedBy": "uuid",
          "responseId": "uuid",
          "createdAt": "2024-01-15T00:00:00.000Z",
          "updatedAt": "2024-01-15T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### POST /responses

Create a new response (Suppliers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rfpId": "uuid",
  "proposal": "We can deliver this project within 8 weeks...",
  "proposedBudget": 45000,
  "timeline": "8 weeks",
  "notes": "We have extensive experience in this area..."
}
```

**Response:**
```json
{
  "message": "Response submitted successfully",
  "response": {
    "id": "uuid",
    "proposal": "We can deliver this project within 8 weeks...",
    "proposedBudget": 45000,
    "timeline": "8 weeks",
    "status": "submitted",
    "notes": "We have extensive experience in this area...",
    "evaluationScore": null,
    "evaluationComments": null,
    "submittedAt": "2024-01-15T00:00:00.000Z",
    "reviewedAt": null,
    "rfpId": "uuid",
    "supplierId": "uuid",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### GET /responses/:id

Get response by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "response": {
    "id": "uuid",
    "proposal": "We can deliver this project within 8 weeks...",
    "proposedBudget": 45000,
    "timeline": "8 weeks",
    "status": "submitted",
    "notes": "We have extensive experience in this area...",
    "evaluationScore": null,
    "evaluationComments": null,
    "submittedAt": "2024-01-15T00:00:00.000Z",
    "reviewedAt": null,
    "rfpId": "uuid",
    "supplierId": "uuid",
    "rfp": {
      "id": "uuid",
      "title": "Website Development RFP",
      "description": "We need a new website...",
      "deadline": "2024-02-01T00:00:00.000Z",
      "buyer": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "company": "Acme Corp",
        "email": "john@example.com"
      }
    },
    "supplier": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "company": "Tech Solutions Inc",
      "email": "jane@techsolutions.com"
    },
    "documents": [
      {
        "id": "uuid",
        "filename": "response-doc.pdf",
        "originalName": "Proposal.pdf",
        "filePath": "/uploads/response-doc.pdf",
        "fileSize": 512000,
        "mimeType": "application/pdf",
        "fileType": "response_document",
        "description": "Detailed proposal",
        "version": 1,
        "isLatest": true,
        "uploadedBy": "uuid",
        "responseId": "uuid",
        "createdAt": "2024-01-15T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### PUT /responses/:id

Update response (Suppliers only, own responses only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "proposal": "Updated proposal...",
  "proposedBudget": 40000,
  "timeline": "6 weeks",
  "notes": "Updated notes..."
}
```

**Response:**
```json
{
  "message": "Response updated successfully",
  "response": {
    "id": "uuid",
    "proposal": "Updated proposal...",
    "proposedBudget": 40000,
    "timeline": "6 weeks",
    "status": "submitted",
    "notes": "Updated notes...",
    "evaluationScore": null,
    "evaluationComments": null,
    "submittedAt": "2024-01-15T00:00:00.000Z",
    "reviewedAt": null,
    "rfpId": "uuid",
    "supplierId": "uuid",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### PUT /responses/:id/review

Review response (Buyers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "evaluationScore": 85,
  "evaluationComments": "Great proposal with competitive pricing"
}
```

**Response:**
```json
{
  "message": "Response reviewed successfully",
  "response": {
    "id": "uuid",
    "proposal": "We can deliver this project within 8 weeks...",
    "proposedBudget": 45000,
    "timeline": "8 weeks",
    "status": "approved",
    "notes": "We have extensive experience in this area...",
    "evaluationScore": 85,
    "evaluationComments": "Great proposal with competitive pricing",
    "submittedAt": "2024-01-15T00:00:00.000Z",
    "reviewedAt": "2024-01-20T00:00:00.000Z",
    "rfpId": "uuid",
    "supplierId": "uuid",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  }
}
```

## Health Check

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## Filtering and Search

List endpoints support filtering and search:
- `search`: Full-text search across relevant fields
- `category`: Filter by category
- `status`: Filter by status
- `rfpId`: Filter responses by RFP ID

## File Uploads

File uploads are handled through multipart/form-data requests. Supported file types and size limits are configured in the backend.

## Webhooks

The API supports webhooks for real-time notifications:
- RFP status changes
- New response submissions
- Response status updates

Webhook endpoints are configured in the backend and can be customized for different notification channels.

