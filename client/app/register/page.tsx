'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, ScanLine, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', formData);
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ ما');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex" dir="rtl">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                            <ScanLine className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white">وثقني</span>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">إنشاء حساب جديد</h1>
                    <p className="text-slate-400 mb-8">انضم لآلاف المستخدمين الذين يثقون بنا لحفظ مستنداتهم</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                placeholder="الاسم الكامل"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                placeholder="البريد الإلكتروني"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                placeholder="كلمة المرور"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                        </motion.button>
                    </form>

                    <p className="text-slate-500 text-center mt-8">
                        لديك حساب؟{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                            سجل دخولك
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px]" />
                    <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-blue-600/30 rounded-full blur-[60px]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 text-center p-12"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-purple-500/30 pulse-glow">
                        <ScanLine className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">خزنتك الآمنة</h2>
                    <p className="text-slate-400 max-w-sm">كل مستنداتك في مكان واحد، مشفرة ومحمية بأحدث تقنيات الأمان</p>
                </motion.div>
            </div>
        </div>
    );
}
