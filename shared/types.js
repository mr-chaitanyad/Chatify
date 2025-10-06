// Shared types and constants for ChatApp

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Authentication
  AUTH_ERROR: 'auth_error',
  
  // Chat Management
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  
  // Messaging
  SEND_MESSAGE: 'sendMessage',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_READ: 'messageRead',
  MARK_AS_READ: 'markAsRead',
  
  // Typing Indicators
  TYPING: 'typing',
  USER_TYPING: 'userTyping',
  
  // User Status
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  GET_ONLINE_USERS: 'getOnlineUsers',
  ONLINE_USERS: 'onlineUsers',
  
  // Errors
  ERROR: 'error'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Chats
  CHATS: '/api/chats',
  CHAT_MESSAGES: (chatId) => `/api/chats/${chatId}/messages`,
  SEARCH_USERS: '/api/chats/users/search',
  
  // Health Check
  HEALTH: '/api/health'
};

// User Status
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away'
};

// Chat Types
export const CHAT_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group'
};

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  GROUP_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50
  },
  MESSAGE: {
    MAX_LENGTH: 1000
  }
};

// Default Values
export const DEFAULTS = {
  AVATAR: '👤',
  GROUP_AVATAR: '👥',
  MESSAGE_LIMIT: 50,
  SEARCH_MIN_LENGTH: 2,
  TYPING_TIMEOUT: 1000
};
