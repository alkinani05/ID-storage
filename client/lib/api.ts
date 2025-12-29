import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://id-storage-production-39bf.up.railway.app';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { API_URL };
export default api;
