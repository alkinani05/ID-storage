'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogOut, Plus, Search, FileText, CreditCard, UploadCloud,
    Loader2, CheckCircle, AlertCircle, Share2, MessageSquare,
    X, Send, Sparkles, ScanLine, Bell, Settings, Home,
    FolderOpen, Clock, Shield, TrendingUp, Eye, Download, Trash2, Menu,
    Camera, FlipHorizontal, Zap, Focus, Sliders, Target, Gauge,
    FileCheck, Move, Activity, Brain, Crosshair, Mail, Copy
} from 'lucide-react';
import api, { API_URL } from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const statsData = [
    { label: 'إجمالي المستندات', value: '0', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'قيد المعالجة', value: '0', icon: Loader2, color: 'from-yellow-500 to-orange-500' },
    { label: 'تنتهي قريباً', value: '0', icon: Clock, color: 'from-red-500 to-pink-500' },
    { label: 'مشفرة بالكامل', value: '100%', icon: Shield, color: 'from-green-500 to-emerald-500' },
];

const sidebarItems = [
    { icon: Home, label: 'الرئيسية', active: true },
    { icon: FolderOpen, label: 'جميع الملفات', active: false },
    { icon: Clock, label: 'الانتهاء قريباً', active: false },
    { icon: Share2, label: 'الروابط المشاركة', active: false },
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'مرحباً! أنا مساعدك الذكي. اسألني أي شيء عن مستنداتك.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('HOME');
    const [showSidebar, setShowSidebar] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scanner States
    const [showScanner, setShowScanner] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<string>('');
    const [scannerReady, setScannerReady] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Advanced Scanner Settings
    const [showScannerSettings, setShowScannerSettings] = useState(false);
    const [scanMode, setScanMode] = useState<'auto' | 'manual' | 'burst'>('auto');
    const [scanQuality, setScanQuality] = useState<'standard' | 'high' | 'ultra'>('high');
    const [showGridOverlay, setShowGridOverlay] = useState(true);
    const [autoEnhance, setAutoEnhance] = useState(true);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(120);
    const [sharpness, setSharpness] = useState(110);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanScore, setScanScore] = useState(0);
    const [autoCapturing, setAutoCapturing] = useState(false);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // AI Detection States
    const [aiEnabled, setAiEnabled] = useState(true);
    const [documentDetected, setDocumentDetected] = useState(false);
    const [documentEdges, setDocumentEdges] = useState<{ top: number, right: number, bottom: number, left: number } | null>(null);
    const [alignmentScore, setAlignmentScore] = useState(0);
    const [detectedDocType, setDetectedDocType] = useState<string>('');
    const [aiProcessing, setAiProcessing] = useState(false);
    const [stabilityScore, setStabilityScore] = useState(0);
    const previousFrameRef = useRef<ImageData | null>(null);

    // Share Modal States
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareDocId, setShareDocId] = useState<string | null>(null);
    const [shareExpiry, setShareExpiry] = useState(1); // hours
    const [shareAllowDownload, setShareAllowDownload] = useState(false);
    const [shareAllowPrint, setShareAllowPrint] = useState(true);
    const [shareOneTime, setShareOneTime] = useState(false);
    const [shareMaxViews, setShareMaxViews] = useState<number | null>(null);
    const [shareLoading, setShareLoading] = useState(false);
    const [generatedShareLink, setGeneratedShareLink] = useState<string | null>(null);

    // Settings Modal States
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'notifications'>('profile');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Profile edit states
    const [editFullName, setEditFullName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editNationality, setEditNationality] = useState('');
    const [editDateOfBirth, setEditDateOfBirth] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editNotifyExpiry, setEditNotifyExpiry] = useState(true);
    const [editNotifySharing, setEditNotifySharing] = useState(true);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);



    const filteredDocuments = documents.filter(doc => {
        // Tab Filtering
        if (activeTab === 'EXPIRING' && !doc.expiryDate) return false;
        if (activeTab === 'SHARED' && (!doc.shares || doc.shares.length === 0)) return false;

        // Category Filtering
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PASSPORT') return doc.category === 'PASSPORT';
        if (activeFilter === 'ID_CARD') return doc.category === 'ID_CARD';
        return true;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchDocuments();
    }, [router]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatMessages]);

    const fetchDocuments = async (query = '') => {
        try {
            const token = localStorage.getItem('token');
            const url = query ? `/documents?q=${query}` : '/documents';
            const res = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setDocuments(res.data);
        } catch (err) { console.error(err); }
        finally { setLoadingDocs(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingDocs(true);
        fetchDocuments(searchQuery);
    };

    const openShareModal = (docId: string) => {
        setShareDocId(docId);
        setShareExpiry(1);
        setShareAllowDownload(false);
        setShareAllowPrint(true);
        setShareOneTime(false);
        setShareMaxViews(null);
        setGeneratedShareLink(null);
        setShowShareModal(true);
    };

    const generateShareLink = async () => {
        if (!shareDocId) return;
        setShareLoading(true);
        try {
            const token = localStorage.getItem('token');
            const docToShare = documents.find(d => d.id === shareDocId);
            const res = await api.post(`/documents/${shareDocId}/share`, {
                expiryHours: shareExpiry,
                allowDownload: shareAllowDownload,
                allowPrint: shareAllowPrint,
                oneTimeDownload: shareOneTime,
                maxViews: shareMaxViews,
                // Pass category for Smart Token generation in Demo
                docCategory: docToShare?.category || 'OTHER'
            }, { headers: { Authorization: `Bearer ${token}` } });

            const link = `${window.location.origin}/share?token=${res.data.token}`;
            setGeneratedShareLink(link);
            navigator.clipboard.writeText(link);
            fetchDocuments(); // Refresh to show new share
        } catch (e) {
            alert("فشل إنشاء الرابط");
        }
        setShareLoading(false);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setShareDocId(null);
        setGeneratedShareLink(null);
    };

    // Settings Functions
    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(res.data);
            setEditFullName(res.data.fullName || '');
            setEditPhone(res.data.phone || '');
            setEditNationality(res.data.nationality || '');
            setEditDateOfBirth(res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '');
            setEditAddress(res.data.address || '');
            setEditBio(res.data.bio || '');
            setEditNotifyExpiry(res.data.notifyExpiry ?? true);
            setEditNotifySharing(res.data.notifySharing ?? true);
        } catch (e) {
            console.error('Failed to load profile', e);
        }
    };

    const openSettings = () => {
        setShowSettings(true);
        setSettingsTab('profile');
        loadUserProfile();
    };

    const saveProfile = async () => {
        setSettingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await api.put('/auth/profile', {
                fullName: editFullName,
                phone: editPhone,
                nationality: editNationality,
                dateOfBirth: editDateOfBirth || null,
                address: editAddress,
                bio: editBio,
                notifyExpiry: editNotifyExpiry,
                notifySharing: editNotifySharing,
            }, { headers: { Authorization: `Bearer ${token}` } });

            // Update local user state
            if (user) {
                setUser({ ...user, fullName: editFullName });
            }
            alert('تم حفظ الملف الشخصي بنجاح');
            loadUserProfile();
        } catch (e: any) {
            alert(e.response?.data?.message || 'فشل في حفظ الملف الشخصي');
        }
        setSettingsLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }
        if (newPassword.length < 6) {
            alert('كلمة المرور الجديدة قصيرة جداً');
            return;
        }
        setSettingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('تم تغيير كلمة المرور بنجاح');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            alert(e.response?.data?.message || 'فشل في تغيير كلمة المرور');
        }
        setSettingsLoading(false);
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const token = localStorage.getItem('token');
        const tempId = Math.random().toString();
        const newDoc = { id: tempId, title: acceptedFiles[0].name, category: 'OTHER', status: 'PROCESSING', size: acceptedFiles[0].size, createdAt: new Date().toISOString(), extractedData: [] };
        setDocuments(prev => [newDoc, ...prev]);
        setShowUpload(false);
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await api.post('/documents/upload', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                fetchDocuments();
            } catch (e) { setDocuments(prev => prev.filter(d => d.id !== tempId)); alert("فشل الرفع"); }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setChatLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/documents/chat', { message: userMsg }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'ai', text: "عذراً، حدث خطأ في الاتصال." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const deleteDocument = async (docId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
            setDocuments(prev => prev.filter(d => d.id !== docId));
            setSelectedDoc(null);
        } catch (e) { alert('فشل حذف المستند'); }
    };

    // Scanner Functions
    const startScanner = async () => {
        setShowScanner(true);
        setCapturedImage(null);
        setSelectedDocType('');
        setScannerReady(false);
        setScanScore(0);
        setIsAnalyzing(false);

        const qualitySettings = {
            standard: { width: 1280, height: 720 },
            high: { width: 1920, height: 1080 },
            ultra: { width: 2560, height: 1440 }
        };

        const { width, height } = qualitySettings[scanQuality];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: width },
                    height: { ideal: height }
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setScannerReady(true);
                    if (scanMode === 'auto') {
                        startAutoAnalysis();
                    }
                };
            }
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('تعذر الوصول إلى الكاميرا. يرجى السماح بالوصول.');
            setShowScanner(false);
        }
    };

    const startAutoAnalysis = () => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }

        analysisIntervalRef.current = setInterval(() => {
            analyzeFrame();
        }, 500);
    };

    const analyzeFrame = () => {
        if (!videoRef.current || !canvasRef.current || capturedImage) return;
        if (!aiEnabled) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        setAiProcessing(true);

        // Use larger sample for better AI detection
        const sampleSize = 200;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(video, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // Convert to grayscale matrix for processing
        const grayMatrix: number[][] = [];
        for (let y = 0; y < sampleSize; y++) {
            grayMatrix[y] = [];
            for (let x = 0; x < sampleSize; x++) {
                const idx = (y * sampleSize + x) * 4;
                grayMatrix[y][x] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            }
        }

        // ============ AI DOCUMENT EDGE DETECTION (Sobel Operator) ============
        const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

        let edgeMagnitudes: number[] = [];
        let topEdges = 0, bottomEdges = 0, leftEdges = 0, rightEdges = 0;

        for (let y = 1; y < sampleSize - 1; y++) {
            for (let x = 1; x < sampleSize - 1; x++) {
                let gx = 0, gy = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixel = grayMatrix[y + ky][x + kx];
                        gx += pixel * sobelX[ky + 1][kx + 1];
                        gy += pixel * sobelY[ky + 1][kx + 1];
                    }
                }
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edgeMagnitudes.push(magnitude);

                // Track edge positions for document boundary detection
                if (magnitude > 100) {
                    if (y < sampleSize * 0.3) topEdges++;
                    if (y > sampleSize * 0.7) bottomEdges++;
                    if (x < sampleSize * 0.3) leftEdges++;
                    if (x > sampleSize * 0.7) rightEdges++;
                }
            }
        }

        // Detect if document boundaries are visible
        const minEdgesForDoc = 15;
        const hasDocumentEdges = topEdges > minEdgesForDoc && bottomEdges > minEdgesForDoc &&
            leftEdges > minEdgesForDoc && rightEdges > minEdgesForDoc;
        setDocumentDetected(hasDocumentEdges);

        if (hasDocumentEdges) {
            setDocumentEdges({
                top: Math.min(100, topEdges * 2),
                bottom: Math.min(100, bottomEdges * 2),
                left: Math.min(100, leftEdges * 2),
                right: Math.min(100, rightEdges * 2)
            });
        } else {
            setDocumentEdges(null);
        }

        // ============ ALIGNMENT SCORE ============
        // Check if edges are balanced (document is centered)
        const horizontalBalance = 100 - Math.abs(leftEdges - rightEdges) * 2;
        const verticalBalance = 100 - Math.abs(topEdges - bottomEdges) * 2;
        const alignment = Math.round((horizontalBalance + verticalBalance) / 2);
        setAlignmentScore(Math.max(0, Math.min(100, alignment)));

        // ============ STABILITY DETECTION ============
        // Compare with previous frame to detect motion
        if (previousFrameRef.current) {
            let diffSum = 0;
            const prevData = previousFrameRef.current.data;
            for (let i = 0; i < Math.min(data.length, prevData.length); i += 16) {
                diffSum += Math.abs(data[i] - prevData[i]);
            }
            const stability = Math.max(0, 100 - (diffSum / 500));
            setStabilityScore(Math.round(stability));
        }
        previousFrameRef.current = imageData;

        // ============ DOCUMENT TYPE DETECTION ============
        // Analyze color distribution and aspect patterns
        let blueSum = 0, redSum = 0, greenSum = 0;
        let darkPixels = 0, lightPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
            redSum += data[i];
            greenSum += data[i + 1];
            blueSum += data[i + 2];
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 80) darkPixels++;
            if (avg > 180) lightPixels++;
        }

        const pixelCount = data.length / 4;
        const avgRed = redSum / pixelCount;
        const avgBlue = blueSum / pixelCount;
        const avgGreen = greenSum / pixelCount;
        const darkRatio = darkPixels / pixelCount;
        const lightRatio = lightPixels / pixelCount;

        // Heuristic document type detection
        if (avgBlue > avgRed + 20 && avgBlue > avgGreen + 10) {
            setDetectedDocType('جواز سفر'); // Passport (often has blue)
        } else if (darkRatio > 0.4 && lightRatio < 0.3) {
            setDetectedDocType('بطاقة هوية'); // ID Card (high contrast)
        } else if (lightRatio > 0.6) {
            setDetectedDocType('مستند ورقي'); // Paper document
        } else if (hasDocumentEdges) {
            setDetectedDocType('مستند'); // Generic document
        } else {
            setDetectedDocType('');
        }

        // ============ QUALITY SCORE ============
        // Calculate image quality metrics
        let brightnessSum = 0;
        let contrastVariance = 0;
        const pixels: number[] = [];

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            pixels.push(gray);
            brightnessSum += gray;
        }

        const avgBrightness = brightnessSum / pixels.length;

        for (const pixel of pixels) {
            contrastVariance += Math.pow(pixel - avgBrightness, 2);
        }
        const contrastScore = Math.sqrt(contrastVariance / pixels.length);

        // Calculate edge density from Sobel
        const avgEdgeMagnitude = edgeMagnitudes.reduce((a, b) => a + b, 0) / edgeMagnitudes.length;
        const edgeScore = Math.min(100, avgEdgeMagnitude * 1.5);

        // Brightness optimal range score
        const brightnessScore = avgBrightness > 60 && avgBrightness < 200
            ? 100
            : Math.max(0, 100 - Math.abs(avgBrightness - 130));

        // Combined AI quality score
        const stabilityFactor = stabilityScore > 80 ? 1.1 : stabilityScore > 50 ? 1.0 : 0.8;
        const documentFactor = hasDocumentEdges ? 1.15 : 0.9;

        const rawScore = (brightnessScore * 0.2) + (contrastScore * 0.3) + (edgeScore * 0.3) + (alignment * 0.2);
        const aiScore = Math.round(Math.min(100, rawScore * stabilityFactor * documentFactor));

        setScanScore(Math.max(0, Math.min(100, aiScore)));
        setIsAnalyzing(true);
        setAiProcessing(false);

        // ============ SMART AUTO-CAPTURE ============
        // More intelligent capture decision
        const shouldCapture = scanMode === 'auto' &&
            aiScore >= 70 &&
            stabilityScore > 80 &&
            hasDocumentEdges &&
            alignment > 60 &&
            !autoCapturing;

        if (shouldCapture) {
            setAutoCapturing(true);
            setTimeout(() => {
                captureImage();
                setAutoCapturing(false);
            }, 800); // Faster capture when conditions are perfect
        }
    };

    const stopScanner = () => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowScanner(false);
        setCapturedImage(null);
        setSelectedDocType('');
        setScannerReady(false);
        setScanScore(0);
        setIsAnalyzing(false);
        setAutoCapturing(false);
        // Reset AI states
        setDocumentDetected(false);
        setDocumentEdges(null);
        setAlignmentScore(0);
        setDetectedDocType('');
        setAiProcessing(false);
        setStabilityScore(0);
        previousFrameRef.current = null;
    };

    const switchCamera = async () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        const qualitySettings = {
            standard: { width: 1280, height: 720 },
            high: { width: 1920, height: 1080 },
            ultra: { width: 2560, height: 1440 }
        };
        const { width, height } = qualitySettings[scanQuality];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newMode, width: { ideal: width }, height: { ideal: height } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Failed to switch camera:', err);
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        // Stop auto analysis
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas to video dimensions for high quality
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (ctx) {
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Apply image enhancement based on settings
            if (autoEnhance) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const contrastFactor = contrast / 100;
                const brightnessFactor = (brightness - 100) * 2.55;
                const sharpnessFactor = sharpness / 100;

                for (let i = 0; i < data.length; i += 4) {
                    // Apply brightness
                    let r = data[i] + brightnessFactor;
                    let g = data[i + 1] + brightnessFactor;
                    let b = data[i + 2] + brightnessFactor;

                    // Apply contrast
                    r = (r - 128) * contrastFactor + 128;
                    g = (g - 128) * contrastFactor + 128;
                    b = (b - 128) * contrastFactor + 128;

                    // Clamp values
                    data[i] = Math.min(255, Math.max(0, r));
                    data[i + 1] = Math.min(255, Math.max(0, g));
                    data[i + 2] = Math.min(255, Math.max(0, b));
                }

                // Apply sharpening if enabled
                if (sharpnessFactor > 1) {
                    // Simple unsharp mask approximation
                    const width = canvas.width;
                    const height = canvas.height;
                    const factor = (sharpnessFactor - 1) * 0.5;

                    for (let y = 1; y < height - 1; y++) {
                        for (let x = 1; x < width - 1; x++) {
                            const idx = (y * width + x) * 4;
                            const idxUp = ((y - 1) * width + x) * 4;
                            const idxDown = ((y + 1) * width + x) * 4;
                            const idxLeft = (y * width + x - 1) * 4;
                            const idxRight = (y * width + x + 1) * 4;

                            for (let c = 0; c < 3; c++) {
                                const center = data[idx + c];
                                const neighbors = (data[idxUp + c] + data[idxDown + c] + data[idxLeft + c] + data[idxRight + c]) / 4;
                                data[idx + c] = Math.min(255, Math.max(0, center + (center - neighbors) * factor));
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            }

            // Quality settings for output
            const qualityMap = { standard: 0.85, high: 0.92, ultra: 0.98 };
            const dataUrl = canvas.toDataURL('image/jpeg', qualityMap[scanQuality]);
            setCapturedImage(dataUrl);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setSelectedDocType('');
    };

    const uploadScannedDocument = async () => {
        if (!capturedImage || !selectedDocType) {
            alert('يرجى اختيار نوع المستند');
            return;
        }

        // Convert base64 to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });

        const token = localStorage.getItem('token');
        const tempId = Math.random().toString();
        const newDoc = {
            id: tempId,
            title: `${selectedDocType === 'PASSPORT' ? 'جواز سفر' : selectedDocType === 'ID_CARD' ? 'بطاقة هوية' : 'مستند'} - ${new Date().toLocaleDateString('ar-EG')}`,
            category: selectedDocType,
            status: 'PROCESSING',
            size: file.size,
            createdAt: new Date().toISOString(),
            extractedData: []
        };

        setDocuments(prev => [newDoc, ...prev]);
        stopScanner();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', newDoc.title);
        formData.append('category', selectedDocType);

        try {
            await api.post('/documents/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            fetchDocuments();
        } catch (e) {
            setDocuments(prev => prev.filter(d => d.id !== tempId));
            alert("فشل رفع المستند الممسوح");
        }
    };

    if (!user) return null;

    const stats = [
        { ...statsData[0], value: documents.length.toString() },
        { ...statsData[1], value: documents.filter(d => d.status === 'PROCESSING').length.toString() },
        { ...statsData[2], value: documents.filter(d => d.expiryDate).length.toString() },
        { ...statsData[3] },
    ];

    const handleDownload = async (doc: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/documents/${doc.id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.originalName || doc.title); // or retrieve filename from headers
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert(`فشل التحميل. المستند قد يكون محذوفاً.`);
        }
    };

    // Calculate counts for sidebar
    const expiringCount = documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
    const sharedCount = documents.filter(d => d.shares && d.shares.length > 0).length;

    const sidebarItemsList = [
        { id: 'HOME', icon: Home, label: 'الرئيسية', count: null, color: 'from-blue-500 to-cyan-500' },
        { id: 'FILES', icon: FolderOpen, label: 'جميع الملفات', count: documents.length, color: 'from-purple-500 to-pink-500' },
        { id: 'EXPIRING', icon: Clock, label: 'الانتهاء قريباً', count: expiringCount, color: 'from-red-500 to-orange-500', alert: expiringCount > 0 },
        { id: 'SHARED', icon: Share2, label: 'الروابط المشاركة', count: sharedCount, color: 'from-emerald-500 to-teal-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex" dir="rtl">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/50 border-l border-white/5 p-6 hidden lg:flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                        <ScanLine className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-black">وثقني</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {sidebarItemsList.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm group relative",
                                activeTab === item.id
                                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                                activeTab === item.id
                                    ? `bg-gradient-to-br ${item.color}`
                                    : "bg-white/5 group-hover:bg-white/10"
                            )}>
                                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-white" : "")} />
                            </div>
                            <span className="flex-1 text-right">{item.label}</span>
                            {item.count !== null && item.count > 0 && (
                                <span className={cn(
                                    "min-w-[24px] h-6 px-2 rounded-full text-xs font-bold flex items-center justify-center",
                                    item.alert
                                        ? "bg-red-500/20 text-red-400 animate-pulse"
                                        : "bg-white/10 text-slate-400"
                                )}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Quick Actions */}
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl border border-purple-500/20">
                    <p className="text-xs text-slate-400 mb-3">إجراءات سريعة</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={startScanner}
                            className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Camera className="h-5 w-5 text-emerald-400" />
                            <span className="text-xs">مسح</span>
                        </button>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Plus className="h-5 w-5 text-blue-400" />
                            <span className="text-xs">رفع</span>
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">{user.fullName?.charAt(0)}</div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.plan === 'FREE' ? 'خطة مجانية' : 'PRO'}</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500"><LogOut className="h-5 w-5" /></button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {
                    showSidebar && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-black/80 z-40 lg:hidden">
                            <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} onClick={e => e.stopPropagation()} className="absolute right-0 top-0 h-full w-72 bg-slate-900 border-l border-white/5 p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                                            <ScanLine className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-xl font-black">وثقني</span>
                                    </div>
                                    <button onClick={() => setShowSidebar(false)}><X className="h-6 w-6" /></button>
                                </div>
                                <nav className="flex-1 space-y-2">
                                    {sidebarItemsList.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setShowSidebar(false); }}
                                            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm", activeTab === item.id ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-purple-500/30" : "text-slate-400 hover:text-white hover:bg-white/5")}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">{user.fullName?.charAt(0)}</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm w-32 truncate">{user.fullName}</p>
                                            <p className="text-xs text-slate-500">PRO</p>
                                        </div>
                                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500"><LogOut className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            </motion.aside>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Main Content */}
            < main className="flex-1 p-4 lg:p-8 overflow-auto w-full" >
                {/* Header */}
                < div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8" >
                    <div className="flex items-center justify-between w-full lg:w-auto">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black mb-1">مرحباً، {user.fullName?.split(' ')[0]} 👋</h1>
                            <p className="text-slate-400 text-sm lg:text-base">إليك ملخص مستنداتك اليوم</p>
                        </div>
                        <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 bg-white/5 rounded-xl"><Menu className="h-6 w-6" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notification Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <Bell className="h-5 w-5 text-slate-400" />
                                {documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                                        {documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/10">
                                            <h3 className="font-bold flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-purple-400" />
                                                الإشعارات
                                            </h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {/* Expiring Documents */}
                                            {documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length > 0 ? (
                                                <>
                                                    <div className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-medium">
                                                        ⚠️ مستندات ستنتهي قريباً
                                                    </div>
                                                    {documents
                                                        .filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                                                        .slice(0, 5)
                                                        .map(doc => {
                                                            const daysLeft = Math.ceil((new Date(doc.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                            const isExpired = daysLeft < 0;
                                                            return (
                                                                <div
                                                                    key={doc.id}
                                                                    onClick={() => { setSelectedDoc(doc); setShowNotifications(false); }}
                                                                    className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                                                                            isExpired ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                                                                        )}>
                                                                            <Clock className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">{doc.title}</p>
                                                                            <p className={cn("text-xs", isExpired ? "text-red-400" : "text-yellow-400")}>
                                                                                {isExpired ? `انتهت الصلاحية منذ ${Math.abs(daysLeft)} يوم` : `ينتهي خلال ${daysLeft} يوم`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </>
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                                                    </div>
                                                    <p className="text-slate-400 text-sm">لا توجد إشعارات جديدة</p>
                                                    <p className="text-slate-600 text-xs mt-1">جميع مستنداتك سارية المفعول</p>
                                                </div>
                                            )}

                                            {/* Recent Activity */}
                                            {documents.length > 0 && (
                                                <>
                                                    <div className="px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                        📄 آخر المستندات المضافة
                                                    </div>
                                                    {documents.slice(0, 3).map(doc => (
                                                        <div
                                                            key={`recent-${doc.id}`}
                                                            onClick={() => { setSelectedDoc(doc); setShowNotifications(false); }}
                                                            className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                                    <FileText className="h-4 w-4 text-blue-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{doc.title}</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {new Date(doc.createdAt).toLocaleDateString('ar-IQ')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-white/10">
                                            <button
                                                onClick={() => { setActiveTab('EXPIRING'); setShowNotifications(false); }}
                                                className="w-full py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                            >
                                                عرض جميع المستندات المنتهية →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={openSettings} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                            <Settings className="h-5 w-5 text-slate-400" />
                        </button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startScanner} className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                            <Camera className="h-5 w-5" />
                            مسح ضوئي
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-500/20">
                            <Plus className="h-5 w-5" />
                            رفع مستند
                        </motion.button>
                    </div>
                </div >

                {/* Stats Grid */}
                < div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" >
                    {
                        stats.map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
                                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", stat.color)}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </motion.div>
                        ))
                    }
                </div >

                {/* Search */}
                < form onSubmit={handleSearch} className="mb-8" >
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث في مستنداتك..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                    </div>
                </form >

                {/* Upload Area */}
                <AnimatePresence>
                    {
                        showUpload && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                                <div {...getRootProps()} className={cn("border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all bg-slate-900/30", isDragActive ? "border-purple-500 bg-purple-500/10" : "border-slate-700 hover:border-purple-500/50")}>
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                            <UploadCloud className="h-10 w-10 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">اسحب الملفات هنا</h3>
                                            <p className="text-slate-400">أو اضغط لاختيار الملفات (JPG, PNG)</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Documents */}
                < div className="flex items-center justify-between mb-6" >
                    <h2 className="text-xl font-bold">مستنداتك</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveFilter('ALL')} className={cn("px-4 py-2 rounded-lg text-sm transition-colors", activeFilter === 'ALL' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}>الكل</button>
                        <button onClick={() => setActiveFilter('PASSPORT')} className={cn("px-4 py-2 rounded-lg text-sm transition-colors", activeFilter === 'PASSPORT' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}>جوازات</button>
                        <button onClick={() => setActiveFilter('ID_CARD')} className={cn("px-4 py-2 rounded-lg text-sm transition-colors", activeFilter === 'ID_CARD' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}>هويات</button>
                    </div>
                </div >

                {
                    loadingDocs ? (
                        <div className="flex justify-center py-20" > <Loader2 className="h-8 w-8 text-purple-500 animate-spin" /></div>
                    ) : documents.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="h-10 w-10 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">لا توجد مستندات</h3>
                            <p className="text-slate-400">ارفع أول مستند لبدء التنظيم الذكي</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDocuments.map((doc, i) => (
                                <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", doc.category === 'PASSPORT' ? 'bg-orange-500/20' : doc.category === 'ID_CARD' ? 'bg-blue-500/20' : 'bg-slate-800')}>
                                                {doc.category === 'PASSPORT' ? <FileText className="h-7 w-7 text-orange-400" /> : <CreditCard className="h-7 w-7 text-blue-400" />}
                                            </div>
                                            {doc.status === 'PROCESSING' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-full"><Loader2 className="w-3 h-3 animate-spin" />تحليل</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full"><CheckCircle className="w-3 h-3" />جاهز</span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold mb-1 truncate">{doc.title}</h3>
                                        <p className="text-xs text-slate-500 mb-4">{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</p>
                                        {doc.extractedData?.length > 0 && (
                                            <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                                    <span className="text-xs font-bold text-slate-300">AI</span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2">{doc.extractedData[0].fieldValue?.substring(0, 80)}...</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-4 border-t border-white/5">
                                            <button onClick={() => setSelectedDoc(doc)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Eye className="w-4 h-4" />عرض</button>
                                            <button onClick={() => openShareModal(doc.id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Share2 className="w-4 h-4" />مشاركة</button>
                                            <button onClick={() => deleteDocument(doc.id)} className="flex items-center justify-center gap-2 py-2 px-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                }
            </main >

            {/* AI Chat FAB */}
            < motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowChat(!showChat)} className="fixed bottom-8 left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl shadow-purple-500/40 z-30" >
                {showChat ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.button >

            {/* AI Chat Panel */}
            <AnimatePresence>
                {
                    showChat && (
                        <motion.div initial={{ opacity: 0, x: -50, y: 50 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -50, y: 50 }} className="fixed bottom-24 left-8 w-96 bg-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden z-30 flex flex-col h-[500px]">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
                                <div>
                                    <h3 className="font-bold">المساعد الذكي</h3>
                                    <p className="text-xs text-white/70">GPT-4 Powered</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950" ref={scrollRef}>
                                {chatMessages.map((msg, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <div className={cn("max-w-[85%] p-4 rounded-2xl text-sm", msg.role === 'user' ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none")}>{msg.text}</div>
                                    </motion.div>
                                ))}
                                {chatLoading && <div className="flex justify-start"><div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none"><Loader2 className="h-5 w-5 animate-spin text-purple-400" /></div></div>}
                            </div>
                            <form onSubmit={handleChatSubmit} className="p-4 bg-slate-900 border-t border-white/5 flex gap-3">
                                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="اسأل عن مستنداتك..." className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
                                <button type="submit" disabled={!chatInput.trim()} className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl disabled:opacity-50"><Send className="h-5 w-5" /></button>
                            </form>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Document Preview Modal */}
            <AnimatePresence>
                {
                    selectedDoc && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedDoc(null)}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col md:flex-row">
                                
                                {/* Left Side: Image Preview */}
                                <div className="w-full md:w-1/2 bg-black/50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-l border-white/10 relative">
                                    {selectedDoc.id && (selectedDoc.category === 'PASSPORT' || selectedDoc.category === 'ID_CARD' || selectedDoc.mimeType?.startsWith('image')) ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={`http://localhost:3001/documents/${selectedDoc.id}/download?token=${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`}
                                                alt={selectedDoc.title}
                                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                            />
                                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/80 border border-white/10">
                                                معاينة المستند الأصلي
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                            <p>لا تتوفر معاينة لهذا الملف</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Details & Data */}
                                <div className="w-full md:w-1/2 overflow-y-auto p-6 md:p-8 bg-slate-900">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-black mb-2">{selectedDoc.title}</h2>
                                            <p className="text-slate-400 text-sm">{new Date(selectedDoc.createdAt).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                        <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="h-6 w-6" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-sm text-slate-400 mb-1">الحجم</p><p className="font-bold">{(selectedDoc.size / 1024).toFixed(1)} KB</p></div>
                                        <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-sm text-slate-400 mb-1">النوع</p><p className="font-bold">{selectedDoc.category}</p></div>
                                    </div>

                                    {selectedDoc.extractedData?.length > 0 && (
                                        <div className="space-y-4">
                                            {/* AI Summary */}
                                            {selectedDoc.extractedData.find((d: any) => d.fieldName === 'ai_summary') && (
                                                <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Brain className="h-5 w-5 text-purple-400" />
                                                        <span className="font-bold">تحليل الذكاء الاصطناعي</span>
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {selectedDoc.extractedData.find((d: any) => d.fieldName === 'ai_summary')?.fieldValue}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Quality Score */}
                                            {selectedDoc.extractedData.find((d: any) => d.fieldName === 'quality_score') && (() => {
                                                try {
                                                    const quality = JSON.parse(selectedDoc.extractedData.find((d: any) => d.fieldName === 'quality_score')?.fieldValue || '{}');
                                                    return (
                                                        <div className="bg-white/5 rounded-xl p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm text-slate-400">جودة المستند</span>
                                                                <span className={cn("font-bold text-lg",
                                                                    quality.overall >= 70 ? "text-emerald-400" :
                                                                        quality.overall >= 50 ? "text-yellow-400" : "text-red-400"
                                                                )}>
                                                                    {quality.overall}%
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {[
                                                                    { key: 'brightness', label: 'السطوع', icon: '☀️' },
                                                                    { key: 'contrast', label: 'التباين', icon: '🎨' },
                                                                    { key: 'sharpness', label: 'الوضوح', icon: '🎯' },
                                                                    { key: 'readability', label: 'المقروئية', icon: '📖' }
                                                                ].map(item => (
                                                                    <div key={item.key} className="text-center">
                                                                        <div className="text-lg mb-1">{item.icon}</div>
                                                                        <div className="text-xs text-slate-500">{item.label}</div>
                                                                        <div className={cn("text-sm font-bold",
                                                                            quality[item.key] >= 70 ? "text-emerald-400" :
                                                                                quality[item.key] >= 50 ? "text-yellow-400" : "text-red-400"
                                                                        )}>
                                                                            {quality[item.key]}%
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                } catch { return null; }
                                            })()}

                                            {/* Extracted Fields */}
                                            {selectedDoc.extractedData.filter((d: any) =>
                                                !['ai_summary', 'quality_score', 'raw_text', 'detected_languages'].includes(d.fieldName)
                                            ).length > 0 && (
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <FileCheck className="h-4 w-4 text-blue-400" />
                                                            <span className="text-sm font-medium">البيانات المستخرجة</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {selectedDoc.extractedData
                                                                .filter((d: any) => !['ai_summary', 'quality_score', 'raw_text', 'detected_languages'].includes(d.fieldName))
                                                                .map((field: any, i: number) => (
                                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                                        <span className="text-sm text-slate-400">{field.fieldName}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium">{field.fieldValue}</span>
                                                                            <span className={cn("text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1",
                                                                                field.confidence >= 0.8 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                                                    field.confidence >= 0.6 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                                                                        "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                            )}>
                                                                                {field.confidence >= 0.8 ? <CheckCircle className="w-3 h-3" /> : field.confidence >= 0.6 ? <AlertCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                                                {Math.round(field.confidence * 100)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Detected Languages */}
                                            {selectedDoc.extractedData.find((d: any) => d.fieldName === 'detected_languages') && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg">
                                                    <span className="text-blue-400">🌐</span>
                                                    <span className="text-sm text-slate-400">اللغات المكتشفة:</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedDoc.extractedData.find((d: any) => d.fieldName === 'detected_languages')?.fieldValue}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => handleDownload(selectedDoc)} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Download className="h-5 w-5" />تحميل</button>
                                        <button onClick={() => openShareModal(selectedDoc.id)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10"><Share2 className="h-5 w-5" />مشاركة</button>
                                        <button onClick={() => deleteDocument(selectedDoc.id)} className="bg-red-500/10 text-red-400 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20"><Trash2 className="h-5 w-5" />حذف</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Document Scanner Modal */}
            <AnimatePresence>
                {
                    showScanner && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-50 flex flex-col"
                        >
                            {/* Scanner Header */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                                <div className="flex items-center gap-3">
                                    <Camera className="h-6 w-6" />
                                    <h2 className="font-bold text-lg">ماسح المستندات الذكي</h2>
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">{scanMode === 'auto' ? 'تلقائي' : scanMode === 'burst' ? 'متتابع' : 'يدوي'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowScannerSettings(!showScannerSettings)} className={cn("p-2 rounded-full transition-colors", showScannerSettings ? "bg-white/30" : "hover:bg-white/20")}>
                                        <Sliders className="h-5 w-5" />
                                    </button>
                                    <button onClick={stopScanner} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Camera View or Captured Image */}
                            <div className="flex-1 relative overflow-hidden">
                                {!capturedImage ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Scan Frame Overlay with optional Grid */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-[85%] max-w-md aspect-[3/2] border-2 border-white/50 rounded-2xl relative">
                                                {/* Corner Markers */}
                                                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                                                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                                                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                                                {/* Grid Overlay */}
                                                {showGridOverlay && (
                                                    <>
                                                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20"></div>
                                                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20"></div>
                                                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
                                                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20"></div>
                                                    </>
                                                )}

                                                {/* Scanning Animation */}
                                                {scannerReady && (
                                                    <motion.div
                                                        initial={{ top: 0 }}
                                                        animate={{ top: ['0%', '100%', '0%'] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                            <div className="flex flex-col gap-2">
                                                {/* AI Status */}
                                                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                                                    aiEnabled && scannerReady ? "bg-purple-500/80" : scannerReady ? "bg-emerald-500/80" : "bg-yellow-500/80"
                                                )}>
                                                    {!scannerReady ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" />جارٍ التحميل...</>
                                                    ) : aiEnabled ? (
                                                        <><Sparkles className="h-4 w-4" />AI مُفعّل</>
                                                    ) : (
                                                        <><CheckCircle className="h-4 w-4" />جاهز</>
                                                    )}
                                                </div>

                                                {/* Document Detection Status */}
                                                {aiEnabled && scannerReady && (
                                                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                                                        documentDetected ? "bg-emerald-500/80" : "bg-slate-700/80"
                                                    )}>
                                                        {documentDetected ? (
                                                            <><FileCheck className="h-4 w-4" />تم رصد المستند</>
                                                        ) : (
                                                            <><Search className="h-4 w-4 animate-pulse" />جاري البحث عن مستند...</>
                                                        )}
                                                    </div>
                                                )}

                                                {/* AI Quality Score */}
                                                {isAnalyzing && scannerReady && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full text-sm">
                                                        <Gauge className="h-4 w-4" />
                                                        <span>جودة AI: </span>
                                                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full transition-all",
                                                                    scanScore >= 75 ? "bg-emerald-500" :
                                                                        scanScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                                )}
                                                                style={{ width: `${scanScore}%` }}
                                                            />
                                                        </div>
                                                        <span className={cn("font-bold",
                                                            scanScore >= 75 ? "text-emerald-400" :
                                                                scanScore >= 50 ? "text-yellow-400" : "text-red-400"
                                                        )}>{scanScore}%</span>
                                                    </div>
                                                )}

                                                {/* Alignment & Stability Indicators */}
                                                {aiEnabled && documentDetected && scannerReady && (
                                                    <div className="flex gap-2">
                                                        <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs",
                                                            alignmentScore >= 70 ? "bg-emerald-500/60" : alignmentScore >= 40 ? "bg-yellow-500/60" : "bg-red-500/60"
                                                        )}>
                                                            <Move className="h-3 w-3" />
                                                            {alignmentScore >= 70 ? 'مركز' : alignmentScore >= 40 ? 'قريب' : 'بعيد'}
                                                        </div>
                                                        <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs",
                                                            stabilityScore >= 80 ? "bg-emerald-500/60" : stabilityScore >= 50 ? "bg-yellow-500/60" : "bg-red-500/60"
                                                        )}>
                                                            <Activity className="h-3 w-3" />
                                                            {stabilityScore >= 80 ? 'ثابت' : stabilityScore >= 50 ? 'متحرك' : 'غير ثابت'}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Detected Document Type */}
                                                {aiEnabled && detectedDocType && scannerReady && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/60 rounded-full text-sm">
                                                        <FileText className="h-4 w-4" />
                                                        <span>النوع المكتشف: {detectedDocType}</span>
                                                    </div>
                                                )}

                                                {/* Auto-capture indicator */}
                                                {autoCapturing && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 rounded-full text-sm font-bold"
                                                    >
                                                        <Target className="h-4 w-4 animate-pulse" />
                                                        جاري الالتقاط التلقائي...
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Right side indicators */}
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full text-sm">
                                                    <Zap className="h-4 w-4 text-emerald-400" />
                                                    {scanQuality === 'ultra' ? 'فائق الجودة' : scanQuality === 'high' ? 'عالي' : 'قياسي'}
                                                </div>

                                                {/* AI Processing Indicator */}
                                                {aiProcessing && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/60 rounded-full text-sm">
                                                        <Brain className="h-4 w-4 animate-pulse" />
                                                        تحليل AI...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Settings Panel */}
                                        <AnimatePresence>
                                            {showScannerSettings && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 300 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 300 }}
                                                    className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto"
                                                >
                                                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                                        <Sliders className="h-5 w-5 text-emerald-400" />
                                                        إعدادات الماسح
                                                    </h3>

                                                    {/* Scan Mode */}
                                                    <div className="mb-6">
                                                        <label className="text-sm text-slate-400 mb-2 block">وضع المسح</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[
                                                                { value: 'auto', label: 'تلقائي', icon: Target },
                                                                { value: 'manual', label: 'يدوي', icon: Focus },
                                                                { value: 'burst', label: 'متتابع', icon: Zap }
                                                            ].map(mode => (
                                                                <button
                                                                    key={mode.value}
                                                                    onClick={() => setScanMode(mode.value as 'auto' | 'manual' | 'burst')}
                                                                    className={cn(
                                                                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                                                                        scanMode === mode.value
                                                                            ? "border-emerald-500 bg-emerald-500/20"
                                                                            : "border-white/10 hover:border-white/30"
                                                                    )}
                                                                >
                                                                    <mode.icon className="h-5 w-5" />
                                                                    <span className="text-xs">{mode.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Quality */}
                                                    <div className="mb-6">
                                                        <label className="text-sm text-slate-400 mb-2 block">جودة الصورة</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[
                                                                { value: 'standard', label: 'قياسي', desc: '720p' },
                                                                { value: 'high', label: 'عالي', desc: '1080p' },
                                                                { value: 'ultra', label: 'فائق', desc: '1440p' }
                                                            ].map(q => (
                                                                <button
                                                                    key={q.value}
                                                                    onClick={() => setScanQuality(q.value as 'standard' | 'high' | 'ultra')}
                                                                    className={cn(
                                                                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                                                                        scanQuality === q.value
                                                                            ? "border-emerald-500 bg-emerald-500/20"
                                                                            : "border-white/10 hover:border-white/30"
                                                                    )}
                                                                >
                                                                    <span className="text-sm font-medium">{q.label}</span>
                                                                    <span className="text-xs text-slate-500">{q.desc}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Toggles */}
                                                    <div className="space-y-4 mb-6">
                                                        {/* AI Detection Toggle */}
                                                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Brain className="h-4 w-4 text-purple-400" />
                                                                    <span className="text-sm font-medium text-purple-300">كشف AI ذكي</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setAiEnabled(!aiEnabled)}
                                                                    className={cn("w-12 h-6 rounded-full transition-colors relative", aiEnabled ? "bg-purple-500" : "bg-slate-700")}
                                                                >
                                                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", aiEnabled ? "right-1" : "left-1")} />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-slate-500">اكتشاف حدود المستند، المحاذاة، الثبات، ونوع المستند تلقائياً</p>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">شبكة التوجيه</span>
                                                            <button
                                                                onClick={() => setShowGridOverlay(!showGridOverlay)}
                                                                className={cn("w-12 h-6 rounded-full transition-colors relative", showGridOverlay ? "bg-emerald-500" : "bg-slate-700")}
                                                            >
                                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", showGridOverlay ? "right-1" : "left-1")} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">تحسين تلقائي</span>
                                                            <button
                                                                onClick={() => setAutoEnhance(!autoEnhance)}
                                                                className={cn("w-12 h-6 rounded-full transition-colors relative", autoEnhance ? "bg-emerald-500" : "bg-slate-700")}
                                                            >
                                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", autoEnhance ? "right-1" : "left-1")} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Sliders */}
                                                    {autoEnhance && (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-slate-400">السطوع</span>
                                                                    <span>{brightness}%</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="50"
                                                                    max="150"
                                                                    value={brightness}
                                                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-slate-400">التباين</span>
                                                                    <span>{contrast}%</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="50"
                                                                    max="150"
                                                                    value={contrast}
                                                                    onChange={(e) => setContrast(Number(e.target.value))}
                                                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-slate-400">الحدة</span>
                                                                    <span>{sharpness}%</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="100"
                                                                    max="150"
                                                                    value={sharpness}
                                                                    onChange={(e) => setSharpness(Number(e.target.value))}
                                                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Camera Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="flex items-center justify-center gap-6">
                                                <button
                                                    onClick={switchCamera}
                                                    className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                                >
                                                    <FlipHorizontal className="h-6 w-6" />
                                                </button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={captureImage}
                                                    disabled={!scannerReady}
                                                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
                                                >
                                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                                        <Focus className="h-8 w-8 text-white" />
                                                    </div>
                                                </motion.button>
                                                <button
                                                    onClick={stopScanner}
                                                    className="p-4 bg-red-500/50 rounded-full hover:bg-red-500/70 transition-colors"
                                                >
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>
                                            <p className="text-center text-white/70 mt-4 text-sm">ضع المستند داخل الإطار واضغط للمسح</p>
                                        </div>
                                    </>
                                ) : (
                                    /* Captured Image Preview & Type Selection */
                                    <div className="w-full h-full flex flex-col">
                                        {/* Captured Image */}
                                        <div className="flex-1 relative bg-slate-900">
                                            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/80 rounded-full text-sm font-medium">
                                                <CheckCircle className="h-4 w-4" />
                                                تم المسح بنجاح
                                            </div>
                                        </div>

                                        {/* Document Type Selection */}
                                        <div className="p-6 bg-slate-900 border-t border-white/10">
                                            <h3 className="font-bold text-lg mb-4 text-center">اختر نوع المستند</h3>
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                <button
                                                    onClick={() => setSelectedDocType('PASSPORT')}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                        selectedDocType === 'PASSPORT'
                                                            ? "border-orange-500 bg-orange-500/20"
                                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                                    )}
                                                >
                                                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", selectedDocType === 'PASSPORT' ? "bg-orange-500" : "bg-orange-500/30")}>
                                                        <FileText className="h-7 w-7" />
                                                    </div>
                                                    <span className="font-medium text-sm">جواز سفر</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedDocType('ID_CARD')}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                        selectedDocType === 'ID_CARD'
                                                            ? "border-blue-500 bg-blue-500/20"
                                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                                    )}
                                                >
                                                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", selectedDocType === 'ID_CARD' ? "bg-blue-500" : "bg-blue-500/30")}>
                                                        <CreditCard className="h-7 w-7" />
                                                    </div>
                                                    <span className="font-medium text-sm">بطاقة هوية</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedDocType('OTHER')}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                        selectedDocType === 'OTHER'
                                                            ? "border-purple-500 bg-purple-500/20"
                                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                                    )}
                                                >
                                                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", selectedDocType === 'OTHER' ? "bg-purple-500" : "bg-purple-500/30")}>
                                                        <FolderOpen className="h-7 w-7" />
                                                    </div>
                                                    <span className="font-medium text-sm">مستند آخر</span>
                                                </button>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={retakePhoto}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors"
                                                >
                                                    <Camera className="h-5 w-5" />
                                                    إعادة المسح
                                                </button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={uploadScannedDocument}
                                                    disabled={!selectedDocType}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                                                        selectedDocType
                                                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg"
                                                            : "bg-slate-700 opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <UploadCloud className="h-5 w-5" />
                                                    حفظ المستند
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hidden Canvas for Image Processing */}
                            <canvas ref={canvasRef} className="hidden" />
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Share Modal */}
            <AnimatePresence>
                {
                    showShareModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={closeShareModal}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Share2 className="h-6 w-6 text-blue-400" />
                                        مشاركة المستند
                                    </h2>
                                    <button onClick={closeShareModal} className="p-2 hover:bg-white/10 rounded-full">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {!generatedShareLink ? (
                                    <>
                                        {/* Expiry Time */}
                                        <div className="mb-6">
                                            <label className="text-sm text-slate-400 mb-3 block">مدة الصلاحية</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { value: 1, label: '1 ساعة' },
                                                    { value: 6, label: '6 ساعات' },
                                                    { value: 24, label: 'يوم' },
                                                    { value: 168, label: 'أسبوع' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setShareExpiry(opt.value)}
                                                        className={cn(
                                                            "p-3 rounded-xl border text-sm font-medium transition-all",
                                                            shareExpiry === opt.value
                                                                ? "border-blue-500 bg-blue-500/20 text-blue-400"
                                                                : "border-white/10 hover:border-white/30"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="mb-6 space-y-4">
                                            <label className="text-sm text-slate-400 block">الصلاحيات</label>

                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                        <Eye className="h-5 w-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">السماح بالطباعة</p>
                                                        <p className="text-xs text-slate-500">يمكن للمستلم طباعة المستند</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShareAllowPrint(!shareAllowPrint)}
                                                    className={cn("w-12 h-6 rounded-full transition-colors relative", shareAllowPrint ? "bg-purple-500" : "bg-slate-700")}
                                                >
                                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", shareAllowPrint ? "right-1" : "left-1")} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <Download className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">السماح بالتحميل</p>
                                                        <p className="text-xs text-slate-500">يمكن للمستلم تحميل الملف</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShareAllowDownload(!shareAllowDownload)}
                                                    className={cn("w-12 h-6 rounded-full transition-colors relative", shareAllowDownload ? "bg-blue-500" : "bg-slate-700")}
                                                >
                                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", shareAllowDownload ? "right-1" : "left-1")} />
                                                </button>
                                            </div>

                                            {shareAllowDownload && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="flex items-center justify-between p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                                            <Shield className="h-5 w-5 text-orange-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-orange-400">تحميل مرة واحدة فقط</p>
                                                            <p className="text-xs text-slate-500">الرابط ينتهي بعد أول تحميل</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShareOneTime(!shareOneTime)}
                                                        className={cn("w-12 h-6 rounded-full transition-colors relative", shareOneTime ? "bg-orange-500" : "bg-slate-700")}
                                                    >
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", shareOneTime ? "right-1" : "left-1")} />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Max Views */}
                                        <div className="mb-6">
                                            <label className="text-sm text-slate-400 mb-3 block">الحد الأقصى للمشاهدات (اختياري)</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[null, 1, 5, 10, 50].map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setShareMaxViews(opt)}
                                                        className={cn(
                                                            "p-2 rounded-xl border text-sm font-medium transition-all",
                                                            shareMaxViews === opt
                                                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                                                : "border-white/10 hover:border-white/30"
                                                        )}
                                                    >
                                                        {opt === null ? '∞' : opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={generateShareLink}
                                            disabled={shareLoading}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold flex items-center justify-center gap-2"
                                        >
                                            {shareLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Share2 className="h-5 w-5" />
                                                    إنشاء رابط المشاركة
                                                </>
                                            )}
                                        </motion.button>
                                    </>
                                ) : (
                                    /* Generated Link Display */
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-10 w-10 text-emerald-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">تم إنشاء الرابط!</h3>
                                        <p className="text-sm text-slate-400 mb-4">شارك المستند عبر الرابط أو مباشرة</p>

                                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                                            <p className="text-xs text-slate-500 break-all">{generatedShareLink}</p>
                                        </div>

                                        <div className="text-xs text-slate-500 space-y-1 mb-6 text-right">
                                            <p>⏱️ ينتهي خلال: {shareExpiry} {shareExpiry === 1 ? 'ساعة' : 'ساعات'}</p>
                                            <p>🖨️ الطباعة: {shareAllowPrint ? 'مسموح' : 'ممنوع'}</p>
                                            <p>📥 التحميل: {shareAllowDownload ? (shareOneTime ? 'مرة واحدة' : 'مسموح') : 'ممنوع'}</p>
                                            {shareMaxViews && <p>👁️ الحد الأقصى: {shareMaxViews} مشاهدة</p>}
                                        </div>

                                        {/* Share Buttons */}
                                        <div className="grid grid-cols-4 gap-3 mb-4">
                                            {/* WhatsApp */}
                                            <button
                                                onClick={() => {
                                                    const doc = documents.find(d => d.id === shareDocId);
                                                    const message = `📄 مستند مشترك من وثقني\n\n📋 ${doc?.title}\n⏱️ صالح لمدة ${shareExpiry} ${shareExpiry === 1 ? 'ساعة' : 'ساعات'}\n\n🔗 ${generatedShareLink}`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                                className="flex flex-col items-center gap-2 p-3 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                                            >
                                                <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                <span className="text-xs text-green-400">واتساب</span>
                                            </button>

                                            {/* Telegram */}
                                            <button
                                                onClick={() => {
                                                    const doc = documents.find(d => d.id === shareDocId);
                                                    const message = `📄 مستند مشترك من وثقني\n${doc?.title}\n${generatedShareLink}`;
                                                    window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedShareLink)}&text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                                className="flex flex-col items-center gap-2 p-3 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                                            >
                                                <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                </svg>
                                                <span className="text-xs text-blue-400">تلغرام</span>
                                            </button>

                                            {/* Email */}
                                            <button
                                                onClick={() => {
                                                    const doc = documents.find(d => d.id === shareDocId);
                                                    const subject = `مستند مشترك: ${doc?.title}`;
                                                    const body = `مرحباً،\n\nأشارك معك هذا المستند من وثقني:\n\n📋 ${doc?.title}\n⏱️ صالح لمدة ${shareExpiry} ${shareExpiry === 1 ? 'ساعة' : 'ساعات'}\n\n🔗 ${generatedShareLink}`;
                                                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                                                }}
                                                className="flex flex-col items-center gap-2 p-3 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                                            >
                                                <Mail className="h-6 w-6 text-purple-400" />
                                                <span className="text-xs text-purple-400">بريد</span>
                                            </button>

                                            {/* Copy */}
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedShareLink);
                                                    alert('تم نسخ الرابط!');
                                                }}
                                                className="flex flex-col items-center gap-2 p-3 bg-slate-500/20 rounded-xl hover:bg-slate-500/30 transition-colors border border-slate-500/30"
                                            >
                                                <Copy className="h-6 w-6 text-slate-400" />
                                                <span className="text-xs text-slate-400">نسخ</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={closeShareModal}
                                            className="w-full py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors"
                                        >
                                            إغلاق
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Settings Modal */}
            <AnimatePresence>
                {
                    showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowSettings(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Settings className="h-6 w-6 text-purple-400" />
                                        الإعدادات
                                    </h2>
                                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/10">
                                    {[
                                        { key: 'profile', label: 'الملف الشخصي', icon: '👤' },
                                        { key: 'security', label: 'الأمان', icon: '🔒' },
                                        { key: 'notifications', label: 'الإشعارات', icon: '🔔' }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setSettingsTab(tab.key as any)}
                                            className={cn(
                                                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                                                settingsTab === tab.key
                                                    ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-500"
                                                    : "hover:bg-white/5 text-slate-400"
                                            )}
                                        >
                                            <span className="mr-2">{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto max-h-[60vh]">
                                    {/* Profile Tab */}
                                    {settingsTab === 'profile' && (
                                        <div className="space-y-6">
                                            {/* Avatar Section */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                                                    {editFullName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{userProfile?.fullName}</h3>
                                                    <p className="text-sm text-slate-400">{userProfile?.email}</p>
                                                    <p className="text-xs text-purple-400 mt-1">
                                                        {userProfile?._count?.documents || 0} مستند • خطة {userProfile?.plan === 'FREE' ? 'مجانية' : userProfile?.plan}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Profile Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">الاسم الكامل</label>
                                                    <input
                                                        type="text"
                                                        value={editFullName}
                                                        onChange={(e) => setEditFullName(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">رقم الهاتف</label>
                                                    <input
                                                        type="tel"
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        placeholder="+964"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">الجنسية</label>
                                                    <select
                                                        value={editNationality}
                                                        onChange={(e) => setEditNationality(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    >
                                                        <option value="">اختر الجنسية</option>
                                                        <option value="عراقي">عراقي</option>
                                                        <option value="سعودي">سعودي</option>
                                                        <option value="إماراتي">إماراتي</option>
                                                        <option value="أردني">أردني</option>
                                                        <option value="مصري">مصري</option>
                                                        <option value="سوري">سوري</option>
                                                        <option value="لبناني">لبناني</option>
                                                        <option value="أخرى">أخرى</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">تاريخ الميلاد</label>
                                                    <input
                                                        type="date"
                                                        value={editDateOfBirth}
                                                        onChange={(e) => setEditDateOfBirth(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">العنوان</label>
                                                <input
                                                    type="text"
                                                    value={editAddress}
                                                    onChange={(e) => setEditAddress(e.target.value)}
                                                    placeholder="المدينة، الدولة"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">نبذة شخصية</label>
                                                <textarea
                                                    value={editBio}
                                                    onChange={(e) => setEditBio(e.target.value)}
                                                    rows={3}
                                                    placeholder="اكتب نبذة عنك..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none resize-none"
                                                />
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={saveProfile}
                                                disabled={settingsLoading}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2"
                                            >
                                                {settingsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                                حفظ التغييرات
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Security Tab */}
                                    {settingsTab === 'security' && (
                                        <div className="space-y-6">
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                                    <Shield className="h-5 w-5" />
                                                    <span className="font-bold">تغيير كلمة المرور</span>
                                                </div>
                                                <p className="text-sm text-slate-400">استخدم كلمة مرور قوية لحماية حسابك</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">كلمة المرور الحالية</label>
                                                    <input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">كلمة المرور الجديدة</label>
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="6 أحرف على الأقل"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">تأكيد كلمة المرور</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                                                    />
                                                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                                        <p className="text-red-400 text-xs mt-1">كلمات المرور غير متطابقة</p>
                                                    )}
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleChangePassword}
                                                disabled={settingsLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {settingsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                                تغيير كلمة المرور
                                            </motion.button>

                                            {/* Account Info */}
                                            <div className="mt-8 pt-6 border-t border-white/10">
                                                <h4 className="text-sm font-medium text-slate-400 mb-4">معلومات الحساب</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">تاريخ الإنشاء</span>
                                                        <span>{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ar-IQ') : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">البريد الإلكتروني</span>
                                                        <span>{userProfile?.email}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">الخطة</span>
                                                        <span className="text-purple-400">{userProfile?.plan === 'FREE' ? 'مجانية' : userProfile?.plan}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notifications Tab */}
                                    {settingsTab === 'notifications' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                            <Clock className="h-5 w-5 text-red-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">تنبيهات انتهاء الصلاحية</p>
                                                            <p className="text-xs text-slate-500">تلقي إشعار قبل انتهاء صلاحية المستندات</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditNotifyExpiry(!editNotifyExpiry)}
                                                        className={cn("w-12 h-6 rounded-full transition-colors relative", editNotifyExpiry ? "bg-red-500" : "bg-slate-700")}
                                                    >
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", editNotifyExpiry ? "right-1" : "left-1")} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                            <Share2 className="h-5 w-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">إشعارات المشاركة</p>
                                                            <p className="text-xs text-slate-500">تلقي إشعار عند مشاهدة المستندات المشتركة</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditNotifySharing(!editNotifySharing)}
                                                        className={cn("w-12 h-6 rounded-full transition-colors relative", editNotifySharing ? "bg-blue-500" : "bg-slate-700")}
                                                    >
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", editNotifySharing ? "right-1" : "left-1")} />
                                                    </button>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={saveProfile}
                                                disabled={settingsLoading}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2"
                                            >
                                                {settingsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                                حفظ تفضيلات الإشعارات
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
