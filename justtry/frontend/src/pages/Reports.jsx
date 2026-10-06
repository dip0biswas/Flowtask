import React, { useMemo } from 'react';
import '../styles/Reports.css';

const Reports = ({ tasks, projects, onActivityClick }) => {
  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;
    const projectStats = [];
    const recentActivity = [];

    // Process each project
    projects.forEach(project => {
      if (tasks[project._id]) {
        const projectTasks = tasks[project._id];
        const todo = projectTasks["To Do"]?.length || 0;
        const inProgress = projectTasks["In Progress"]?.length || 0;
        const done = projectTasks["Done"]?.length || 0;
        const total = todo + inProgress + done;

        totalTasks += total;
        completedTasks += done;
        inProgressTasks += inProgress;
        todoTasks += todo;

        projectStats.push({
          id: project._id,
          name: project.name,
          todo,
          inProgress,
          done,
          total,
          completionRate: total > 0 ? Math.round((done / total) * 100) : 0
        });

        // Add to recent activity (all tasks)
        Object.keys(projectTasks).forEach(status => {
          projectTasks[status].forEach(task => {
            recentActivity.push({
              ...task,
              projectName: project.name,
              projectId: project._id
            });
          });
        });
      }
    });

    // Sort recent activity by creation date (newest first)
    recentActivity.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Calculate overall completion rate
    const overallCompletion = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Calculate productivity score (weighted)
    const productivityScore = totalTasks > 0
      ? Math.round((completedTasks * 3 + inProgressTasks * 1.5 + todoTasks * 0.5) / totalTasks)
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overallCompletion,
      productivityScore,
      projectStats,
      recentActivity: recentActivity.slice(0, 10) // Last 10 activities
    };
  }, [tasks, projects]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return '✅';
      case 'In Progress':
        return '🔄';
      case 'To Do':
        return '📝';
      default:
        return '📋';
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Progress Reports & Analytics</h1>
        <p className="reports-subtitle">Track your productivity and project progress</p>
      </div>

      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card overview-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.totalTasks}</p>
          </div>
        </div>

        <div className="stat-card overview-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completedTasks}</p>
          </div>
        </div>

        <div className="stat-card overview-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p className="stat-number">{stats.inProgressTasks}</p>
          </div>
        </div>

        <div className="stat-card overview-todo">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>To Do</h3>
            <p className="stat-number">{stats.todoTasks}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="progress-section">
        <h2>Overall Completion Rate</h2>
        <div className="progress-visual">
          <div className="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${stats.overallCompletion * 5.03} 502.4`}
                transform="rotate(-90 100 100)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0b5fff" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-percentage">{stats.overallCompletion}%</div>
          </div>
          <div className="progress-details">
            <h3>Productivity Overview</h3>
            <div className="detail-item">
              <span>Completion Rate:</span>
              <strong>{stats.overallCompletion}%</strong>
            </div>
            <div className="detail-item">
              <span>Total Projects:</span>
              <strong>{projects.length}</strong>
            </div>
            <div className="detail-item">
              <span>Active Tasks:</span>
              <strong>{stats.inProgressTasks + stats.todoTasks}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="project-breakdown">
        <h2>Project Performance</h2>
        <div className="project-cards">
          {stats.projectStats.map(project => (
            <div key={project.id} className="project-report-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`completion-badge ${project.completionRate === 100 ? 'complete' : ''}`}>
                  {project.completionRate}%
                </span>
              </div>
              <div className="project-progress-bar">
                <div 
                  className="project-progress-fill"
                  style={{ width: `${project.completionRate}%` }}
                ></div>
              </div>
              <div className="project-task-stats">
                <div className="task-stat">
                  <span className="stat-label">📝 To Do</span>
                  <span className="stat-value">{project.todo}</span>
                </div>
                <div className="task-stat">
                  <span className="stat-label">🔄 In Progress</span>
                  <span className="stat-value">{project.inProgress}</span>
                </div>
                <div className="task-stat">
                  <span className="stat-label">✅ Done</span>
                  <span className="stat-value">{project.done}</span>
                </div>
              </div>
              <div className="project-total">
                <strong>Total Tasks: {project.total}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <div className="no-activity">
            <p>No recent activity to display</p>
          </div>
        ) : (
          <div className="activity-list">
            {stats.recentActivity.map(task => (
              <div 
                key={task._id} 
                className="activity-item clickable"
                onClick={() => onActivityClick(task, task.projectId)}
                title="Click to view task details"
              >
                <div className="activity-icon">{getStatusIcon(task.status)}</div>
                <div className="activity-content">
                  <h4>{task.title}</h4>
                  <p className="activity-project">📋 {task.projectName}</p>
                  {task.description && (
                    <p className="activity-description">{task.description}</p>
                  )}
                </div>
                <div className={`activity-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
