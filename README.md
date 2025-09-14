# RFP Contract Management System

A comprehensive Request for Proposal (RFP) contract management system built with Next.js and Node.js, designed to streamline the RFP process for both buyers and suppliers.

## 🚀 Features

### Core Functionality
- **User Management & Authentication**
  - JWT-based authentication with secure token handling
  - Role-based access control (Buyer/Supplier)
  - User registration and profile management
  - Password hashing with bcrypt

- **RFP Lifecycle Management**
  - Buyers can create, edit, and publish RFPs
  - Suppliers can browse available RFPs and submit responses
  - Complete status tracking: Draft → Published → Response Submitted → Under Review → Approved/Rejected
  - RFP versioning and history tracking

- **Document Management**
  - File upload capabilities for RFP documents and responses
  - Support for multiple file types (PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF)
  - Document versioning and management
  - File type validation and size limits (10MB default)
  - Secure file storage with access control

- **Email Notifications**
  - Automated emails when RFP status changes
  - Notifications to suppliers when new RFPs are published
  - Alerts to buyers when responses are submitted
  - Professional HTML email templates
  - Configurable SMTP settings

- **Real-time Updates**
  - WebSocket integration for live notifications
  - Real-time status updates
  - Live notification center
  - Instant updates across all connected clients

- **Advanced Search & Filtering**
  - Full-text search across RFPs, responses, and documents
  - Advanced filtering by category, status, budget, deadline
  - Global search functionality
  - Search result pagination

- **Audit Trail & Logging**
  - Comprehensive activity logging
  - User action tracking
  - System statistics and analytics
  - Audit log management

- **Dashboard & UI**
  - Role-specific dashboards with real-time data
  - Responsive, modern design with Material-UI
  - Professional notification center
  - Mobile-responsive design
  - Intuitive user experience

- **Performance & Caching**
  - In-memory caching for improved performance
  - Database query optimization
  - Connection pooling
  - Rate limiting and security

- **Testing & Quality**
  - Comprehensive test suite with Jest
  - Unit tests for all major components
  - API endpoint testing
  - Test coverage reporting

- **Deployment & DevOps**
  - Docker containerization
  - Docker Compose for local development
  - Production-ready configuration
  - Health checks and monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Sequelize ORM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Material-UI (MUI)** for UI components
- **React Hook Form** with Yup validation
- **Axios** for API communication
- **Tailwind CSS** for styling

## 📁 Project Structure

```
rfp-contract-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── rfpController.js
│   │   │   └── rfpResponseController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── RFP.js
│   │   │   ├── RFPResponse.js
│   │   │   └── Document.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── rfp.js
│   │   │   └── rfpResponse.js
│   │   ├── utils/
│   │   │   └── email.js
│   │   └── index.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── rfps/
│   │   │   ├── responses/
│   │   │   └── profile/
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── next.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rfp-contract-system
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp env.local.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```

4. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb rfp_contract_system
   
   # The backend will automatically create tables on startup
   ```

5. **Seed the database with test data**
   ```bash
   cd backend
   npm run seed
   ```
   
   This will create test users, RFPs, responses, and documents for testing the application.

### Environment Variables

#### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_contract_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=8000
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🎯 Usage

### Demo Accounts
After running the seed script, you can use these test accounts:

**Buyers:**
- **Buyer 1**: buyer1@test.com / password123
- **Buyer 2**: buyer2@test.com / password123

**Suppliers:**
- **Supplier 1**: supplier1@test.com / password123
- **Supplier 2**: supplier2@test.com / password123
- **Supplier 3**: supplier3@test.com / password123

### For Buyers
1. Register/Login as a buyer
2. Create new RFPs with detailed requirements
3. Publish RFPs to make them available to suppliers
4. Review and approve/reject supplier responses
5. Track RFP status and manage documents

### For Suppliers
1. Register/Login as a supplier
2. Browse available published RFPs
3. Submit detailed responses to RFPs
4. Track response status and manage documents
5. Update responses before deadline

## 🔧 API Documentation

### Swagger UI
Interactive API documentation is available at: **http://localhost:8000/api-docs**

The Swagger UI provides comprehensive documentation for all API endpoints with the following features:

#### 📋 **Documentation Features**
- **Complete API Reference**: All endpoints with detailed descriptions
- **Interactive Testing**: Test API calls directly from the browser
- **Request/Response Schemas**: Detailed data models and validation rules
- **Authentication Examples**: JWT token-based authentication flow
- **Try-it-out Functionality**: Execute API calls with real data
- **Error Response Codes**: Complete list of possible error responses
- **Parameter Descriptions**: Detailed query parameters and request body schemas

#### 🔐 **Authentication in Swagger**
1. **Register/Login**: Use the `/api/auth/register` or `/api/auth/login` endpoints
2. **Copy Token**: Copy the JWT token from the response
3. **Authorize**: Click the "Authorize" button in Swagger UI
4. **Enter Token**: Paste the token in the format: `Bearer YOUR_TOKEN_HERE`
5. **Test Protected Endpoints**: All authenticated endpoints will now work

#### 📊 **Available API Groups**
- **Authentication** (`/api/auth/*`): User registration, login, profile management
- **RFPs** (`/api/rfps/*`): Create, read, update, delete, and publish RFPs
- **Responses** (`/api/responses/*`): Submit and manage RFP responses
- **Documents** (`/api/documents/*`): File upload and management
- **Health Check** (`/health`): System health monitoring

#### 🚀 **Quick Start with Swagger**
1. Open http://localhost:8000/api-docs in your browser
2. Start with the Authentication section to get a JWT token
3. Use the "Try it out" button on any endpoint
4. Fill in the required parameters and execute
5. View the response and status codes

#### 📝 **API Schema Details**
The documentation includes detailed schemas for:
- **User Model**: Complete user profile structure
- **RFP Model**: Request for Proposal data structure
- **Response Model**: RFP response submission format
- **Document Model**: File upload and metadata structure
- **Error Model**: Standardized error response format

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### RFPs
- `GET /api/rfps` - Get RFPs (with filtering)
- `POST /api/rfps` - Create new RFP
- `GET /api/rfps/:id` - Get RFP by ID
- `PUT /api/rfps/:id` - Update RFP
- `DELETE /api/rfps/:id` - Delete RFP
- `POST /api/rfps/:id/publish` - Publish RFP

#### Responses
- `GET /api/responses` - Get responses (with filtering)
- `POST /api/responses` - Create response
- `GET /api/responses/:id` - Get response by ID
- `PUT /api/responses/:id` - Update response
- `PUT /api/responses/:id/review` - Review response (buyers only)

## 🤖 AI Usage Report

This project was developed with significant assistance from AI tools to enhance productivity and code quality:

### AI-Assisted Development Areas

1. **Code Generation and Boilerplate Creation**
   - AI helped generate the initial project structure and boilerplate code
   - Automated creation of TypeScript interfaces and type definitions
   - Generated API service functions and React components

2. **Database Schema Design**
   - AI assisted in designing the database schema with proper relationships
   - Generated Sequelize models with appropriate validations and hooks
   - Created migration scripts and database configuration

3. **UI/UX Design Assistance**
   - AI provided guidance on Material-UI component usage and layout design
   - Generated responsive design patterns and component structures
   - Assisted with form validation and user experience flows

4. **API Documentation and Structure**
   - AI helped structure RESTful API endpoints with proper HTTP methods
   - Generated comprehensive API documentation and error handling
   - Created consistent response formats and status codes

5. **Testing Strategy and Code Quality**
   - AI provided guidance on testing approaches and best practices
   - Generated validation schemas and error handling patterns
   - Assisted with code organization and maintainability

### Productivity Benefits

- **Faster Development**: AI tools significantly reduced development time by generating boilerplate code and providing instant solutions to common problems
- **Code Quality**: AI assistance helped maintain consistent coding patterns and best practices throughout the project
- **Learning Enhancement**: AI tools provided educational value by explaining concepts and suggesting improvements
- **Error Prevention**: AI helped identify potential issues early in the development process

### Creative Problem-Solving

- **Architecture Decisions**: AI provided insights on choosing appropriate technologies and design patterns
- **Feature Implementation**: AI suggested creative approaches to implementing complex features like role-based access control
- **User Experience**: AI helped design intuitive user flows and responsive interfaces

The AI tools were used as a collaborative partner, providing suggestions and generating code that was then reviewed, modified, and integrated into the final solution. This approach resulted in a more efficient development process while maintaining high code quality and user experience standards.

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Railway, Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update environment variables for production

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Note**: This project was developed as a demonstration of full-stack development capabilities using modern technologies and AI-assisted development practices.
