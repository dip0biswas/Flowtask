import React, { useState } from "react";

const Sidebar = ({ boards, activeBoard, onBoardSelect, onAddProject, onDeleteProject, onRenameProject, trashedBoards, onRestoreProject, onPermanentDelete }) => {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  const handleStartEdit = (boardId, currentName, e) => {
    e.stopPropagation();
    setEditingProjectId(boardId);
    setEditingProjectName(currentName);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingProjectName.trim() && editingProjectName !== boards.find(b => b._id === editingProjectId)?.name) {
      onRenameProject(editingProjectId, editingProjectName.trim());
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Projects</h2>
        <button 
          className="add-project-icon"
          onClick={() => setShowAddProject(true)}
          title="Add new project"
        >
          +
        </button>
      </div>

      {showAddProject && (
        <div className="project-modal">
          <form onSubmit={handleAddProject} className="project-form">
            <input
              type="text"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
            <div className="project-form-buttons">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setShowAddProject(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <ul className="nav-list">
        {boards.map((board) => (
          <li key={board._id} className="nav-item">
            {editingProjectId === board._id ? (
              <form onSubmit={handleSaveEdit} className="edit-project-form">
                <input
                  type="text"
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onBlur={handleSaveEdit}
                  autoFocus
                  className="edit-project-input"
                />
              </form>
            ) : (
              <button
                className={`nav-link ${board._id === activeBoard ? 'active' : ''}`}
                onClick={() => onBoardSelect(board._id)}
              >
                <span className="project-icon">📋</span>
                <span className="project-name">{board.name}</span>
                <div className="project-actions">
                  <button
                    className="edit-project"
                    onClick={(e) => handleStartEdit(board._id, board.name, e)}
                    title="Rename project"
                  >
                    ✎
                  </button>
                  {boards.length > 1 && (
                    <button
                      className="delete-project"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Move "${board.name}" to trash?`)) {
                          onDeleteProject(board._id);
                        }
                      }}
                      title="Move to trash"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </button>
            )}
          </li>
        ))}
      </ul>

      {trashedBoards && trashedBoards.length > 0 && (
        <>
          <div className="sidebar-divider"></div>
          <div className="sidebar-section">
            <button 
              className="trash-header"
              onClick={() => setShowTrash(!showTrash)}
            >
              <span className="trash-icon">🗑️</span>
              <span>Trash ({trashedBoards.length})</span>
              <span className={`trash-arrow ${showTrash ? 'open' : ''}`}>▼</span>
            </button>
            
            {showTrash && (
              <ul className="trash-list">
                {trashedBoards.map((board) => (
                  <li key={board._id} className="trash-item">
                    <span className="trash-project-name">{board.name}</span>
                    <div className="trash-actions">
                      <button
                        className="restore-btn"
                        onClick={() => onRestoreProject(board._id)}
                        title="Restore project"
                      >
                        ↺
                      </button>
                      <button
                        className="permanent-delete-btn"
                        onClick={() => {
                          if (window.confirm(`Permanently delete "${board.name}"? This cannot be undone!`)) {
                            onPermanentDelete(board._id);
                          }
                        }}
                        title="Delete permanently"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
