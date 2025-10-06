import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatApp = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const { user } = useAuth();
  const { socket } = useSocket();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    // Update chat list with new message
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === message.chat) {
          return {
            ...chat,
            lastMessage: message,
            lastActivity: message.createdAt
          };
        }
        return chat;
      });
      
      // Sort chats by last activity
      return updatedChats.sort((a, b) => 
        new Date(b.lastActivity) - new Date(a.lastActivity)
      );
    });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (newChat) => {
    setChats(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chats...</p>
        </div>
      </div>
    );
  }

  // Mobile view logic
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        {selectedChat ? (
          <div className="h-full flex flex-col">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-whatsapp-primary hover:text-whatsapp-secondary font-medium"
              >
                ← Back to Chats
              </button>
            </div>
            <ChatWindow chat={selectedChat} />
          </div>
        ) : (
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
          />
        )}
        
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      
      <ChatWindow chat={selectedChat} />
      
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default ChatApp;
