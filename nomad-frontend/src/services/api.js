import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL;
const CONTENT_BASE_URL = import.meta.env.VITE_CONTENT_API_URL;


export const api = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');

    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

export const friendApi = {
    search: (query) => api.get(`/friends/search?query=${query}`),
    sendRequest: (id) => api.post(`/friends/request/${id}`),
    getRequests: () => api.get('/friends/requests'),
    acceptRequest: (id) => api.post(`/friends/accept/${id}`),
    getFriends: () => api.get('/friends'),
};


export const contentApi = axios.create({
    baseURL: CONTENT_BASE_URL,
});

// Token interceptor for content service
contentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const postService = {
  
    createPost: (data) => contentApi.post('/', data, { 
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    getFeed: (lat, lng, radius) => contentApi.get(`/feed?lat=${lat}&lng=${lng}&radius=${radius}`),

    toggleLike: (postId) => contentApi.post(`/${postId}/like`),

    addComment: (postId, content) => contentApi.post(`/${postId}/comment`, { content }),
};

export { api as authApi };
