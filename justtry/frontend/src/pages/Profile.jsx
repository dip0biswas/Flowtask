import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import '../styles/Profile.css';

const Profile = ({ tasks, projects }) => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  // Calculate statistics
  const allTasks = projects.flatMap(project => 
    Object.values(tasks[project._id] || {}).flat()
  );

  const totalTasks = allTasks.length;
  const todoTasks = allTasks.filter(task => task.status === 'To Do').length;
  const inProgressTasks = allTasks.filter(task => task.status === 'In Progress').length;
  const doneTasks = allTasks.filter(task => task.status === 'Done').length;
  
  const completionRate = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0;

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Use dynamic API URL
          const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
          
          const response = await fetch(`${apiUrl}/auth/profile-picture`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ profilePicture: reader.result })
          });

          if (!response.ok) {
            throw new Error('Failed to upload');
          }

          const data = await response.json();
          
          // Update local user state
          const updatedUser = {
            ...user,
            profilePicture: data.profilePicture
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setUploading(false);
          toast.success('Profile picture updated successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload profile picture: ' + error.message);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <label className="profile-picture-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              disabled={uploading}
            />
            <span className="upload-icon">📷</span>
            {uploading && <span className="uploading">Uploading...</span>}
          </label>
        </div>
        <div className="profile-info">
          <h1>{user?.name || 'User'}</h1>
          <p>{user?.email || 'user@example.com'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-number">{totalTasks}</p>
          </div>
        </div>

        <div className="stat-card todo">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>To Do</h3>
            <p className="stat-number">{todoTasks}</p>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <p className="stat-number">{inProgressTasks}</p>
          </div>
        </div>

        <div className="stat-card done">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{doneTasks}</p>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Overall Progress</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${completionRate}%` }}>
            <span className="progress-text">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="projects-section">
        <h2>Your Projects</h2>
        <div className="project-list">
          {projects.map((project) => {
            const projectTasks = Object.values(tasks[project._id] || {}).flat();
            const projectDone = projectTasks.filter(t => t.status === 'Done').length;
            const projectTotal = projectTasks.length;
            const projectProgress = projectTotal > 0 ? ((projectDone / projectTotal) * 100).toFixed(0) : 0;

            return (
              <div key={project._id} className="project-card">
                <h3>📋 {project.name}</h3>
                <div className="project-stats">
                  <span>{projectTotal} tasks</span>
                  <span className="project-completion">{projectProgress}% complete</span>
                </div>
                <div className="mini-progress-bar">
                  <div style={{ width: `${projectProgress}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
