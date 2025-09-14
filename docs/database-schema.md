# Database Schema Documentation

## Overview

The RFP Contract Management System uses PostgreSQL as the primary database with Sequelize ORM for data modeling and migrations. The database is designed to support the complete RFP lifecycle from creation to response management.

## Entity Relationship Diagram

```
Users
├── RFPs (1:N)
│   ├── RFPResponses (1:N)
│   └── Documents (1:N)
└── RFPResponses (1:N)
    └── Documents (1:N)
```

## Tables

### Users

Stores user account information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password` | VARCHAR(255) | NOT NULL | Hashed password |
| `firstName` | VARCHAR(50) | NOT NULL | User's first name |
| `lastName` | VARCHAR(50) | NOT NULL | User's last name |
| `role` | ENUM | NOT NULL | User role (buyer/supplier) |
| `company` | VARCHAR(255) | NULL | Company name |
| `phone` | VARCHAR(20) | NULL | Phone number |
| `isActive` | BOOLEAN | DEFAULT true | Account status |
| `lastLogin` | TIMESTAMP | NULL | Last login timestamp |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Record last update time |

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `role` for role-based queries
- Index on `isActive` for active user queries

**Hooks:**
- `beforeCreate`: Hash password using bcrypt
- `beforeUpdate`: Re-hash password if changed

### RFPs

Stores RFP information and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Unique RFP identifier |
| `title` | VARCHAR(200) | NOT NULL | RFP title |
| `description` | TEXT | NOT NULL | Detailed RFP description |
| `category` | VARCHAR(100) | NOT NULL | RFP category |
| `budget` | DECIMAL(15,2) | NULL | Budget amount |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| `deadline` | TIMESTAMP | NOT NULL | Submission deadline |
| `status` | ENUM | DEFAULT 'draft' | RFP status |
| `requirements` | JSON | NULL | Array of requirements |
| `evaluationCriteria` | JSON | NULL | Array of evaluation criteria |
| `submissionInstructions` | TEXT | NULL | Submission instructions |
| `contactEmail` | VARCHAR(255) | NULL | Contact email |
| `isPublic` | BOOLEAN | DEFAULT false | Public visibility |
| `publishedAt` | TIMESTAMP | NULL | Publication timestamp |
| `buyerId` | UUID | NOT NULL, FK | Buyer user ID |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Record last update time |

**Status Values:**
- `draft`: RFP is being created/edited
- `published`: RFP is live and accepting responses
- `response_submitted`: At least one response received
- `under_review`: Responses are being evaluated
- `approved`: RFP has been approved
- `rejected`: RFP has been rejected

**Indexes:**
- Primary key on `id`
- Foreign key index on `buyerId`
- Index on `status` for status-based queries
- Index on `isPublic` for public RFP queries
- Index on `category` for category filtering
- Index on `deadline` for deadline-based queries
- Composite index on `(isPublic, status)` for public RFP queries

### RFPResponses

Stores supplier responses to RFPs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Unique response identifier |
| `proposal` | TEXT | NOT NULL | Response proposal text |
| `proposedBudget` | DECIMAL(15,2) | NULL | Proposed budget |
| `timeline` | VARCHAR(100) | NULL | Proposed timeline |
| `status` | ENUM | DEFAULT 'submitted' | Response status |
| `notes` | TEXT | NULL | Additional notes |
| `evaluationScore` | INTEGER | NULL | Evaluation score (0-100) |
| `evaluationComments` | TEXT | NULL | Evaluation comments |
| `submittedAt` | TIMESTAMP | DEFAULT NOW() | Submission timestamp |
| `reviewedAt` | TIMESTAMP | NULL | Review timestamp |
| `rfpId` | UUID | NOT NULL, FK | RFP identifier |
| `supplierId` | UUID | NOT NULL, FK | Supplier user ID |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Record last update time |

**Status Values:**
- `submitted`: Response submitted, awaiting review
- `under_review`: Response is being evaluated
- `approved`: Response has been approved
- `rejected`: Response has been rejected

**Indexes:**
- Primary key on `id`
- Foreign key index on `rfpId`
- Foreign key index on `supplierId`
- Index on `status` for status-based queries
- Composite index on `(rfpId, supplierId)` for unique response per RFP
- Index on `submittedAt` for time-based queries

### Documents

Stores file attachments and document metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Unique document identifier |
| `filename` | VARCHAR(255) | NOT NULL | Stored filename |
| `originalName` | VARCHAR(255) | NOT NULL | Original filename |
| `filePath` | VARCHAR(500) | NOT NULL | File storage path |
| `fileSize` | INTEGER | NOT NULL | File size in bytes |
| `mimeType` | VARCHAR(100) | NOT NULL | MIME type |
| `fileType` | ENUM | NOT NULL | Document type |
| `description` | TEXT | NULL | Document description |
| `version` | INTEGER | DEFAULT 1 | Document version |
| `isLatest` | BOOLEAN | DEFAULT true | Latest version flag |
| `uploadedBy` | UUID | NOT NULL, FK | Uploader user ID |
| `rfpId` | UUID | NULL, FK | Associated RFP ID |
| `responseId` | UUID | NULL, FK | Associated response ID |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Record last update time |

**File Type Values:**
- `rfp_document`: RFP-related documents
- `response_document`: Response-related documents
- `attachment`: General attachments

**Indexes:**
- Primary key on `id`
- Foreign key index on `uploadedBy`
- Foreign key index on `rfpId`
- Foreign key index on `responseId`
- Index on `fileType` for type-based queries
- Index on `isLatest` for latest version queries
- Composite index on `(rfpId, isLatest)` for RFP documents
- Composite index on `(responseId, isLatest)` for response documents

## Relationships

### Users → RFPs (1:N)
- One user (buyer) can create many RFPs
- Foreign key: `RFPs.buyerId` → `Users.id`
- Cascade delete: When user is deleted, their RFPs are deleted

### Users → RFPResponses (1:N)
- One user (supplier) can create many responses
- Foreign key: `RFPResponses.supplierId` → `Users.id`
- Cascade delete: When user is deleted, their responses are deleted

### RFPs → RFPResponses (1:N)
- One RFP can have many responses
- Foreign key: `RFPResponses.rfpId` → `RFPs.id`
- Cascade delete: When RFP is deleted, its responses are deleted

### Users → Documents (1:N)
- One user can upload many documents
- Foreign key: `Documents.uploadedBy` → `Users.id`
- Cascade delete: When user is deleted, their documents are deleted

### RFPs → Documents (1:N)
- One RFP can have many documents
- Foreign key: `Documents.rfpId` → `RFPs.id`
- Cascade delete: When RFP is deleted, its documents are deleted

### RFPResponses → Documents (1:N)
- One response can have many documents
- Foreign key: `Documents.responseId` → `RFPResponses.id`
- Cascade delete: When response is deleted, its documents are deleted

## Constraints

### Check Constraints
- `budget >= 0`: Budget must be non-negative
- `proposedBudget >= 0`: Proposed budget must be non-negative
- `evaluationScore BETWEEN 0 AND 100`: Evaluation score must be between 0 and 100
- `fileSize > 0`: File size must be positive
- `version > 0`: Version must be positive

### Unique Constraints
- `Users.email`: Email must be unique
- `(RFPResponses.rfpId, RFPResponses.supplierId)`: One response per supplier per RFP

### Foreign Key Constraints
- All foreign key relationships have proper referential integrity
- Cascade deletes are configured for dependent records
- Nullable foreign keys are properly handled

## Triggers and Functions

### Password Hashing
- Passwords are automatically hashed using bcrypt before storage
- Password comparison is handled through model methods
- Password updates trigger re-hashing

### Timestamp Management
- `createdAt` and `updatedAt` are automatically managed by Sequelize
- `submittedAt` is set when response is created
- `reviewedAt` is set when response is reviewed
- `publishedAt` is set when RFP is published

### Version Management
- Document versions are automatically incremented
- Only one document per type per entity can be marked as `isLatest`
- Version updates trigger `isLatest` flag management

## Performance Optimizations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for join performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### Query Optimization
- Eager loading for related data
- Pagination for large result sets
- Filtering and sorting at database level
- Connection pooling for concurrent access

### Data Archiving
- Soft deletes for audit trails
- Document versioning for change tracking
- Status history for workflow tracking

## Security Considerations

### Data Protection
- Passwords are hashed with bcrypt
- Sensitive data is encrypted at rest
- Input validation prevents SQL injection
- Role-based access control

### Audit Trail
- All changes are timestamped
- User actions are logged
- Document versions are maintained
- Status changes are tracked

## Migration Strategy

### Database Migrations
- Sequelize migrations for schema changes
- Version-controlled migration files
- Rollback capabilities for failed migrations
- Data migration scripts for complex changes

### Backup and Recovery
- Regular database backups
- Point-in-time recovery capabilities
- Cross-region replication for disaster recovery
- Automated backup testing

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking
- Index usage analysis
- Connection pool monitoring
- Slow query identification

### Maintenance Tasks
- Regular index optimization
- Statistics updates
- Vacuum and analyze operations
- Log file rotation

## Future Enhancements

### Planned Features
- Full-text search capabilities
- Document preview generation
- Advanced analytics and reporting
- Real-time notifications
- API rate limiting
- Audit log enhancements

### Scalability Considerations
- Horizontal partitioning strategies
- Read replica configuration
- Caching layer implementation
- Microservices architecture

