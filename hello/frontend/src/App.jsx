import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { boardsAPI, tasksAPI } from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import "./App.css";

// Guest Mode Demo Data
const getGuestDemoData = () => {
  return {
    projects: [
      { _id: 'guest-1', name: '🎯 Demo Project 1', userId: 'guest' },
      { _id: 'guest-2', name: '💼 Work Tasks', userId: 'guest' },
      { _id: 'guest-3', name: '🏠 Personal', userId: 'guest' }
    ],
    tasks: {
      'guest-1': {
        "To Do": [
          { _id: 't1', title: 'Review design mockups', description: 'Check new UI designs', boardId: 'guest-1', status: 'To Do' },
          { _id: 't2', title: 'Update documentation', description: 'Add API endpoints', boardId: 'guest-1', status: 'To Do' }
        ],
        "In Progress": [
          { _id: 't3', title: 'Build new feature', description: 'Working on authentication', boardId: 'guest-1', status: 'In Progress' }
        ],
        "Done": [
          { _id: 't4', title: 'Setup project', description: 'Initial configuration', boardId: 'guest-1', status: 'Done' }
        ]
      },
      'guest-2': {
        "To Do": [
          { _id: 't5', title: 'Team meeting prep', description: 'Prepare presentation', boardId: 'guest-2', status: 'To Do' }
        ],
        "In Progress": [
          { _id: 't6', title: 'Code review', description: 'Review pull requests', boardId: 'guest-2', status: 'In Progress' }
        ],
        "Done": [
          { _id: 't7', title: 'Sprint planning', description: 'Plan next sprint', boardId: 'guest-2', status: 'Done' }
        ]
      },
      'guest-3': {
        "To Do": [
          { _id: 't8', title: 'Grocery shopping', description: 'Buy weekly groceries', boardId: 'guest-3', status: 'To Do' }
        ],
        "In Progress": [],
        "Done": [
          { _id: 't9', title: 'Organize workspace', description: 'Clean desk', boardId: 'guest-3', status: 'Done' }
        ]
      }
    }
  };
};

// Protected Route Component - Now allows guest mode
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const isGuestMode = localStorage.getItem('guestMode') === 'true';
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (user || isGuestMode) ? children : <Navigate to="/login" />;
};

