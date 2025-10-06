const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'username email avatar isOnline lastSeen')
    .populate('lastMessage')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ lastActivity: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chats
// @desc    Create new chat (one-to-one or group)
// @access  Private
router.post('/', [
  body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('isGroupChat').optional().isBoolean(),
  body('name').optional().isLength({ min: 1, max: 50 }).withMessage('Group name must be between 1 and 50 characters')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participants, isGroupChat = false, name } = req.body;

    // Add current user to participants if not already included
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

    // For one-to-one chats, check if chat already exists
    if (!isGroupChat && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: 2 }
      }).populate('participants', 'username email avatar isOnline lastSeen');

      if (existingChat) {
        return res.json(existingChat);
      }
    }

    // Validate participants exist
    const validParticipants = await User.find({
      _id: { $in: allParticipants }
    });

    if (validParticipants.length !== allParticipants.length) {
      return res.status(400).json({ message: 'One or more participants not found' });
    }

    // Create new chat
    const chat = new Chat({
      participants: allParticipants,
      isGroupChat,
      name: isGroupChat ? name : undefined,
      admin: isGroupChat ? req.user._id : undefined
    });

    await chat.save();

    // Populate and return the chat
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate('admin', 'username email');

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats/:chatId/messages
// @desc    Get messages for a specific chat
// @access  Private
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chats/:chatId/messages
// @desc    Send message to chat
// @access  Private
router.post('/:chatId/messages', [
  body('content').notEmpty().withMessage('Message content is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;

    // Check if user is participant of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create new message
    const message = new Message({
      chat: chatId,
      sender: req.user._id,
      content,
      messageType,
      readBy: [{ user: req.user._id }]
    });

    await message.save();

    // Update chat's last message and activity
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats/users/search
// @desc    Search users for creating chats
// @access  Private
router.get('/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email avatar isOnline')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
