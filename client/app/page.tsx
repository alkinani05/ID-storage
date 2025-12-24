'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap, FileText, Brain, Lock, Sparkles, ChevronLeft, ScanLine, Upload, Share2, Bell, CheckCircle, ArrowLeft, Star, Users, Globe } from 'lucide-react';

const features = [
  { icon: Shield, title: 'حماية عسكرية', desc: 'تشفير AES-256 لأقصى درجات الأمان', color: 'from-emerald-500 to-teal-600' },
  { icon: Brain, title: 'ذكاء اصطناعي', desc: 'تحليل وفهم المستندات تلقائياً', color: 'from-purple-500 to-pink-600' },
  { icon: Zap, title: 'سرعة فائقة', desc: 'رفع ومسح ضوئي في ثوانٍ', color: 'from-yellow-500 to-orange-600' },
  { icon: Bell, title: 'تنبيهات ذكية', desc: 'إشعارات قبل انتهاء الصلاحية', color: 'from-blue-500 to-cyan-600' },
];

const stats = [
  { number: '50K+', label: 'مستخدم نشط', icon: Users },
  { number: '1M+', label: 'مستند محفوظ', icon: FileText },
  { number: '99.9%', label: 'وقت التشغيل', icon: Globe },
  { number: '4.9', label: 'تقييم المستخدمين', icon: Star },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden" dir="rtl">

      {/* Animated Gradient Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 py-5 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                <ScanLine className="h-7 w-7 text-white" />
              </div>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">وثقني</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium px-4 py-2">
              دخول
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              >
                ابدأ الآن
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 lg:pt-24 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-300">نظام ذكي لإدارة الوثائق</span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="block text-white">احفظ وثائقك</span>
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">بأمان وذكاء</span>
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed">
                منصة متكاملة لحفظ مستنداتك الشخصية والرسمية. مسح ضوئي ذكي، تحليل بالذكاء الاصطناعي، وتنبيهات قبل انتهاء الصلاحية.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-3"
                  >
                    <span>ابدأ مجاناً</span>
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                  >
                    لدي حساب
                  </motion.button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-10 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>مجاني للأبد</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>دعم عربي</span>
                </div>
              </div>
            </motion.div>

            {/* Visual Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Main Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">wathiqni.app</div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {['12 مستند', '3 منتهية', '5 مشاركة'].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold">{stat.split(' ')[0]}</div>
                        <div className="text-xs text-slate-500">{stat.split(' ')[1]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Document Cards */}
                  <div className="space-y-3">
                    {[
                      { title: 'جواز السفر', status: 'صالح', color: 'emerald' },
                      { title: 'البطاقة الوطنية', status: 'ينتهي قريباً', color: 'yellow' },
                      { title: 'رخصة القيادة', status: 'صالح', color: 'emerald' },
                    ].map((doc, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/5"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-xs text-slate-500">آخر تحديث: اليوم</div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full bg-${doc.color}-500/20 text-${doc.color}-400`}>
                          {doc.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-2xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">تشفير نهائي</div>
                  <div className="text-xs text-white/70">AES-256</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 shadow-2xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">AI مدمج</div>
                  <div className="text-xs text-white/70">تحليل ذكي</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6 lg:px-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{stat.number}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black mb-4">
              لماذا <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">وثقني</span>؟
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">كل ما تحتاجه لإدارة مستنداتك في مكان واحد</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black mb-4">كيف يعمل؟</h2>
            <p className="text-slate-400">ثلاث خطوات بسيطة</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'أنشئ حساب', desc: 'سجل مجاناً في أقل من دقيقة', icon: Users },
              { step: '02', title: 'ارفع مستنداتك', desc: 'امسح أو ارفع صور مستنداتك', icon: Upload },
              { step: '03', title: 'استمتع بالحماية', desc: 'وثائقك محمية ومنظمة للأبد', icon: Shield },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-purple-500/20 rounded-3xl mb-6">
                  <item.icon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-5xl font-black text-purple-500/10">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-purple-500/20 backdrop-blur-xl rounded-3xl p-12">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-black mb-4">جاهز للبدء؟</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">انضم إلى آلاف المستخدمين الذين يثقون في وثقني لحماية مستنداتهم</p>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-2xl inline-flex items-center gap-3"
                >
                  <span>أنشئ حسابك المجاني</span>
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <ScanLine className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">وثقني</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 وثقني. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">الشروط والأحكام</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">اتصل بنا</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
