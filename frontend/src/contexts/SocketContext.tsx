'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      });

      // RFP notifications
      newSocket.on('rfp_published', (data) => {
        addNotification({
          id: `rfp-published-${Date.now()}`,
          type: 'info',
          title: 'New RFP Available',
          message: `${data.rfp.title} has been published`,
          timestamp: new Date(data.timestamp),
          read: false,
          actionUrl: `/rfps/${data.rfp.id}`
        });
      });

      newSocket.on('rfp_updated', (data) => {
        addNotification({
          id: `rfp-updated-${Date.now()}`,
          type: 'info',
          title: 'RFP Updated',
          message: `${data.rfp.title} has been updated`,
          timestamp: new Date(data.timestamp),
          read: false,
          actionUrl: `/rfps/${data.rfp.id}`
        });
      });

      newSocket.on('response_submitted', (data) => {
        addNotification({
          id: `response-submitted-${Date.now()}`,
          type: 'success',
          title: 'New Response Received',
          message: `A response has been submitted for ${data.rfp.title}`,
          timestamp: new Date(data.timestamp),
          read: false,
          actionUrl: `/responses/${data.response.id}`
        });
      });

      newSocket.on('response_reviewed', (data) => {
        addNotification({
          id: `response-reviewed-${Date.now()}`,
          type: data.response.status === 'approved' ? 'success' : 'warning',
          title: 'Response Reviewed',
          message: `Your response for ${data.rfp.title} has been ${data.response.status}`,
          timestamp: new Date(data.timestamp),
          read: false,
          actionUrl: `/responses/${data.response.id}`
        });
      });

      newSocket.on('rfp_status_changed', (data) => {
        addNotification({
          id: `status-changed-${Date.now()}`,
          type: 'info',
          title: 'Status Update',
          message: `RFP status changed to ${data.newStatus.replace('_', ' ')}`,
          timestamp: new Date(data.timestamp),
          read: false,
          actionUrl: `/rfps/${data.rfpId}`
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

