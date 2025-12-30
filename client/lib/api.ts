import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- SMART MOCK DATA ---
const MOCK_DB = {
    '1': {
        id: '1',
        title: 'جواز سفر عراقي',
        category: 'PASSPORT',
        createdAt: new Date().toISOString(),
        size: 1024 * 500,
        status: 'PROCESSED',
        expiryDate: '2030-01-01',
        extractedData: [
            { fieldName: 'full_name', fieldValue: 'أحمد محمد علي', confidence: 0.98 },
            { fieldName: 'document_number', fieldValue: 'A12345678', confidence: 0.99 },
            { fieldName: 'ai_summary', fieldValue: 'تم التحقق من الجواز بنجاح. كافة البيانات مطابقة للمعايير الدولية.' },
            { fieldName: 'quality_score', fieldValue: JSON.stringify({ overall: 95, brightness: 90, contrast: 92, sharpness: 94, readability: 98 }) }
        ]
    },
    '2': {
        id: '2',
        title: 'بطاقة وطنية موحدة',
        category: 'ID_CARD',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        size: 1024 * 250,
        status: 'PROCESSED',
        expiryDate: '2028-05-15',
        extractedData: [
            { fieldName: 'full_name', fieldValue: 'سارة خالد محمود', confidence: 0.96 },
            { fieldName: 'national_id', fieldValue: '199012345678', confidence: 0.97 },
            { fieldName: 'ai_summary', fieldValue: 'بطاقة وطنية صالحة. الصورة واضحة والنصوص مقروءة.' },
            { fieldName: 'quality_score', fieldValue: JSON.stringify({ overall: 88, brightness: 85, contrast: 82, sharpness: 90, readability: 95 }) }
        ]
    }
};

