const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    const { Server } = require('socket.io');
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (!user || !user.isActive) {
          return next(new Error('Authentication error'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket);
      
      // Join user to their role-based room
      socket.join(socket.userRole);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle joining RFP-specific rooms
      socket.on('join_rfp', (rfpId) => {
        socket.join(`rfp_${rfpId}`);
      });

      socket.on('leave_rfp', (rfpId) => {
        socket.leave(`rfp_${rfpId}`);
      });
    });
  }

  // Emit to all users
  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Emit to specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  // Emit to users by role
  emitToRole(role, event, data) {
    if (this.io) {
      this.io.to(role).emit(event, data);
    }
  }

  // Emit to RFP participants
  emitToRFP(rfpId, event, data) {
    if (this.io) {
      this.io.to(`rfp_${rfpId}`).emit(event, data);
    }
  }

  // RFP-specific events
  notifyRFPPublished(rfp) {
    this.emitToRole('supplier', 'rfp_published', {
      type: 'rfp_published',
      rfp: {
        id: rfp.id,
        title: rfp.title,
        category: rfp.category,
        deadline: rfp.deadline,
        budget: rfp.budget,
        currency: rfp.currency
      },
      timestamp: new Date().toISOString()
    });
  }

  notifyRFPUpdated(rfp) {
    this.emitToRFP(rfp.id, 'rfp_updated', {
      type: 'rfp_updated',
      rfp: {
        id: rfp.id,
        title: rfp.title,
        status: rfp.status,
        updatedAt: rfp.updatedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  notifyResponseSubmitted(response, rfp) {
    // Notify the buyer
    this.emitToUser(rfp.buyerId, 'response_submitted', {
      type: 'response_submitted',
      response: {
        id: response.id,
        rfpId: response.rfpId,
        supplierId: response.supplierId,
        submittedAt: response.submittedAt
      },
      rfp: {
        id: rfp.id,
        title: rfp.title
      },
      timestamp: new Date().toISOString()
    });

    // Notify all participants in the RFP
    this.emitToRFP(rfp.id, 'rfp_status_changed', {
      type: 'rfp_status_changed',
      rfpId: rfp.id,
      newStatus: 'response_submitted',
      timestamp: new Date().toISOString()
    });
  }

  notifyResponseReviewed(response, rfp) {
    // Notify the supplier
    this.emitToUser(response.supplierId, 'response_reviewed', {
      type: 'response_reviewed',
      response: {
        id: response.id,
        status: response.status,
        evaluationScore: response.evaluationScore,
        reviewedAt: response.reviewedAt
      },
      rfp: {
        id: rfp.id,
        title: rfp.title
      },
      timestamp: new Date().toISOString()
    });

    // Notify all participants in the RFP
    this.emitToRFP(rfp.id, 'response_reviewed', {
      type: 'response_reviewed',
      rfpId: rfp.id,
      responseId: response.id,
      status: response.status,
      timestamp: new Date().toISOString()
    });
  }

  notifyStatusUpdate(rfp, status) {
    this.emitToRFP(rfp.id, 'rfp_status_changed', {
      type: 'rfp_status_changed',
      rfpId: rfp.id,
      newStatus: status,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();

