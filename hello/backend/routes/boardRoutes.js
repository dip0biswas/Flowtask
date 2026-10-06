import express from 'express';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a board name' });
    }

    const board = await Board.create({
      name,
      userId: req.user._id
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name } = req.body;
    if (name) board.name = name;

    const updatedBoard = await board.save();
    res.json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Soft delete a board (move to trash)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Soft delete: mark as deleted instead of removing
    board.isDeleted = true;
    board.deletedAt = new Date();
    await board.save();

    // Also soft delete associated tasks
    await Task.updateMany(
      { boardId: req.params.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    res.json({ message: 'Board moved to trash', board });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/trash
// @desc    Get all deleted boards (trash)
// @access  Private
router.get('/trash/list', protect, async (req, res) => {
  try {
    const deletedBoards = await Board.find({ 
      userId: req.user._id, 
      isDeleted: true 
    }).sort({ deletedAt: -1 });
    res.json(deletedBoards);
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id/restore
// @desc    Restore a deleted board from trash
// @access  Private
router.put('/:id/restore', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Restore the board
    board.isDeleted = false;
    board.deletedAt = null;
    await board.save();

    // Also restore associated tasks
    await Task.updateMany(
      { boardId: req.params.id },
      { $set: { isDeleted: false, deletedAt: null } }
    );

    res.json({ message: 'Board restored successfully', board });
  } catch (error) {
    console.error('Restore board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id/permanent
// @desc    Permanently delete a board
// @access  Private
router.delete('/:id/permanent', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Permanently delete all tasks associated with this board
    await Task.deleteMany({ boardId: req.params.id });

    // Permanently delete the board
    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;