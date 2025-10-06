// Shared utility functions for ChatApp

/**
 * Format date for display in chat
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatChatDate = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = (now - messageDate) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

/**
 * Generate avatar initials from name
 * @param {string} name - Name to generate initials from
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize message content
 * @param {string} content - Message content to sanitize
 * @returns {string} Sanitized content
 */
export const sanitizeMessage = (content) => {
  if (!content) return '';
  
  return content
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if user is online
 * @param {Date|string} lastSeen - Last seen timestamp
 * @param {number} threshold - Threshold in minutes (default: 5)
 * @returns {boolean} True if user is considered online
 */
export const isUserOnline = (lastSeen, threshold = 5) => {
  if (!lastSeen) return false;
  
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
  
  return diffInMinutes <= threshold;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get chat display name
 * @param {Object} chat - Chat object
 * @param {Object} currentUser - Current user object
 * @returns {string} Display name for the chat
 */
export const getChatDisplayName = (chat, currentUser) => {
  if (!chat) return 'Unknown Chat';
  
  if (chat.isGroupChat) {
    return chat.name || 'Unnamed Group';
  }
  
  const otherUser = chat.participants?.find(p => p._id !== currentUser?.id);
  return otherUser?.username || 'Unknown User';
};

/**
 * Check if message is from current user
 * @param {Object} message - Message object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if message is from current user
 */
export const isOwnMessage = (message, currentUser) => {
  return message?.sender?._id === currentUser?.id || message?.sender === currentUser?.id;
};
