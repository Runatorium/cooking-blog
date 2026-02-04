import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development.
// Normalize: Render's fromService may give service name (e.g. sardegna-ricette-backend) or
// hostname (xxx.onrender.com). Without a protocol, browsers treat baseURL as relative path,
// so we must produce an absolute URL with https and /api.
function normalizeApiBaseUrl(value) {
  if (!value || typeof value !== 'string') return 'http://localhost:8000/api';
  let trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const url = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
    return url.endsWith('/api') ? url : `${url.replace(/\/?$/, '')}/api`;
  }
  // Render fromService "host" can be the service name only (no dot) — treat as *.onrender.com
  if (!trimmed.includes('.')) {
    trimmed = `${trimmed}.onrender.com`;
  }
  const base = `https://${trimmed}`;
  return base.endsWith('/api') ? base : `${base.replace(/\/?$/, '')}/api`;
}
const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors and sanitize error responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Sanitize error response to remove technical details
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // If error contains technical details, replace with user-friendly message
      const errorString = JSON.stringify(errorData);
      if (errorString.includes('Traceback') || 
          errorString.includes('File') || 
          errorString.includes('line') ||
          errorString.length > 500) {
        error.response.data = {
          error: 'Si è verificato un errore. Riprova più tardi.',
          detail: null
        };
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (email, name, password, password2) => {
    const response = await api.post('/auth/register/', {
      email,
      name,
      password,
      password2,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export const recipeAPI = {
  getRecipes: async (searchQuery = '', category = '', glutenFree = null, lactoseFree = null, isSardinian = null, redazioneOnly = false, orderBy = '') => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (category) params.append('category', category);
    if (glutenFree !== null) params.append('gluten_free', glutenFree.toString());
    if (lactoseFree !== null) params.append('lactose_free', lactoseFree.toString());
    if (isSardinian !== null) params.append('is_sardinian', isSardinian.toString());
    if (redazioneOnly) params.append('redazione_only', 'true');
    if (orderBy && (orderBy === 'likes' || orderBy === 'most_liked')) params.append('order_by', orderBy);
    
    const queryString = params.toString();
    const url = `/recipes/${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getCategoryCounts: async () => {
    const response = await api.get('/recipes/category_counts/');
    return response.data;
  },

  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}/`);
    return response.data;
  },

  getMyRecipes: async () => {
    const response = await api.get('/recipes/my/');
    return response.data;
  },

  createRecipe: async (recipeData) => {
    const formData = new FormData();
    formData.append('title', recipeData.title);
    formData.append('description', recipeData.description);
    formData.append('category', recipeData.category);
    formData.append('prep_time', recipeData.prepTime.toString());
    formData.append('gluten_free', recipeData.glutenFree ? 'true' : 'false');
    formData.append('lactose_free', recipeData.lactoseFree ? 'true' : 'false');
    formData.append('is_sardinian', recipeData.isSardinian ? 'true' : 'false');
    if (recipeData.finalComment && recipeData.finalComment.trim()) {
      formData.append('final_comment', recipeData.finalComment.trim());
    }
    
    // Add ingredients as array
    recipeData.ingredients.forEach((ingredient) => {
      if (ingredient.trim()) {
        formData.append('ingredients', ingredient.trim());
      }
    });
    
    // Add instructions as array
    recipeData.instructions.forEach((instruction) => {
      if (instruction.trim()) {
        formData.append('instructions', instruction.trim());
      }
    });
    
    // Add image if present
    if (recipeData.image) {
      formData.append('image', recipeData.image);
    }
    
    const response = await api.post('/recipes/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRecipe: async (id, recipeData) => {
    const formData = new FormData();
    formData.append('title', recipeData.title);
    formData.append('description', recipeData.description);
    formData.append('category', recipeData.category);
    formData.append('prep_time', recipeData.prepTime.toString());
    formData.append('gluten_free', recipeData.glutenFree ? 'true' : 'false');
    formData.append('lactose_free', recipeData.lactoseFree ? 'true' : 'false');
    formData.append('is_sardinian', recipeData.isSardinian ? 'true' : 'false');
    if (recipeData.isPublished !== undefined) {
      formData.append('is_published', recipeData.isPublished ? 'true' : 'false');
    }
    if (recipeData.finalComment !== undefined) {
      formData.append('final_comment', recipeData.finalComment || '');
    }
    
    // Add ingredients as array
    recipeData.ingredients.forEach((ingredient) => {
      if (ingredient.trim()) {
        formData.append('ingredients', ingredient.trim());
      }
    });
    
    // Add instructions as array
    recipeData.instructions.forEach((instruction) => {
      if (instruction.trim()) {
        formData.append('instructions', instruction.trim());
      }
    });
    
    // Add image if present (only if it's a new file)
    if (recipeData.image && recipeData.image instanceof File) {
      formData.append('image', recipeData.image);
    }
    
    const response = await api.patch(`/recipes/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}/`);
    return response.data;
  },

  likeRecipe: async (id) => {
    const response = await api.post(`/recipes/${id}/like/`);
    return response.data;
  },

  reportRecipe: async (id, reason, description = '') => {
    const response = await api.post(`/recipes/${id}/report/`, {
      reason,
      description,
    });
    return response.data;
  },
};

export const storyAPI = {
  getStories: async (searchQuery = '') => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    
    const queryString = params.toString();
    const url = `/stories/${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getStory: async (id) => {
    const response = await api.get(`/stories/${id}/`);
    return response.data;
  },
};

export default api;