import axios from 'axios';

// Base Axios Instance
export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' }
});

// Token Interceptor 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');

    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// AUTH SERVICE 
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// Spring Boot
export const friendApi = {
    search: (query) => api.get(`/friends/search?query=${query}`),
    sendRequest: (id) => api.post(`/friends/request/${id}`),
    getRequests: () => api.get('/friends/requests'),
    acceptRequest: (id) => api.post(`/friends/accept/${id}`),
    getFriends: () => api.get('/friends'),
};

export const contentApi = axios.create({
    baseURL: 'http://localhost:3000/api/v1/posts',
});

contentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Export main Spring client if needed elsewhere
export { api as authApi };
