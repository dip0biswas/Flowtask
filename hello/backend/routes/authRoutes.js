import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      // Create demo projects and tasks for new user
      try {
        // Project 1: Welcome to FlowTask
        const project1 = await Board.create({
          name: 'Welcome to FlowTask! 🎉',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Welcome to FlowTask!',
            description: 'Drag tasks between columns or use arrow buttons to progress them',
            status: 'To Do',
            boardId: project1._id,
            userId: user._id
          },
          {
            title: 'Create your first task',
            description: 'Click the "+ Add Task" button to create a new task',
            status: 'To Do',
            boardId: project1._id,
            userId: user._id
          },
          {
            title: 'Try the theme toggle',
            description: 'Click the sun/moon icon in the navbar to switch themes',
            status: 'In Progress',
            boardId: project1._id,
            userId: user._id
          },
          {
            title: 'Explore the profile page',
            description: 'Check your statistics and progress in the profile section',
            status: 'Done',
            boardId: project1._id,
            userId: user._id
          }
        ]);

        // Project 2: Work Projects
        const project2 = await Board.create({
          name: 'Work Projects 💼',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Review quarterly reports',
            description: 'Analyze Q3 performance metrics and prepare presentation',
            status: 'To Do',
            boardId: project2._id,
            userId: user._id
          },
          {
            title: 'Team meeting preparation',
            description: 'Prepare agenda for next week\'s team sync',
            status: 'To Do',
            boardId: project2._id,
            userId: user._id
          },
          {
            title: 'Update project documentation',
            description: 'Add new API endpoints to the documentation',
            status: 'In Progress',
            boardId: project2._id,
            userId: user._id
          },
          {
            title: 'Code review',
            description: 'Review pull requests from team members',
            status: 'In Progress',
            boardId: project2._id,
            userId: user._id
          },
          {
            title: 'Deploy to production',
            description: 'Successfully deployed version 2.0 to production',
            status: 'Done',
            boardId: project2._id,
            userId: user._id
          }
        ]);

        // Project 3: Personal Goals
        const project3 = await Board.create({
          name: 'Personal Goals 🎯',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Learn a new technology',
            description: 'Start learning GraphQL for backend development',
            status: 'To Do',
            boardId: project3._id,
            userId: user._id
          },
          {
            title: 'Read a book',
            description: 'Finish reading "Clean Code" by Robert Martin',
            status: 'In Progress',
            boardId: project3._id,
            userId: user._id
          },
          {
            title: 'Morning workout routine',
            description: 'Completed 30-day workout challenge',
            status: 'Done',
            boardId: project3._id,
            userId: user._id
          },
          {
            title: 'Learn touch typing',
            description: 'Improved typing speed to 60 WPM',
            status: 'Done',
            boardId: project3._id,
            userId: user._id
          }
        ]);
      } catch (demoError) {
        console.error('Error creating demo data:', demoError);
        // Continue even if demo data creation fails
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile-picture
// @desc    Update user profile picture
// @access  Private
router.put('/profile-picture', protect, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = profilePicture;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - login
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || picture,
        token: generateToken(user._id)
      });
    } else {
      // New user - register
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Random password (not used for Google auth)
        profilePicture: picture
      });

      // Create demo projects and tasks for new Google user
      try {
        // Project 1: Welcome to FlowTask
        const project1 = await Board.create({
          name: 'Welcome to FlowTask! 🎉',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Welcome to FlowTask!',
            description: 'Drag tasks between columns or use arrow buttons to progress them',
            status: 'To Do',
            boardId: project1._id,
            userId: user._id
          },
          {
            title: 'Signed in with Google!',
            description: 'You can now access your tasks from any device',
            status: 'To Do',
            boardId: project1._id,
            userId: user._id
          },
          {
            title: 'Try the theme toggle',
            description: 'Click the sun/moon icon in the navbar to switch themes',
            status: 'In Progress',
            boardId: project1._id,
            userId: user._id
          }
        ]);

        // Project 2: Work Projects
        const project2 = await Board.create({
          name: 'Work Projects 💼',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Review quarterly reports',
            description: 'Analyze Q3 performance metrics',
            status: 'To Do',
            boardId: project2._id,
            userId: user._id
          },
          {
            title: 'Team meeting preparation',
            description: 'Prepare agenda for next week\'s team sync',
            status: 'In Progress',
            boardId: project2._id,
            userId: user._id
          }
        ]);

        // Project 3: Personal Goals
        const project3 = await Board.create({
          name: 'Personal Goals 🎯',
          userId: user._id
        });

        await Task.create([
          {
            title: 'Learn a new technology',
            description: 'Start learning GraphQL',
            status: 'To Do',
            boardId: project3._id,
            userId: user._id
          },
          {
            title: 'Morning workout routine',
            description: 'Completed 30-day workout challenge',
            status: 'Done',
            boardId: project3._id,
            userId: user._id
          }
        ]);
      } catch (demoError) {
        console.error('Error creating demo data:', demoError);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

export default router;