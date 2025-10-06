import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocket(null);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Connection failed');
      });

      // User status event handlers
      newSocket.on('userOnline', (data) => {
        setOnlineUsers(prev => {
          const exists = prev.find(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, data];
          }
          return prev;
        });
      });

      newSocket.on('userOffline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Typing indicators
      newSocket.on('userTyping', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: {
            ...prev[data.chatId],
            [data.userId]: data.isTyping ? data : null
          }
        }));

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [data.chatId]: {
                ...prev[data.chatId],
                [data.userId]: null
              }
            }));
          }, 3000);
        }
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'An error occurred');
      });

      // Request online users list
      newSocket.emit('getOnlineUsers');

      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setOnlineUsers([]);
      setTypingUsers({});
    }
  }, [isAuthenticated, token, user]);

  // Socket helper functions
  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('joinChat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leaveChat', chatId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('sendMessage', messageData);
    }
  };

  const sendTyping = (chatId, isTyping) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping });
    }
  };

  const markAsRead = (messageId, chatId) => {
    if (socket) {
      socket.emit('markAsRead', { messageId, chatId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId || user.id === userId);
  };

  const getChatTypingUsers = (chatId) => {
    const chatTyping = typingUsers[chatId] || {};
    return Object.values(chatTyping).filter(Boolean);
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    markAsRead,
    isUserOnline,
    getChatTypingUsers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
