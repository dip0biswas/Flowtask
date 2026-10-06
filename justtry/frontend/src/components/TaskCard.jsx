import React, { useState } from "react";

const TaskCard = ({ 
  id, 
  title, 
  description, 
  status,
  priority = 'medium',
  dueDate, 
  draggable, 
  onDragStart,
  onProgress,
  onRegress,
  onDelete,
  onEdit,
  showProgress,
  showRegress
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  // Calculate due date status
  const getDueDateStatus = () => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'future';
  };

  const formatDueDate = () => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const dueDateStatus = getDueDateStatus();
  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(id, editTitle, editDescription);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="task-card editing">
        <input
          type="text"
          className="edit-task-title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
        <textarea
          className="edit-task-description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Task description"
          rows="3"
        />
        <div className="edit-actions">
          <button className="save-btn" onClick={handleSave}>✓ Save</button>
          <button className="cancel-btn" onClick={handleCancel}>✕ Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`task-card priority-${priority}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="task-header">
        <h4 className="task-title">
          {priorityIcons[priority]} {title}
        </h4>
        <div className="task-header-actions">
          <button className="edit-task" onClick={() => setIsEditing(true)} title="Edit task">
            ✎
          </button>
          <button className="delete-task" onClick={onDelete} title="Delete task">
            ×
          </button>
        </div>
      </div>
      <p className="task-description">{description}</p>
      
      {dueDate && (
        <div className={`task-due-date ${dueDateStatus}`}>
          <span className="due-icon">📅</span>
          <span className="due-text">
            {dueDateStatus === 'overdue' && 'Overdue: '}
            {dueDateStatus === 'soon' && 'Due soon: '}
            {dueDateStatus === 'future' && 'Due: '}
            {formatDueDate()}
          </span>
        </div>
      )}

      <div className="task-footer">
        <div className="task-actions">
          {showRegress && (
            <button 
              className="task-action-btn regress"
              onClick={onRegress}
              title="Move back"
            >
              ←
            </button>
          )}
          {showProgress && (
            <button 
              className="task-action-btn progress"
              onClick={onProgress}
              title="Move forward"
            >
              →
            </button>
          )}
        </div>
        <span className={`task-badge ${status.replace(' ', '-').toLowerCase()}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
