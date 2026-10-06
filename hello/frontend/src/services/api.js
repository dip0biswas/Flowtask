// Smart API URL - uses same host as frontend (works on any IP)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Automatically use the same host as the frontend
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${host}:5000/api`;
};

const API_URL = getApiUrl();

// Helper to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper to set headers
const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },
};

// Boards API
export const boardsAPI = {
  getAll: async () => {
    return apiRequest('/boards', {
      method: 'GET',
    });
  },

  create: async (name) => {
    return apiRequest('/boards', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id, name) => {
    return apiRequest(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id) => {
    return apiRequest(`/boards/${id}`, {
      method: 'DELETE',
    });
  },

  // Trash/Restore functionality
  getTrash: async () => {
    return apiRequest('/boards/trash/list', {
      method: 'GET',
    });
  },

  restore: async (id) => {
    return apiRequest(`/boards/${id}/restore`, {
      method: 'PUT',
    });
  },

  permanentDelete: async (id) => {
    return apiRequest(`/boards/${id}/permanent`, {
      method: 'DELETE',
    });
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (boardId = null) => {
    const query = boardId ? `?boardId=${boardId}` : '';
    return apiRequest(`/tasks${query}`, {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  create: async (taskData) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  update: async (id, taskData) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Helper to store token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export default {
  auth: authAPI,
  boards: boardsAPI,
  tasks: tasksAPI,
  setAuthToken,
};