// SVG Placeholders for Demo
const SVG_PASSPORT = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="#f0f0f0"><rect width="800" height="600" fill="#1e293b"/><rect x="50" y="50" width="700" height="500" rx="20" fill="#0f172a" stroke="#3b82f6" stroke-width="4"/><text x="400" y="300" font-family="Arial" font-size="40" fill="#94a3b8" text-anchor="middle">Demo Passport Image</text><circle cx="400" cy="200" r="50" fill="#3b82f6" opacity="0.5"/><rect x="200" y="350" width="400" height="20" rx="10" fill="#334155"/><rect x="200" y="400" width="300" height="20" rx="10" fill="#334155"/></svg>`;
const SVG_IDCARD = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="#f0f0f0"><rect width="800" height="500" fill="#1e293b"/><rect x="30" y="30" width="740" height="440" rx="20" fill="#0f172a" stroke="#10b981" stroke-width="4"/><text x="400" y="250" font-family="Arial" font-size="40" fill="#94a3b8" text-anchor="middle">Demo ID Card</text><rect x="600" y="80" width="120" height="150" fill="#334155"/><rect x="100" y="100" width="400" height="30" rx="5" fill="#334155"/><rect x="100" y="160" width="300" height="20" rx="5" fill="#334155"/></svg>`;
const SVG_GENERIC = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="#f0f0f0"><rect width="800" height="600" fill="#1e293b"/><rect x="100" y="50" width="600" height="500" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><text x="400" y="300" font-family="Arial" font-size="40" fill="#475569" text-anchor="middle">Demo User Document</text><path d="M300 200 L500 200" stroke="#cbd5e1" stroke-width="10"/><path d="M300 250 L500 250" stroke="#cbd5e1" stroke-width="10"/><path d="M300 300 L500 300" stroke="#cbd5e1" stroke-width="10"/></svg>`;


// Mock Interceptor for Static Demo
api.interceptors.request.use(async (config) => {
    const isMock = (typeof window !== 'undefined' && localStorage.getItem('isMockMode') === 'true') || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (isMock) {
        // Mock Login
        if (config.url?.endsWith('/auth/login') && config.method === 'post') {
            const { email, password } = config.data;
            if (
                (email === 'admin@wathiqni.com' && password === 'admin123') ||
                (email === 'user@wathiqni.com' && password === 'user123')
            ) {
                // Determine user ID based on email to maintain consistent state
                const userId = email.startsWith('admin') ? 1 : 2;
                config.adapter = async () => {
                    return {
                        data: {
                            access_token: 'mock-token-123',
                            user: {
                                id: userId,
                                email,
                                fullName: email.startsWith('admin') ? 'Admin User' : 'Demo User',
                                role: email.startsWith('admin') ? 'ADMIN' : 'USER'
                            }
                        },
                        status: 201, statusText: 'Created', headers: {}, config,
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
                        id: 1, email: 'demo@wathiqni.com', fullName: 'Demo User', role: 'USER', phone: '07700000000', bio: 'حساب تجريبي'
                    },
                    status: 200, statusText: 'OK', headers: {}, config
                };
            };
        }

        // Mock Share Creation (POST)
        if (config.url?.endsWith('/share') && config.method === 'post') {
            // Extract Doc ID from URL: /documents/1/share
            const match = config.url.match(/\/documents\/([^\/]+)\/share/);
            const docId = match ? match[1] : 'unknown';

            // Extract Category from body to encode in smart token
            const requestData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            const category = requestData?.docCategory || 'OTHER';

            // "Smart Token" - encode the docId AND category into the token
            // Format: token-doc-{id}-cat-{category}-{random}
            const token = `token-doc-${docId}-cat-${category}-${Math.random().toString(36).substring(7)}`;

            config.adapter = async () => {
                return {
                    data: { token },
                    status: 201, statusText: 'Created', headers: {}, config
                };
            };
        }

        // Mock Share View (GET)
        if (config.url?.includes('/share/') && config.method === 'get' && !config.url.includes('download')) {
            // Extract token from URL
            const match = config.url.match(/\/share\/([^\/]+)/);
            const token = match ? match[1] : '';

            // Parse Doc ID and Category from token
            let docId = 'unknown';
            let categoryFromToken = 'OTHER';

            if (token.startsWith('token-doc-')) {
                // Parse: token-doc-{id}-cat-{category}-{random}
                const parts = token.split('-');
                // parts[0]='token', parts[1]='doc', parts[2]=ID
                if (parts.length >= 3) docId = parts[2];

                // Find 'cat' marker
                const catIndex = parts.indexOf('cat');
                if (catIndex !== -1 && catIndex + 1 < parts.length) {
                    categoryFromToken = parts[catIndex + 1];
                }
            }

            // Retrieve Doc
            let doc = MOCK_DB[docId as keyof typeof MOCK_DB];

            // Fallback for user-uploaded docs in demo (using encoded category)
            if (!doc) {
                // If it's a random ID, return a generic user doc with CORRECT CATEGORY
                doc = {
                    id: docId,
                    title: categoryFromToken === 'PASSPORT' ? 'جواز سفر (تجريبي)' :
                        categoryFromToken === 'ID_CARD' ? 'بطاقة وطنية (تجربية)' : 'مستند مستخدم (تجريبي)',
                    category: categoryFromToken,
                    size: 1024 * 100,
                    createdAt: new Date().toISOString(),
                    status: 'PROCESSED',
                    expiryDate: '2025-12-31',
                    extractedData: [{ fieldName: 'note', fieldValue: 'هذا المستند تم إنشاؤه في جلسة تجريبية.', confidence: 1 }]
                };
            }

            config.adapter = async () => {
                return {
                    data: {
                        ...doc, // Spread existing doc properties
                        mimeType: 'image/svg+xml', // Ensure image preview works with SVG
                        permissions: {
                            allowDownload: true, allowPrint: true,
                            expiresAt: new Date(Date.now() + 86400000).toISOString(),
                            viewsCount: 12, maxViews: 50
                        }
                    },
                    status: 200, statusText: 'OK', headers: {}, config
                };
            };
        }

        // Mock Share/Document Download
        if ((config.url?.includes('/download') && config.method === 'get') || (config.url?.includes('/share/') && config.url.includes('/download'))) {
            // Try to determine doc ID and Category from URL
            let docId = 'unknown';
            let categoryFromToken = 'OTHER';

            // Check direct doc link: /documents/1/download
            let match = config.url?.match(/\/documents\/([^\/]+)\/download/);
            if (match) docId = match[1];

            // Check share link: /share/token-doc-1-cat-PASSPORT-xyz/download
            if (!match) {
                match = config.url?.match(/\/share\/([^\/]+)\/download/);
                if (match) {
                    const token = match[1];
                    if (token.startsWith('token-doc-')) {
                        const parts = token.split('-');
                        if (parts.length >= 3) docId = parts[2];
                        const catIndex = parts.indexOf('cat');
                        if (catIndex !== -1 && catIndex + 1 < parts.length) {
                            categoryFromToken = parts[catIndex + 1];
                        }
                    }
                }
            }

            // Determine Content based on ID OR Encoded Category
            let svgContent = SVG_GENERIC; // Default to Generic

            if (docId === '1' || (MOCK_DB[docId as keyof typeof MOCK_DB]?.category === 'PASSPORT') || categoryFromToken === 'PASSPORT') {
                svgContent = SVG_PASSPORT;
            } else if (docId === '2' || (MOCK_DB[docId as keyof typeof MOCK_DB]?.category === 'ID_CARD') || categoryFromToken === 'ID_CARD') {
                svgContent = SVG_IDCARD;
            }

            config.adapter = async () => {
                return {
                    data: new Blob([svgContent], { type: 'image/svg+xml' }),
                    status: 200, statusText: 'OK', headers: {}, config
                };
            };
        }

        // Mock Documents List
        if (config.url?.includes('/documents') && config.method === 'get' && !config.url.includes('stats') && !config.url.includes('share') && !config.url.includes('download')) {
            config.adapter = async () => {
                return {
                    data: Object.values(MOCK_DB),
                    status: 200, statusText: 'OK', headers: {}, config
                };
            };
        }

        // Mock Upload
        if (config.url?.includes('/documents/upload') && config.method === 'post') {
            const formData = config.data instanceof FormData ? config.data : new FormData();
            // In a real mock interceptor with FormData, getting values is tricky as axios might have serialized it.
            // But usually we can assume the frontend sent 'category'.
            // For now, let's try to parse if possible, or fallback to 'PASSPORT' if that's what we want to test.
            // Actually, we can just return what we want.

            config.adapter = async () => {
                return {
                    data: {
                        id: Math.random().toString(),
                        title: 'مستند جديد',
                        category: 'OTHER', // Default for now, as we can't easily parse FormData in this interceptor setup without more complex logic
                        status: 'PROCESSED',
                        message: 'تم الرفع (محاكاة)'
                    },
                    status: 201, statusText: 'Created', headers: {}, config
                };
            };
        }

        // Mock Delete
        if (config.url?.startsWith('/documents/') && config.method === 'delete') {
            config.adapter = async () => {
                return {
                    data: { success: true, message: 'تم الحذف (محاكاة)' },
                    status: 200, statusText: 'OK', headers: {}, config
                };
            };
        }

        // Mock Stats or other gets
        if (config.method === 'get' && !config.adapter) {
            config.adapter = async () => {
                return {
                    data: [],
                    status: 200, statusText: 'OK', headers: {}, config
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
