const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Store active users and their socket IDs
const activeUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  // Socket authentication middleware
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their chat rooms
    const userChats = await Chat.find({ participants: socket.userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Broadcast user online status to their contacts
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      username: socket.user.username
    });

    // Handle joining a chat room
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.username} joined chat ${chatId}`);
    });

    // Handle leaving a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.username} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;

        // Verify user is participant of the chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Create new message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType,
          readBy: [{ user: socket.userId }]
        });

        await message.save();

        // Update chat's last message and activity
        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Populate message for broadcasting
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Broadcast message to all participants in the chat
        io.to(chatId).emit('newMessage', populatedMessage);

        // Send push notification to offline users (placeholder)
        const offlineParticipants = chat.participants.filter(
          participantId => participantId.toString() !== socket.userId && 
          !activeUsers.has(participantId.toString())
        );

        // Here you could implement push notifications for offline users
        console.log(`Message sent to chat ${chatId}, offline participants:`, offlineParticipants.length);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle message read receipts
    socket.on('markAsRead', async (data) => {
      try {
        const { messageId, chatId } = data;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: { user: socket.userId, readAt: new Date() }
          }
        });

        // Broadcast read receipt to other participants
        socket.to(chatId).emit('messageRead', {
          messageId,
          userId: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Remove user from active users
      activeUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast user offline status
      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        username: socket.user.username,
        lastSeen: new Date()
      });
    });

    // Handle getting online users
    socket.on('getOnlineUsers', () => {
      const onlineUsersList = Array.from(activeUsers.values()).map(({ user }) => ({
        id: user._id,
        username: user.username,
        avatar: user.avatar
      }));
      
      socket.emit('onlineUsers', onlineUsersList);
    });
  });
};

module.exports = { handleConnection, activeUsers };
