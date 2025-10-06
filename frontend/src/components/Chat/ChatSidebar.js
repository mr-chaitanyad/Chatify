import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { format, isToday, isYesterday } from 'date-fns';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const ChatSidebar = ({ chats, selectedChat, onChatSelect, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const { isDark, toggleTheme } = useTheme();

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const chatName = chat.isGroupChat 
      ? chat.name 
      : chat.participants.find(p => p._id !== user.id)?.username || '';
    
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatLastMessageTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'dd/MM/yyyy');
    }
  };

  const getChatDisplayInfo = (chat) => {
    if (chat.isGroupChat) {
      return {
        name: chat.name,
        avatar: '👥',
        isOnline: false
      };
    } else {
      const otherUser = chat.participants.find(p => p._id !== user.id);
      return {
        name: otherUser?.username || 'Unknown User',
        avatar: otherUser?.avatar || '👤',
        isOnline: isUserOnline(otherUser?._id)
      };
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-whatsapp-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {user?.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isUserOnline(user?.id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewChat}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="New Chat"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                  <div className="py-1">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {isDark ? (
                        <SunIcon className="w-4 h-4 mr-3" />
                      ) : (
                        <MoonIcon className="w-4 h-4 mr-3" />
                      )}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No chats found' : 'No chats yet. Start a new conversation!'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const { name, avatar, isOnline } = getChatDisplayInfo(chat);
            const isSelected = selectedChat?._id === chat._id;
            
            return (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat)}
                className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-whatsapp-light dark:bg-gray-600' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl">
                      {avatar}
                    </div>
                    {!chat.isGroupChat && isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {name}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLastMessageTime(chat.lastActivity)}
                        </span>
                      )}
                    </div>
                    
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
