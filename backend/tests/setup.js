const { Sequelize } = require('sequelize');

// Create test database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Global test setup
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Global test cleanup
afterAll(async () => {
  await sequelize.close();
});

// Mock email service
jest.mock('../src/utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  sendRFPNotification: jest.fn().mockResolvedValue([]),
  sendResponseNotification: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  sendStatusUpdateNotification: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

// Mock WebSocket service
jest.mock('../src/services/socketService', () => ({
  initialize: jest.fn(),
  emitToAll: jest.fn(),
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
  emitToRFP: jest.fn(),
  notifyRFPPublished: jest.fn(),
  notifyRFPUpdated: jest.fn(),
  notifyResponseSubmitted: jest.fn(),
  notifyResponseReviewed: jest.fn(),
  notifyStatusUpdate: jest.fn(),
  getConnectedUsersCount: jest.fn().mockReturnValue(0),
  isUserConnected: jest.fn().mockReturnValue(false)
}));

// Mock audit service
jest.mock('../src/services/auditService', () => ({
  logAction: jest.fn(),
  logUserLogin: jest.fn(),
  logUserLogout: jest.fn(),
  logUserRegistration: jest.fn(),
  logUserProfileUpdate: jest.fn(),
  logRFPCreate: jest.fn(),
  logRFPUpdate: jest.fn(),
  logRFPDelete: jest.fn(),
  logRFPPublish: jest.fn(),
  logResponseCreate: jest.fn(),
  logResponseUpdate: jest.fn(),
  logResponseReview: jest.fn(),
  logFileUpload: jest.fn(),
  logFileDelete: jest.fn(),
  logSearch: jest.fn(),
  getAuditLogs: jest.fn().mockResolvedValue({ logs: [], pagination: {} }),
  getUserActivitySummary: jest.fn().mockResolvedValue([]),
  getSystemStats: jest.fn().mockResolvedValue([])
}));

