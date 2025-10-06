import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { format, isToday, isYesterday } from 'date-fns';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { user } = useAuth();
  const { 
    socket, 
    joinChat, 
    leaveChat, 
    sendMessage, 
    sendTyping, 
    isUserOnline,
    getChatTypingUsers 
  } = useSocket();

  // Load messages when chat changes
  useEffect(() => {
    if (chat) {
      loadMessages();
      joinChat(chat._id);
      
      return () => {
        leaveChat(chat._id);
      };
    }
  }, [chat]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('messageRead', handleMessageRead);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageRead', handleMessageRead);
      };
    }
  }, [socket, chat]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!chat) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/chats/${chat._id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chat === chat?._id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleMessageRead = (data) => {
    setMessages(prev => prev.map(msg => 
      msg._id === data.messageId 
        ? {
            ...msg,
            readBy: [...(msg.readBy || []), { user: data.userId, readAt: data.readAt }]
          }
        : msg
    ));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chat) return;
    
    const messageData = {
      chatId: chat._id,
      content: newMessage.trim(),
      messageType: 'text'
    };
    
    sendMessage(messageData);
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      sendTyping(chat._id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      sendTyping(chat._id, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(chat._id, false);
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm');
    }
  };

  const getChatDisplayInfo = () => {
    if (!chat) return { name: '', isOnline: false };
    
    if (chat.isGroupChat) {
      return {
        name: chat.name,
        isOnline: false,
        participantCount: chat.participants.length
      };
    } else {
      const otherUser = chat.participants.find(p => p._id !== user.id);
      return {
        name: otherUser?.username || 'Unknown User',
        isOnline: isUserOnline(otherUser?._id)
      };
    }
  };

  const getTypingIndicator = () => {
    const typingUsers = getChatTypingUsers(chat?._id);
    const otherTypingUsers = typingUsers.filter(u => u.userId !== user.id);
    
    if (otherTypingUsers.length === 0) return null;
    
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].username} is typing...`;
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-whatsapp-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L2 22l5.65-1.05C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to ChatApp
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  const { name, isOnline, participantCount } = getChatDisplayInfo();
  const typingIndicator = getTypingIndicator();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {chat.isGroupChat ? '👥' : '👤'}
            </div>
            {!chat.isGroupChat && isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chat.isGroupChat 
                ? `${participantCount} participants`
                : isOnline ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-primary"></div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user.id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && chat.isGroupChat && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                      {message.sender.username}
                    </p>
                  )}
                  
                  <div
                    className={`chat-bubble ${
                      isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingIndicator && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-received">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">{typingIndicator}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-whatsapp-primary text-white rounded-full hover:bg-whatsapp-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
