import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";

const Dashboard = ({ tasks, onTaskMove, onAddTask, onDeleteTask, onEditTask, taskToView, onTaskViewClose }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: "", 
    description: "", 
    status: "To Do",
    priority: "medium",
    dueDate: ""
  });
  const [viewingTask, setViewingTask] = useState(null);
  
  const columns = ["To Do", "In Progress", "Done"];

  // Handle taskToView prop from Reports
  useEffect(() => {
    if (taskToView) {
      setViewingTask(taskToView);
    }
  }, [taskToView]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onTaskMove(taskId, status);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onAddTask(newTask.title, newTask.description, newTask.status, newTask.priority, newTask.dueDate || null);
      setNewTask({ title: "", description: "", status: "To Do", priority: "medium", dueDate: "" });
      setShowAddTask(false);
    }
  };

  const handleTaskProgress = (taskId, currentStatus) => {
    if (currentStatus === "To Do") {
      onTaskMove(taskId, "In Progress");
    } else if (currentStatus === "In Progress") {
      onTaskMove(taskId, "Done");
    }
  };

  const handleTaskRegress = (taskId, currentStatus) => {
    if (currentStatus === "Done") {
      onTaskMove(taskId, "In Progress");
    } else if (currentStatus === "In Progress") {
      onTaskMove(taskId, "To Do");
    }
  };

  const handleCloseTaskView = () => {
    setViewingTask(null);
    if (onTaskViewClose) {
      onTaskViewClose();
    }
  };

  const moveTaskAndUpdateView = (taskId, newStatus) => {
    onTaskMove(taskId, newStatus);
    // If viewing task was moved, update the viewing task status
    if (viewingTask && viewingTask._id === taskId) {
      setViewingTask({ ...viewingTask, status: newStatus });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Task Board</h1>
        <button 
          className="add-task-button"
          onClick={() => setShowAddTask(true)}
        >
          <span>+</span> Add Task
        </button>
      </div>

      {/* Task View Modal (from Reports click) */}
      {viewingTask && (
        <div className="add-task-modal" onClick={handleCloseTaskView}>
          <div className="task-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-view-header">
              <h3>Task Details</h3>
              <button className="close-btn" onClick={handleCloseTaskView}>✕</button>
            </div>
            <div className="task-view-content">
              <div className="task-view-field">
                <label>Title:</label>
                <h2>{viewingTask.title}</h2>
              </div>
              <div className="task-view-field">
                <label>Description:</label>
                <p>{viewingTask.description || 'No description'}</p>
              </div>
              <div className="task-view-field">
                <label>Current Status:</label>
                <span className={`task-badge ${viewingTask.status.replace(' ', '-').toLowerCase()}`}>
                  {viewingTask.status}
                </span>
              </div>
            </div>
            <div className="task-view-actions">
              {viewingTask.status !== "To Do" && (
                <button 
                  className="task-action-btn regress"
                  onClick={() => {
                    moveTaskAndUpdateView(viewingTask._id, viewingTask.status === "Done" ? "In Progress" : "To Do");
                  }}
                >
                  ← Move Back
                </button>
              )}
              {viewingTask.status !== "Done" && (
                <button 
                  className="task-action-btn progress"
                  onClick={() => {
                    moveTaskAndUpdateView(viewingTask._id, viewingTask.status === "To Do" ? "In Progress" : "Done");
                  }}
                >
                  Move Forward →
                </button>
              )}
              <button 
                className="delete-task-btn"
                onClick={() => {
                  if (window.confirm('Delete this task?')) {
                    onDeleteTask(viewingTask._id);
                    handleCloseTaskView();
                  }
                }}
              >
                🗑 Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTask && (
        <div className="add-task-modal" onClick={() => setShowAddTask(false)}>
          <form onSubmit={handleAddTask} className="add-task-form" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Task</h3>
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Task description..."
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            
            <div className="form-row">
              <div className="form-field">
                <label>Status:</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  {columns.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-field">
                <label>Priority:</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="priority-select"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Due Date (optional):</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="date-input"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Create Task</button>
              <button type="button" onClick={() => setShowAddTask(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {columns.map((status) => (
          <div
            key={status}
            className="dashboard-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <h3 className="column-title">{status}</h3>
              <span className="task-count">{tasks[status].length}</span>
            </div>
            <div className="task-list">
              {tasks[status].map((task) => (
                <TaskCard
                  key={task._id}
                  id={task._id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                  dueDate={task.dueDate}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onProgress={() => handleTaskProgress(task._id, status)}
                  onRegress={() => handleTaskRegress(task._id, status)}
                  onDelete={() => onDeleteTask(task._id)}
                  onEdit={onEditTask}
                  showProgress={status !== "Done"}
                  showRegress={status !== "To Do"}
                />
              ))}
              {tasks[status].length === 0 && (
                <div className="empty-state">
                  <p>No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
