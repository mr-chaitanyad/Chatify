import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSearchTerm('');
      setSearchResults([]);
      setSelectedUsers([]);
      setIsGroupChat(false);
      setGroupName('');
    }
  }, [isOpen]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setSearching(true);
      const response = await axios.get(`/api/chats/users/search?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    if (selectedUsers.find(u => u._id === selectedUser._id)) {
      setSelectedUsers(prev => prev.filter(u => u._id !== selectedUser._id));
    } else {
      setSelectedUsers(prev => [...prev, selectedUser]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (isGroupChat && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      
      const chatData = {
        participants: selectedUsers.map(u => u._id),
        isGroupChat,
        name: isGroupChat ? groupName.trim() : undefined
      };

      const response = await axios.post('/api/chats', chatData);
      
      toast.success(isGroupChat ? 'Group created successfully!' : 'Chat created successfully!');
      onChatCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Create chat error:', error);
      const message = error.response?.data?.message || 'Failed to create chat';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Chat
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Type Toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsGroupChat(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isGroupChat
                  ? 'bg-whatsapp-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Direct Chat
            </button>
            <button
              onClick={() => setIsGroupChat(true)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isGroupChat
                  ? 'bg-whatsapp-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Group Chat
            </button>
          </div>
        </div>

        {/* Group Name Input */}
        {isGroupChat && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected ({selectedUsers.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((selectedUser) => (
                <div
                  key={selectedUser._id}
                  className="flex items-center bg-whatsapp-primary text-white px-2 py-1 rounded-full text-sm"
                >
                  <span>{selectedUser.username}</span>
                  <button
                    onClick={() => handleUserSelect(selectedUser)}
                    className="ml-2 hover:bg-whatsapp-secondary rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-whatsapp-primary mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Enter at least 2 characters to search for users</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((searchUser) => {
                const isSelected = selectedUsers.find(u => u._id === searchUser._id);
                
                return (
                  <div
                    key={searchUser._id}
                    onClick={() => handleUserSelect(searchUser)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-whatsapp-light dark:bg-gray-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {searchUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {searchUser.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchUser.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-whatsapp-primary rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0 || loading || (isGroupChat && !groupName.trim())}
            className="px-4 py-2 bg-whatsapp-primary text-white rounded-lg hover:bg-whatsapp-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              `Create ${isGroupChat ? 'Group' : 'Chat'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
