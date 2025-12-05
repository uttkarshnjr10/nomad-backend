import axios from 'axios';

// 1. Create the Client
const springClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Base URL
    headers: { 'Content-Type': 'application/json' }
});

// 2. Add Token Interceptor
springClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Define API Calls
export const authService = {
    // CRITICAL FIX: Ensure '/auth' is included here
    login: (data) => springClient.post('/auth/login', data),
    register: (data) => springClient.post('/auth/register', data),
};

export const friendApi = {
    search: (query) => springClient.get(`/friends/search?query=${query}`),
    sendRequest: (id) => springClient.post(`/friends/request/${id}`),
    getRequests: () => springClient.get('/friends/requests'),
    acceptRequest: (id) => springClient.post(`/friends/accept/${id}`),
    getFriends: () => springClient.get('/friends'),
};

// 4. Content Service (Node.js)
export const contentApi = axios.create({
    baseURL: 'http://localhost:3000/api/v1/posts',
});

contentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('nomad_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export { springClient as authApi };