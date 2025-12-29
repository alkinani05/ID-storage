import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mock Interceptor for Static Demo
api.interceptors.request.use(async (config) => {
    // Check if we should be in mock mode (set on login with specific creds)
    const isMock = typeof window !== 'undefined' && localStorage.getItem('isMockMode') === 'true';

    if (isMock) {
        // Mock Login
        if (config.url?.endsWith('/auth/login') && config.method === 'post') {
            const { email, password } = config.data;
            if (
                (email === 'admin@wathiqni.com' && password === 'admin123') ||
                (email === 'user@wathiqni.com' && password === 'user123')
            ) {
                // Throw a "success" error to be caught by the response interceptor or just return a promise that resolves
                // Axios adapters are the "proper" way but intercepting the *request* and returning a response object specifically 
                // via an adapter is cleaner. But we can't easily swap adapters here dynamically without complexity.
                // EASIEST WAY: Force the adapter for this specific request info.
                config.adapter = async () => {
                    return {
                        data: {
                            access_token: 'mock-token-123',
                            user: {
                                id: email.startsWith('admin') ? 1 : 2,
                                email,
                                fullName: email.startsWith('admin') ? 'Admin User' : 'Demo User',
                                role: email.startsWith('admin') ? 'ADMIN' : 'USER'
                            }
                        },
                        status: 201,
                        statusText: 'Created',
                        headers: {},
                        config,
                    };
                };
            } else {
                config.adapter = async () => {
                    throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
                };
            }
        }

        // Mock Profile
        if (config.url?.endsWith('/auth/profile') && config.method === 'get') {
            config.adapter = async () => {
                return {
                    data: {
                        id: 1,
                        email: 'demo@wathiqni.com',
                        fullName: 'Demo User',
                        role: 'USER',
                        phone: '07700000000',
                        bio: 'حساب تجريبي'
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                };
            };
        }

        // Mock Documents List
        if (config.url?.includes('/documents') && config.method === 'get' && !config.url.includes('stats')) {
            config.adapter = async () => {
                return {
                    data: [
                        { id: '1', title: 'جواز سفر', category: 'PASSPORT', createdAt: new Date().toISOString(), size: 102400, status: 'PROCESSED', expiryDate: '2030-01-01', extractedData: [{ label: 'الاسم', value: 'تجريبي' }] },
                        { id: '2', title: 'بطاقة هوية', category: 'ID_CARD', createdAt: new Date().toISOString(), size: 51200, status: 'PROCESSED', extractedData: [] },
                    ],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                };
            };
        }

        // Mock Stats or other gets
        if (config.method === 'get') {
            config.adapter = async () => {
                return {
                    data: [], // Default empty array or object
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                };
            };
        }
    } else {
        // Fallback: If we are calling the API and it fails (because no backend), 
        // check if we are logging in with the specific demo credentials and ENABLE mock mode on the fly.
        if (config.url?.endsWith('/auth/login') && config.method === 'post') {
            const { email, password } = config.data;
            if (
                (email === 'admin@wathiqni.com' && password === 'admin123') ||
                (email === 'user@wathiqni.com' && password === 'user123')
            ) {
                // Enable Mock Mode for this session
                localStorage.setItem('isMockMode', 'true');
                config.adapter = async () => {
                    return {
                        data: {
                            access_token: 'mock-token-123',
                            user: {
                                id: 1,
                                email,
                                fullName: 'حساب تجريبي',
                                role: 'USER'
                            }
                        },
                        status: 201,
                        statusText: 'Created',
                        headers: {},
                        config,
                    };
                };
            }
        }
    }
    return config;
});

export { API_URL };
export default api;
