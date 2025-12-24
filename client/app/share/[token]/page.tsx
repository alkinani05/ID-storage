'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, Shield, Sparkles, Printer, Clock, Eye, AlertTriangle } from 'lucide-react';

interface Permissions {
    allowDownload: boolean;
    allowPrint: boolean;
    oneTimeDownload: boolean;
    downloadUsed: boolean;
    accessType: string;
    expiresAt: string;
    viewsCount: number;
    maxViews: number | null;
}

export default function SharedDocumentPage() {
    const params = useParams();
    const token = params?.token as string;
    const [document, setDocument] = useState<any>(null);
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!token) return;
        const fetchDoc = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/share/${token}`);
                setDocument(res.data.document);
                setPermissions(res.data.permissions);
            } catch (err: any) {
                const msg = err.response?.data?.message || 'هذا الرابط غير صالح أو انتهت صلاحيته.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [token]);

    const handleDownload = async () => {
        if (!permissions?.allowDownload) {
            alert('التحميل غير مسموح لهذا الرابط');
            return;
        }
        if (permissions.oneTimeDownload && permissions.downloadUsed) {
            alert('تم استخدام التحميل مسبقاً');
            return;
        }

        setDownloading(true);
        try {
            const res = await axios.get(`http://localhost:3001/share/${token}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = window.document.createElement('a');
            link.href = url;
            link.setAttribute('download', document?.originalName || document?.title || 'document');
            window.document.body.appendChild(link);
            link.click();
            link.remove();

            // Update permissions to show download is used
            if (permissions.oneTimeDownload) {
                setPermissions({ ...permissions, downloadUsed: true });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'فشل التحميل';
            alert(msg);
        }
        setDownloading(false);
    };

    const handlePrint = () => {
        if (!permissions?.allowPrint) {
            alert('الطباعة غير مسموحة لهذا الرابط');
            return;
        }
        window.print();
    };

    const formatExpiry = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 24) {
            return `${Math.floor(diffHours / 24)} يوم`;
        } else if (diffHours > 0) {
            return `${diffHours} ساعة`;
        } else if (diffMins > 0) {
            return `${diffMins} دقيقة`;
        }
        return 'منتهي';
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-4">
            <div className="text-center">
                <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">تعذر الوصول للمستند</h1>
                <p className="text-slate-400">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 bg-[url('/grid.svg')] bg-fixed print:bg-white" dir="rtl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl print:bg-white print:text-black print:shadow-none">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 print:hidden">
                        <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black mb-2 print:text-black">{document.title}</h1>
                    <p className="text-slate-400 print:text-gray-600">تمت مشاركة هذا المستند معك عبر وثقني</p>
                </div>

                {/* Permissions Info */}
                {permissions && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6 print:hidden">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 rounded-full text-xs">
                            <Clock className="h-3 w-3 text-blue-400" />
                            <span>ينتهي خلال: {formatExpiry(permissions.expiresAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 rounded-full text-xs">
                            <Eye className="h-3 w-3 text-purple-400" />
                            <span>المشاهدات: {permissions.viewsCount}{permissions.maxViews ? `/${permissions.maxViews}` : ''}</span>
                        </div>
                        {permissions.oneTimeDownload && !permissions.downloadUsed && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 rounded-full text-xs text-orange-400">
                                <AlertTriangle className="h-3 w-3" />
                                <span>تحميل مرة واحدة</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 print:border-gray-300">
                        <p className="text-slate-500 text-sm mb-1 print:text-gray-500">النوع</p>
                        <p className="font-bold text-lg print:text-black">{document.category}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 print:border-gray-300">
                        <p className="text-slate-500 text-sm mb-1 print:text-gray-500">الحجم</p>
                        <p className="font-bold text-lg print:text-black">{(document.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>

                {/* Document Preview for Images */}
                {document.mimeType?.startsWith('image') && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-white/10">
                        <img
                            src={`http://localhost:3001/share/${token}/download`}
                            alt={document.title}
                            className="w-full h-auto"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    </div>
                )}

                {document.extractedData?.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 mb-8 print:bg-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-purple-400 print:text-purple-600" />
                            <span className="font-bold text-purple-200 print:text-purple-800">البيانات المستخرجة</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed print:text-gray-700">{document.extractedData[0].fieldValue}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 print:hidden">
                    {permissions?.allowPrint && (
                        <button
                            onClick={handlePrint}
                            className="flex-1 bg-purple-600/20 border border-purple-500/30 py-4 rounded-2xl font-bold text-lg hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer className="h-6 w-6 text-purple-400" />
                            <span className="text-purple-300">طباعة</span>
                        </button>
                    )}

                    {permissions?.allowDownload && (
                        <button
                            onClick={handleDownload}
                            disabled={downloading || (permissions.oneTimeDownload && permissions.downloadUsed)}
                            className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${permissions.oneTimeDownload && permissions.downloadUsed
                                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-purple-500/20 hover:scale-[1.02]'
                                }`}
                        >
                            {downloading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : permissions.oneTimeDownload && permissions.downloadUsed ? (
                                <>
                                    <Shield className="h-6 w-6" />
                                    تم استخدام التحميل
                                </>
                            ) : (
                                <>
                                    <Download className="h-6 w-6" />
                                    تحميل المستند
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* View Only Notice */}
                {!permissions?.allowDownload && !permissions?.allowPrint && (
                    <div className="text-center py-4 text-slate-400 text-sm">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-slate-500" />
                        هذا الرابط للعرض فقط
                    </div>
                )}
            </motion.div>
        </div>
    );
}