// Main App Component
function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [activeBoard, setActiveBoard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [trashedProjects, setTrashedProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [taskToView, setTaskToView] = useState(null);

  // Fetch boards and tasks from backend
  useEffect(() => {
    const fetchData = async () => {
      // Check for guest mode
      const isGuestMode = localStorage.getItem('guestMode') === 'true';
      
      if (!user && !isGuestMode) {
        setLoading(false);
        return;
      }
      
      // If guest mode, use demo data
      if (isGuestMode && !user) {
        const guestData = getGuestDemoData();
        setProjects(guestData.projects);
        setActiveBoard(guestData.projects[0]._id);
        setTasks(guestData.tasks);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch boards
        const boardsData = await boardsAPI.getAll();
        
        // Fetch trashed boards
        const trashedData = await boardsAPI.getTrash();
        setTrashedProjects(trashedData);
        
        if (boardsData.length === 0) {
          // Create a default board if none exist
          const defaultBoard = await boardsAPI.create("My First Project");
          boardsData.push(defaultBoard);
        }
        
        setProjects(boardsData);
        setActiveBoard(boardsData[0]._id);
        
        // Fetch all tasks
        const tasksData = await tasksAPI.getAll();
        
        // Organize tasks by board and status
        const organizedTasks = {};
        boardsData.forEach(board => {
          organizedTasks[board._id] = {
            "To Do": [],
            "In Progress": [],
            "Done": []
          };
        });
        
        tasksData.forEach(task => {
          if (organizedTasks[task.boardId]) {
            organizedTasks[task.boardId][task.status].push(task);
          }
        });
        
        setTasks(organizedTasks);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Re-fetch when user changes or guest mode is enabled

  // Watch for guest mode changes
  useEffect(() => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    if (isGuestMode && !user && projects.length === 0) {
      const guestData = getGuestDemoData();
      setProjects(guestData.projects);
      setActiveBoard(guestData.projects[0]._id);
      setTasks(guestData.tasks);
      setLoading(false);
    }
  }, []); // Run once on mount

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(!dark);

  const handleBoardSelect = (board) => {
    setActiveBoard(board);
    // Always navigate to dashboard when selecting a project
    navigate('/dashboard');
  };

  const handleActivityClick = (task, projectId) => {
    // Set the active board to the task's project
    setActiveBoard(projectId);
    // Set the task to view (this will trigger opening the modal)
    setTaskToView(task);
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleAddProject = async (projectName) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - just add to local state
    if (isGuestMode && !user) {
      const newBoard = {
        _id: 'guest-board-' + Date.now(),
        name: projectName,
        userId: 'guest'
      };
      setProjects([...projects, newBoard]);
      setTasks({
        ...tasks,
        [newBoard._id]: {
          "To Do": [],
          "In Progress": [],
          "Done": []
        }
      });
      setActiveBoard(newBoard._id);
      // Navigate to dashboard when creating new project
      navigate('/dashboard');
      return;
    }
    
    try {
      const newBoard = await boardsAPI.create(projectName);
      setProjects([...projects, newBoard]);
      setTasks({
        ...tasks,
        [newBoard._id]: {
          "To Do": [],
          "In Progress": [],
          "Done": []
        }
      });
      setActiveBoard(newBoard._id);
      // Navigate to dashboard when creating new project
      navigate('/dashboard');
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = async (boardId) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (projects.length > 1) {
      // Guest mode - just remove from local state
      if (isGuestMode && !user) {
        const newProjects = projects.filter(p => p._id !== boardId);
        const newTasks = { ...tasks };
        delete newTasks[boardId];
        setProjects(newProjects);
        setTasks(newTasks);
        if (activeBoard === boardId) {
          setActiveBoard(newProjects[0]._id);
        }
        return;
      }
      
      try {
        const deletedBoard = await boardsAPI.delete(boardId);
        const newProjects = projects.filter(p => p._id !== boardId);
        setProjects(newProjects);
        
        // Add to trash
        setTrashedProjects([...trashedProjects, deletedBoard.board]);
        
        // Keep tasks in state for potential restore
        if (activeBoard === boardId && newProjects.length > 0) {
          setActiveBoard(newProjects[0]._id);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast.error('Failed to move project to trash. Please try again.');
      }
    }
  };

  const handleRenameProject = async (boardId, newName) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - update local state
    if (isGuestMode && !user) {
      setProjects(projects.map(p => 
        p._id === boardId ? { ...p, name: newName } : p
      ));
      return;
    }
    
    try {
      const updatedBoard = await boardsAPI.update(boardId, newName);
      setProjects(projects.map(p => 
        p._id === boardId ? updatedBoard : p
      ));
    } catch (error) {
      console.error('Failed to rename project:', error);
      toast.error('Failed to rename project. Please try again.');
    }
  };

  const handleRestoreProject = async (boardId) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (isGuestMode && !user) return; // Guest mode doesn't support trash
    
    try {
      const restoredBoard = await boardsAPI.restore(boardId);
      
      // Remove from trash
      setTrashedProjects(trashedProjects.filter(p => p._id !== boardId));
      
      // Add back to projects
      setProjects([...projects, restoredBoard.board]);
      
      // Initialize tasks structure for restored board
      if (!tasks[boardId]) {
        setTasks({
          ...tasks,
          [boardId]: {
            "To Do": [],
            "In Progress": [],
            "Done": []
          }
        });
      }
      
      // Fetch tasks for the restored board
      const tasksData = await tasksAPI.getAll(boardId);
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        newTasks[boardId] = {
          "To Do": [],
          "In Progress": [],
          "Done": []
        };
        tasksData.forEach(task => {
          newTasks[boardId][task.status].push(task);
        });
        return newTasks;
      });
      
      // Set as active board and navigate to dashboard
      setActiveBoard(boardId);
      navigate('/dashboard');
      
      toast.success('Project restored successfully!');
    } catch (error) {
      console.error('Failed to restore project:', error);
      toast.error('Failed to restore project. Please try again.');
    }
  };

  const handlePermanentDelete = async (boardId) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (isGuestMode && !user) return; // Guest mode doesn't support trash
    
    try {
      await boardsAPI.permanentDelete(boardId);
      
      // Remove from trash
      setTrashedProjects(trashedProjects.filter(p => p._id !== boardId));
      
      // Remove tasks from state
      const newTasks = { ...tasks };
      delete newTasks[boardId];
      setTasks(newTasks);
      
      toast.success('Project permanently deleted.');
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleTaskMove = async (taskId, newStatus) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - just move in local state
    if (isGuestMode && !user) {
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        // Find and remove task from old status
        let movedTask = null;
        Object.keys(board).forEach(status => {
          const taskIndex = board[status].findIndex(task => task._id === taskId);
          if (taskIndex !== -1) {
            movedTask = board[status][taskIndex];
            board[status] = board[status].filter(task => task._id !== taskId);
          }
        });
        
        // Add task to new status
        if (movedTask) {
          movedTask.status = newStatus;
          board[newStatus].push(movedTask);
        }
        
        return newTasks;
      });
      return;
    }
    
    try {
      const updatedTask = await tasksAPI.update(taskId, { status: newStatus });
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        // Remove task from old status
        Object.keys(board).forEach(status => {
          board[status] = board[status].filter(task => task._id !== taskId);
        });
        
        // Add task to new status
        board[newStatus].push(updatedTask);
        
        return newTasks;
      });
      toast.success('Task moved successfully!');
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('Failed to move task. Please try again.');
    }
  };

  const handleAddTask = async (title, description, status, priority = 'medium', dueDate = null) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - just add to local state
    if (isGuestMode && !user) {
      const newTask = {
        _id: 'guest-task-' + Date.now(),
        title,
        description,
        status,
        priority,
        dueDate,
        boardId: activeBoard
      };
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        if (!newTasks[activeBoard]) {
          newTasks[activeBoard] = { "To Do": [], "In Progress": [], "Done": [] };
        }
        newTasks[activeBoard][status].push(newTask);
        return newTasks;
      });
      return;
    }
    
    try {
      const newTask = await tasksAPI.create({
        title,
        description,
        status,
        priority,
        dueDate,
        boardId: activeBoard
      });
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        newTasks[activeBoard][status].push(newTask);
        return newTasks;
      });
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Confirmation dialog
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - just remove from local state
    if (isGuestMode && !user) {
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        Object.keys(board).forEach(status => {
          board[status] = board[status].filter(task => task._id !== taskId);
        });

        return newTasks;
      });
      return;
    }
    
    try {
      await tasksAPI.delete(taskId);
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        Object.keys(board).forEach(status => {
          board[status] = board[status].filter(task => task._id !== taskId);
        });

        return newTasks;
      });
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = async (taskId, newTitle, newDescription) => {
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    // Guest mode - update in local state
    if (isGuestMode && !user) {
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        Object.keys(board).forEach(status => {
          board[status] = board[status].map(task => 
            task._id === taskId 
              ? { ...task, title: newTitle, description: newDescription }
              : task
          );
        });
        
        return newTasks;
      });
      return;
    }
    
    try {
      const updatedTask = await tasksAPI.update(taskId, {
        title: newTitle,
        description: newDescription
      });
      
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const board = newTasks[activeBoard];
        
        Object.keys(board).forEach(status => {
          board[status] = board[status].map(task => 
            task._id === taskId ? updatedTask : task
          );
        });
        
        return newTasks;
      });
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const isGuestMode = !user && localStorage.getItem('guestMode') === 'true';
  
  if (!user && !isGuestMode) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your projects...</p>
      </div>
    );
  }

  const activeBoardData = projects.find(p => p._id === activeBoard);

  return (
    <div className={`app-container ${dark ? 'dark-theme' : 'light-theme'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: dark ? '#1e293b' : '#ffffff',
            color: dark ? '#f1f5f9' : '#1e293b',
            border: '1px solid',
            borderColor: dark ? '#334155' : '#e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Sidebar 
        boards={projects}
        activeBoard={activeBoard}
        onBoardSelect={handleBoardSelect}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        trashedBoards={trashedProjects}
        onRestoreProject={handleRestoreProject}
        onPermanentDelete={handlePermanentDelete}
      />
      <div className="main-wrapper">
        <Navbar 
          toggleTheme={toggleTheme} 
          isDark={dark}
          activeBoard={activeBoardData?.name || ''}
        />
        <Routes>
          <Route path="/dashboard" element={
            <main className="main-content">
              {activeBoard && tasks[activeBoard] ? (
                <Dashboard 
                  tasks={tasks[activeBoard]}
                  onTaskMove={handleTaskMove}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  taskToView={taskToView}
                  onTaskViewClose={() => setTaskToView(null)}
                />
              ) : (
                <div className="no-board">No board selected</div>
              )}
            </main>
          } />
          <Route path="/profile" element={
            <main className="main-content">
              <Profile tasks={tasks} projects={projects} />
            </main>
          } />
          <Route path="/reports" element={
            <main className="main-content">
              <Reports 
                tasks={tasks} 
                projects={projects} 
                onActivityClick={handleActivityClick}
              />
            </main>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

// Main App with Router and Auth
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
