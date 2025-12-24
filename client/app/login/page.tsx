'use client';

import { useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, ScanLine, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const registered = searchParams.get('registered');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:3001/auth/login', formData);
            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (!err.response) {
                setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.');
            } else {
                setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                    <ScanLine className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">وثقني</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">مرحباً بعودتك</h1>
            <p className="text-slate-400 mb-8">سجل دخولك للوصول إلى خزنتك الآمنة</p>
            {registered && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    تم إنشاء حسابك بنجاح!
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
                <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="email" required placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500 transition-all" />
                </div>
                <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="password" required placeholder="كلمة المرور" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500 transition-all" />
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </motion.button>
            </form>
            <p className="text-slate-500 text-center mt-8">ليس لديك حساب؟ <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">إنشاء حساب</Link></p>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex" dir="rtl">
            <div className="flex-1 flex items-center justify-center p-8">
                <Suspense fallback={<div className="text-white">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px]" />
                    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-600/30 rounded-full blur-[60px]" />
                </div>
                <div className="relative z-10 text-center p-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                        <ScanLine className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">مستنداتك في انتظارك</h2>
                    <p className="text-slate-400 text-sm">سجل دخولك لمتابعة إدارة ملفاتك</p>
                </div>
            </div>
        </div>
    );
}
