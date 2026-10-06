# FlowTask - Streamline Your Workflow 🚀

A modern, full-stack task management application built with React and Node.js. FlowTask helps teams and individuals organize their projects with an intuitive drag-and-drop interface, real-time updates, and powerful features.

![FlowTask](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🎯 Project Management**: Create and manage multiple projects with ease
- **📋 Task Board**: Kanban-style board with To Do, In Progress, and Done columns
- **🖱️ Drag & Drop**: Intuitive drag-and-drop interface for moving tasks
- **⚡ Quick Actions**: Progress/regress tasks with arrow buttons
- **👤 User Authentication**: Secure JWT-based authentication
- **📊 Analytics**: View task statistics and completion rates
- **🌓 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive**: Works seamlessly on desktop and mobile devices
- **💾 Database Persistence**: All data stored securely in MongoDB

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Modern gradient-based styling

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 7.5.0** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hello
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (or use the existing one)
# The .env file should contain:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start the backend server
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file (or copy from .env.example)
# The .env file should contain:
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
hello/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Board.js              # Project/Board schema
│   │   └── Task.js               # Task schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── boardRoutes.js        # Board CRUD operations
│   │   └── taskRoutes.js         # Task CRUD operations
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx     # Main task board
    │   │   ├── Navbar.jsx        # Top navigation
    │   │   ├── Sidebar.jsx       # Project sidebar
    │   │   └── TaskCard.jsx      # Individual task card
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Register.jsx      # Registration page
    │   │   └── Profile.jsx       # User profile & stats
    │   ├── services/
    │   │   └── api.js            # API client & utilities
    │   ├── styles/
    │   │   ├── Auth.css          # Authentication styling
    │   │   └── Profile.css       # Profile page styling
    │   ├── App.jsx               # Main app component
    │   ├── App.css               # Global styles
    │   └── main.jsx              # Entry point
    ├── package.json
    ├── vite.config.js
    └── .env
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Boards/Projects
- `GET /api/boards` - Get all user's boards (protected)
- `POST /api/boards` - Create new board (protected)
- `PUT /api/boards/:id` - Update board (protected)
- `DELETE /api/boards/:id` - Delete board (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (optional: ?boardId=xxx) (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

## 🎨 Features Walkthrough

### Authentication
1. Register a new account or login with existing credentials
2. JWT token is stored in localStorage for persistent sessions
3. Protected routes automatically redirect to login if not authenticated

### Project Management
1. Create new projects using the "+" button in the sidebar
2. Switch between projects by clicking on them
3. Delete projects using the "×" button (requires confirmation)

### Task Management
1. Click "Add Task" to create a new task
2. Fill in title, description, and initial status
3. Move tasks by:
   - **Drag & Drop**: Drag tasks between columns
   - **Arrow Buttons**: Use ← → buttons for quick progression
4. Delete tasks using the "×" button on each task card

### Profile & Analytics
1. Navigate to Profile from the user menu
2. View overall task statistics
3. See project-wise breakdowns with completion rates
4. Monitor your productivity with visual progress bars

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flowtask
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/flowtask
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running locally: `mongod`
- Or verify MongoDB Atlas connection string is correct
- Check network connectivity

**Port Already in Use**
- Change the PORT in backend .env file
- Or kill the process using port 5000

### Frontend Issues

**API Connection Error**
- Verify backend server is running on port 5000
- Check VITE_API_URL in frontend .env matches backend URL
- Ensure CORS is enabled in backend

**Build Errors**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Clear Vite cache: `npm run dev -- --force`

## 📝 Available Scripts

### Backend
```bash
npm start          # Start the server
npm run dev        # Start with nodemon (if configured)
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB team
- All contributors and testers

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ using React and Node.js**
