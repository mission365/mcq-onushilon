import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Laptop,
  Check,
  Star,
  Users,
  FileCheck,
  BarChart3,
  Smartphone,
  ChevronRight,
  BookMarked,
  Atom,
  FlaskConical,
  Dna,
  Binary
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Section 1: Navbar (Height: 80px, pure white, border: 1px solid #EAEFF5) */}
      <nav className="h-16 sm:h-20 bg-white border-b border-[#EAEFF5] sticky top-0 z-50 px-3 sm:px-8">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center py-1 shrink-0">
            <img
              src="/images/logo.png"
              alt="MCQ Onushilon"
              className="h-8 sm:h-12 w-auto object-contain max-w-[130px] xs:max-w-[160px] sm:max-w-[260px]"
            />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Free 3 model test pill badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ফ্রি ৩টি মডেল টেস্ট</span>
            </div>

            <Link to="/login">
              <Button
                variant="ghost"
                className="text-slate-700 font-bold hover:bg-slate-100/80 rounded-xl px-3 sm:px-5 h-9 sm:h-10 font-bengali text-xs sm:text-base cursor-pointer"
              >
                লগইন
              </Button>
            </Link>

            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-3.5 sm:px-7 h-9 sm:h-11 shadow-md shadow-blue-600/25 border-none font-bengali text-xs sm:text-base cursor-pointer">
                ফ্রি শুরু করুন
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Section 2: Hero (2-Column: Left 55%, Right 45%, bg: #F8FAFF) */}
      <header className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28 bg-[#F8FAFF] border-b border-slate-100">
        {/* Subtle decorative glows and dot grid */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center">
            {/* Left 55% Column */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  THE ULTIMATE MCQ PRACTICE HUB
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold font-bengali text-slate-900 leading-[1.2] mb-4 sm:mb-6 tracking-tight">
                  এইচএসসি ও এসএসসি পরীক্ষার প্রস্তুতির <br className="hidden sm:inline" />
                  <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">
                    সেরা ডিজিটাল প্ল্যাটফর্ম
                  </span>
                </h1>

                {/* Short supporting copy */}
                <p className="text-base sm:text-xl text-slate-600 font-bengali leading-relaxed max-w-xl mb-6 sm:mb-8">
                  বিষয়ভিত্তিক মডেল টেস্ট, টাইমড পরীক্ষা, সঠিক বিশ্লেষণ এবং পূর্ণাঙ্গ ব্যাখ্যাসহ প্রস্তুতি এক জায়গায়।
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bengali font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                    >
                      পরীক্ষা শুরু করো <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>

                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 sm:h-14 px-5 sm:px-7 text-base sm:text-lg font-bengali font-bold rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      ডেমো দেখো / ড্যাশবোর্ড ঘুরে দেখো
                    </Button>
                  </Link>
                </div>

                {/* Below CTA: 3 Small Trust Chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bengali font-medium shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    ৩টি ফ্রি মডেল টেস্ট
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bengali font-medium shadow-xs">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                    তাৎক্ষণিক ফলাফল
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bengali font-medium shadow-xs">
                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                    মোবাইল + ওয়েব সাপোর্ট
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right 45% Column with mainfront_image and floating stats card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative max-w-[540px] mx-auto"
              >
                {/* Main Card Image with rounded-28px and soft border */}
                <div className="relative rounded-2xl sm:rounded-[28px] overflow-hidden border border-slate-200/80 shadow-2xl shadow-blue-900/10 bg-white aspect-[4/3] sm:h-[420px] w-full">
                  <img
                    src="/web_desgin_images/two_student_reading.png"
                    alt="Students practicing MCQs together"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom-left floating stats card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="absolute -bottom-4 left-1 sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 max-w-[190px] xs:max-w-[220px] sm:max-w-[260px]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-extrabold text-slate-900 font-sans leading-none">
                        ৫০,০০০+
                      </div>
                      <div className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                        MCQ Questions
                      </div>
                    </div>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-600 font-semibold">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">SSC + HSC</span>
                    <span className="text-emerald-600">মডেল টেস্ট</span>
                  </div>
                </motion.div>

                {/* Top-right floating badge */}
                <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-lg items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>লাইভ টেস্ট চালু আছে</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Section 3: “Why choose us” / Features (With thumbnails and top-right labels) */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-3">
              ফিচারসমূহ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-bengali text-slate-900 mb-4 tracking-tight">
              কেন আমাদের বেছে নিবে?
            </h2>
            <p className="text-slate-600 font-bengali text-base sm:text-lg">
              পরীক্ষার হলে নিখুঁত প্রস্তুতির জন্য প্রতিটি ফিচার বিশেষভাবে তৈরি করা হয়েছে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: টাইমড পরীক্ষা */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-3xl bg-slate-50/80 p-7 sm:p-8 border border-slate-200/90 hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between overflow-hidden"
            >
              {/* Top-Right Label */}
              <div className="absolute top-6 right-6">
                <span className="px-2.5 py-1 rounded-full bg-blue-100/90 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  Real Exam
                </span>
              </div>

              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200/70 mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-bengali text-slate-900 mb-2">টাইমড পরীক্ষা</h3>
                <p className="text-slate-600 font-bengali text-sm sm:text-base leading-relaxed mb-6">
                  আসল পরীক্ষার পরিবেশ নিশ্চিত করতে প্রতিটি বিষয়ের জন্য নির্দিষ্ট সময় নির্ধারণ ও লাইভ কাউন্টডাউন।
                </p>
              </div>

              {/* Bottom/right 4:3 cropped preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner aspect-[4/3] max-h-44 w-full">
                <img
                  src="/web_desgin_images/book_with_mcqsheet.png"
                  alt="Timed exam preview"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            {/* Feature 2: তাৎক্ষণিক ফলাফল */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-3xl bg-slate-50/80 p-7 sm:p-8 border border-slate-200/90 hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between overflow-hidden"
            >
              {/* Top-Right Label */}
              <div className="absolute top-6 right-6">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  Instant
                </span>
              </div>

              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200/70 mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-bengali text-slate-900 mb-2">তাৎক্ষণিক ফলাফল</h3>
                <p className="text-slate-600 font-bengali text-sm sm:text-base leading-relaxed mb-6">
                  পরীক্ষা শেষ করার সাথে সাথে নম্বর, সঠিক/ভুল উত্তর, নেগেটিভ মার্কিং এবং বিস্তারিত স্কোরকার্ড।
                </p>
              </div>

              {/* Bottom/right preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner aspect-[4/3] max-h-44 w-full">
                <img
                  src="/web_desgin_images/mobile_and_web_mcqpatfrom.png"
                  alt="Instant results on mobile and web"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            {/* Feature 3: সঠিক বিশ্লেষণ */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-3xl bg-slate-50/80 p-7 sm:p-8 border border-slate-200/90 hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between overflow-hidden"
            >
              {/* Top-Right Label */}
              <div className="absolute top-6 right-6">
                <span className="px-2.5 py-1 rounded-full bg-purple-100/90 text-purple-700 text-xs font-bold uppercase tracking-wider">
                  Detailed
                </span>
              </div>

              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200/70 mb-6 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-600">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-bengali text-slate-900 mb-2">সঠিক বিশ্লেষণ</h3>
                <p className="text-slate-600 font-bengali text-sm sm:text-base leading-relaxed mb-6">
                  প্রতিটি প্রশ্নের পাঠ্যবই ভিত্তিক পুঙ্খানুপুঙ্খ ব্যাখ্যা যাতে যেকোনো বিভ্রান্তি পুরোপুরি দূর হয়।
                </p>
              </div>

              {/* Bottom/right preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner aspect-[4/3] max-h-44 w-full">
                <img
                  src="/web_desgin_images/girl_with_leptop_practice_mcq.png"
                  alt="Detailed question analysis"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: “How it works” (3-Step Section) */}
      <section className="py-20 sm:py-28 bg-[#F8FAFF] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              সহজ প্রক্রিয়া
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-bengali text-slate-900 mb-3">
              কীভাবে প্রস্তুতি শুরু করবেন?
            </h2>
            <p className="text-slate-600 font-bengali text-base">
              মাত্র ৩টি সহজ ধাপে যেকোনো সময় যেকোনো ডিভাইস থেকে পরীক্ষা দিন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mb-6">
                ০১
              </div>
              <h3 className="text-xl font-bold font-bengali text-slate-900 mb-2">অ্যাকাউন্ট খুলুন</h3>
              <p className="text-slate-600 font-bengali text-sm leading-relaxed">
                আপনার নাম ও ইমেইল দিয়ে বিনামূল্যে একটি অ্যাকাউন্ট তৈরি করে ইমেইল ভেরিফাই করুন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mb-6">
                ০২
              </div>
              <h3 className="text-xl font-bold font-bengali text-slate-900 mb-2">বিষয় ও মাধ্যম নির্বাচন করুন</h3>
              <p className="text-slate-600 font-bengali text-sm leading-relaxed">
                বাংলা ভার্সন বা ইংলিশ ভার্সন বেছে নিয়ে আপনার পছন্দের বিষয় ও অধ্যায় সিলেক্ট করুন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-black text-lg flex items-center justify-center mb-6">
                ০৩
              </div>
              <h3 className="text-xl font-bold font-bengali text-slate-900 mb-2">মডেল টেস্ট দিন ও ফলাফল দেখুন</h3>
              <p className="text-slate-600 font-bengali text-sm leading-relaxed">
                টাইমড পরীক্ষা শেষ করে তাৎক্ষণিক সঠিক উত্তর, ভুল উত্তর ও পূর্ণাঙ্গ ব্যাখ্যা পর্যালোচনা করুন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Subject preview */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                পাঠ্যসূচি
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-bengali text-slate-900 tracking-tight">
                বিষয়ভিত্তিক মডেল টেস্টসমূহ
              </h2>
              <p className="text-slate-600 font-bengali text-base sm:text-lg mt-2">
                NCTB সিলেবাসের প্রতিটি অধ্যায় ও বোর্ড প্রশ্নের সমন্বয়ে প্রস্তুত।
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 font-bengali inline-flex items-center gap-1 self-start md:self-auto"
            >
              সকল বিষয় দেখুন <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { title: 'বাংলা ১ম পত্র', sub: 'Bangla 1st Paper', count: '২০+ টেস্ট', free: true, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
              { title: 'বাংলা ২য় পত্র', sub: 'Bangla 2nd Paper', count: '১৫+ টেস্ট', free: false, icon: BookMarked, color: 'text-teal-600 bg-teal-50' },
              { title: 'ইংরেজি ১ম পত্র', sub: 'English 1st Paper', count: '১৮+ টেস্ট', free: true, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
              { title: 'ইংরেজি ২য় পত্র', sub: 'English 2nd Paper', count: '১৫+ টেস্ট', free: false, icon: BookMarked, color: 'text-indigo-600 bg-indigo-50' },
              { title: 'আইসিটি (ICT)', sub: 'Information Technology', count: '২৫+ টেস্ট', free: true, icon: Binary, color: 'text-violet-600 bg-violet-50' },
              { title: 'পদার্থবিজ্ঞান', sub: 'Physics 1st & 2nd', count: '৩০+ টেস্ট', free: false, icon: Atom, color: 'text-cyan-600 bg-cyan-50' },
              { title: 'রসায়ন', sub: 'Chemistry 1st & 2nd', count: '২৮+ টেস্ট', free: false, icon: FlaskConical, color: 'text-amber-600 bg-amber-50' },
              { title: 'জীববিজ্ঞান', sub: 'Biology 1st & 2nd', count: '২২+ টেস্ট', free: false, icon: Dna, color: 'text-rose-600 bg-rose-50' },
            ].map((sub, i) => {
              const IconComp = sub.icon;
              return (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-white group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${sub.color}`}>
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {sub.free ? (
                        <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bengali">
                          ফ্রি
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bengali">
                          মডেল টেস্ট
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base sm:text-lg font-bengali text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">{sub.sub}</p>
                  </div>
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bengali">
                    <span>{sub.count}</span>
                    <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      প্রবেশ →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Student proof / credibility */}
      <section className="py-16 sm:py-28 bg-[#F8FAFF] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-blue-600 font-sans">৫০,০০০+</div>
              <div className="text-slate-600 font-bengali text-xs sm:text-base mt-1 font-medium">প্রশ্ন ভান্ডার</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-sans">৩০+</div>
              <div className="text-slate-600 font-bengali text-xs sm:text-base mt-1 font-medium">বিষয় ও পত্র</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-600 font-sans">৩টি</div>
              <div className="text-slate-600 font-bengali text-xs sm:text-base mt-1 font-medium">ফ্রি মডেল টেস্ট</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-purple-600 font-sans">১০০%</div>
              <div className="text-slate-600 font-bengali text-xs sm:text-base mt-1 font-medium">তাৎক্ষণিক বিশ্লেষণ</div>
            </div>
          </div>

          {/* Testimonial Cards & Visual Support */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl max-h-[360px]">
                <img
                  src="/web_desgin_images/four_studens_reading.png"
                  alt="Students group study"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                শিক্ষার্থীদের অভিজ্ঞতা
              </div>
              <h2 className="text-3xl font-bold font-bengali text-slate-900">
                কেন শিক্ষার্থীরা MCQ অনুশীলনে ভরসা রাখছে?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 font-bengali text-sm leading-relaxed mb-4">
                    “বোর্ড পরীক্ষার জন্য টাইম ম্যানেজমেন্ট সবচেয়ে বড় সমস্যা ছিল। এখানে ঘড়ি দেখে পরীক্ষা দিয়ে আমার স্পিড ও একিউরেসি অনেক বেড়েছে।”
                  </p>
                  <div className="font-bengali">
                    <div className="font-bold text-slate-900 text-sm">তানভীর ইসলাম</div>
                    <div className="text-xs text-slate-500">এইচএসসি বিজ্ঞান বিভাগ, নটর ডেম কলেজ</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 font-bengali text-sm leading-relaxed mb-4">
                    “প্রতিটি ভুলের পর বিস্তারিত ব্যাখ্যা পাওয়া যায়, যা বই খুলে খুঁজতে হতো। ইংলিশ ভার্সন ও বাংলা ভার্সন দুই মাধ্যমেই পরীক্ষা দেওয়া যায়।”
                  </p>
                  <div className="font-bengali">
                    <div className="font-bold text-slate-900 text-sm">সাদিয়া রহমান</div>
                    <div className="text-xs text-slate-500">এইচএসসি পরীক্ষার্থী, ভিকারুননিসা নূন স্কুল</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Footer */}
      <footer className="py-14 bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="inline-block p-1.5 px-3 bg-white rounded-xl shadow-xs">
                <img
                  src="/images/logo.png"
                  alt="MCQ Onushilon"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-400 font-bengali text-sm leading-relaxed">
                এইচএসসি ও এসএসসি পরীক্ষার্থীদের জন্য বাংলাদেশের সেরা অনলাইন এমসিকিউ অনুশীলন ও মডেল টেস্ট প্ল্যাটফর্ম।
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">দ্রুত লিংক</h5>
              <ul className="space-y-2.5 text-sm font-bengali text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">ফ্রি রেজিস্ট্রেশন</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">লগইন</Link></li>
                <li><Link to="/select-version" className="hover:text-white transition-colors">ভার্সন নির্বাচন</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">ড্যাশবোর্ড</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">বিষয়সমূহ</h5>
              <ul className="space-y-2.5 text-sm font-bengali text-slate-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">বাংলা ও ইংরেজি</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">পদার্থবিজ্ঞান ও রসায়ন</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">উচ্চতর গণিত ও জীববিজ্ঞান</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">যোগাযোগ ও সহায়তা</h5>
              <p className="text-sm font-bengali text-slate-400 mb-3">
                যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>ইমেইল: <span className="text-slate-200">support@novcleda.com</span></div>
                <div>সাপোর্ট সময়: সকাল ৯টা – রাত ১০টা</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 font-bengali">
            © ২০২৬ MCQ অনুশীলন। সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
