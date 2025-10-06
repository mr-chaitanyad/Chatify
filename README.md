# ChatApp - Real-time Chat Application

A modern, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring WebSocket communication, JWT authentication, and a WhatsApp-like UI.

## 🚀 Features

- **Real-time messaging** with Socket.io
- **User authentication** with JWT and bcrypt
- **One-to-one and group chats**
- **Online/offline status** indicators
- **Typing indicators**
- **Message read receipts**
- **Chat history** stored in MongoDB Atlas
- **Responsive design** with Tailwind CSS
- **Dark/Light mode** toggle
- **WhatsApp-like UI** with sidebar and chat window
- **User search** for creating new chats
- **Message timestamps** and formatting

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB Atlas** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **Socket.io-client** - Real-time client
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Heroicons** - Icons
- **date-fns** - Date formatting

## 📁 Project Structure

```
ChatApp/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chats.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   └── Chat/
│   │   │       ├── ChatApp.js
│   │   │       ├── ChatSidebar.js
│   │   │       ├── ChatWindow.js
│   │   │       └── NewChatModal.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── SocketContext.js
│   │   │   └── ThemeContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── shared/
│   ├── types.js
│   └── utils.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatApp
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   NODE_ENV=development
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the development servers**
   
   Backend (from backend directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from frontend directory, in a new terminal):
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and add it to the `.env` file
5. Whitelist your IP address or use 0.0.0.0/0 for development

### Environment Variables

#### Backend (.env)
```env
PORT=5000                           # Server port
MONGODB_URI=your_mongodb_uri        # MongoDB Atlas connection string
JWT_SECRET=your_jwt_secret          # JWT signing secret (make it long and random)
NODE_ENV=development                # Environment (development/production)
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS (production only)
```

#### Frontend (.env.local) - Optional
```env
REACT_APP_SERVER_URL=http://localhost:5000  # Backend URL (for production)
```

## 📱 Usage

### Authentication
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your email and password
3. **Logout**: Use the settings menu to log out

### Chatting
1. **Start a new chat**: Click the "+" button in the sidebar
2. **Search users**: Type at least 2 characters to search for users
3. **Create direct chat**: Select a user and click "Create Chat"
4. **Create group chat**: Toggle to group mode, select multiple users, enter group name
5. **Send messages**: Type in the message input and press Enter or click send
6. **View online status**: Green dot indicates online users
7. **Typing indicators**: See when others are typing
8. **Dark/Light mode**: Toggle in the settings menu

## 🔒 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT authentication** with 7-day expiration
- **Input validation** and sanitization
- **CORS protection**
- **Rate limiting** ready (can be added)
- **SQL injection protection** (NoSQL injection via Mongoose)

## 🎨 UI/UX Features

- **Responsive design** - Works on desktop, tablet, and mobile
- **Dark/Light mode** - Automatic system preference detection
- **WhatsApp-like interface** - Familiar and intuitive
- **Real-time updates** - Instant message delivery
- **Typing indicators** - See when users are typing
- **Online status** - Visual indicators for user presence
- **Message timestamps** - Smart time formatting
- **Smooth animations** - Tailwind CSS transitions

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is accessible from your hosting platform
3. Update CORS settings for your frontend domain
4. Deploy the backend folder

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Set `REACT_APP_SERVER_URL` to your backend URL
3. Deploy the build folder

### Production Considerations

- Use a process manager like PM2 for the backend
- Set up SSL certificates (Let's Encrypt)
- Configure proper CORS origins
- Set up monitoring and logging
- Use a CDN for static assets
- Implement rate limiting
- Set up database backups

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Add test scripts as needed
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- File upload not yet implemented (placeholder UI exists)
- Emoji picker not yet implemented (placeholder UI exists)
- Push notifications for offline users not implemented
- Message editing/deletion not yet implemented

## 🔮 Future Enhancements

- File and image sharing
- Voice messages
- Video calls
- Message reactions
- Message forwarding
- User profiles with avatars
- Chat themes
- Message search
- Push notifications
- Message encryption
- Admin panel for group chats
- Chat export functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- Socket.io team for real-time communication
- Tailwind CSS for the amazing utility-first CSS framework
- React team for the excellent UI library
- MongoDB team for the flexible database
- All open-source contributors who made this project possible

---

**Happy Chatting! 💬**
