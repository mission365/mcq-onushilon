import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle,
  ShieldCheck,
  BookOpen,
  LineChart,
  Smartphone,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      title: 'টাইমড পরীক্ষা',
      label: 'Real Exam',
      labelColor: 'bg-blue-100 text-blue-700',
      icon: Clock,
      desc: 'আসল পরীক্ষার পরিবেশ নিশ্চিত করতে প্রতিটি বিষয়ের জন্য নির্দিষ্ট সময় ও লাইভ কাউন্টডাউন টাইমার।',
      image: '/web_desgin_images/book_with_mcqsheet.png',
    },
    {
      title: 'তাৎক্ষণিক ফলাফল',
      label: 'Instant',
      labelColor: 'bg-emerald-100 text-emerald-800',
      icon: CheckCircle,
      desc: 'পরীক্ষা শেষ করার সাথে সাথে মোট নম্বর, সঠিক ও ভুল উত্তরের সংখ্যা এবং পুঙ্খানুপুঙ্খ স্কোরকার্ড।',
      image: '/web_desgin_images/mobile_and_web_mcqpatfrom.png',
    },
    {
      title: 'সঠিক বিশ্লেষণ',
      label: 'Detailed',
      labelColor: 'bg-purple-100 text-purple-700',
      icon: ShieldCheck,
      desc: 'প্রতিটি প্রশ্নের পাঠ্যবই ভিত্তিক পুঙ্খানুপুঙ্খ ব্যাখ্যা যাতে যেকোনো ভুল ধারণা স্থায়ীভাবে দূর হয়।',
      image: '/web_desgin_images/girl_with_leptop_practice_mcq.png',
    },
    {
      title: 'বিষয়ভিত্তিক পূর্ণাঙ্গ প্রস্তুতি',
      label: 'Subject-Wise',
      labelColor: 'bg-amber-100 text-amber-800',
      icon: BookOpen,
      desc: 'NCTB সিলেবাসের প্রতিটি অধ্যায় ও বোর্ড প্রশ্নের সমন্বয়ে সাজানো মডেল টেস্ট ও কুইজ।',
      image: '/web_desgin_images/books_study_materials.png',
    },
    {
      title: 'অগ্রগতি ও পারফরম্যান্স ট্র্যাকিং',
      label: 'Analytics',
      labelColor: 'bg-rose-100 text-rose-700',
      icon: LineChart,
      desc: 'আপনার কোন বিষয়ে দুর্বলতা আর কোনটিতে শক্তি—গ্রাফ ও পার্সেন্টাইলের মাধ্যমে নিবিড় পর্যবেক্ষণ।',
      image: '/web_desgin_images/tacher_student_study.png',
    },
    {
      title: 'মোবাইল ও ওয়েব ফ্রেন্ডলি',
      label: 'Responsive',
      labelColor: 'bg-cyan-100 text-cyan-800',
      icon: Smartphone,
      desc: 'স্মার্টফোন, ট্যাবলেট কিংবা ল্যাপটপ—যেকোনো ডিভাইসে একই গতি ও স্বাচ্ছন্দ্যে পরীক্ষা দিন।',
      image: '/web_desgin_images/mobile_and_web_mcqpatfrom.png',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="h-20 bg-white border-b border-[#EAEFF5] sticky top-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center py-1">
            <img
              src="/images/logo.png"
              alt="MCQ Onushilon"
              className="h-11 sm:h-13 w-auto object-contain max-w-[220px] sm:max-w-[260px]"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-slate-700 hover:bg-slate-100 rounded-xl px-5 font-bengali">
                লগইন
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 shadow-md shadow-blue-600/25 border-none font-bengali">
                ফ্রি শুরু করুন
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="py-16 sm:py-24 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            প্ল্যাটফর্ম ফিচারসমূহ
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-bengali text-slate-900 tracking-tight leading-tight mb-4">
            এইচএসসি পরীক্ষার সেরা প্রস্তুতির জন্য যা কিছু প্রয়োজন
          </h1>
          <p className="text-slate-600 font-bengali text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            সময় সচেতনতা বৃদ্ধি, প্রতিটি অধ্যায়ের নির্ভুল মূল্যায়ন এবং বোর্ড স্ট্যান্ডার্ড পরীক্ষা পদ্ধতির পূর্ণাঙ্গ মেলবন্ধন।
          </p>
        </div>
      </header>

      {/* 6 Features Grid */}
      <main className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComp = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-3xl bg-white p-7 sm:p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Right Label */}
                <div className="absolute top-6 right-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${feature.labelColor}`}>
                    {feature.label}
                  </span>
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-bengali text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 font-bengali text-sm sm:text-base leading-relaxed mb-6">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom preview image */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3] max-h-48 w-full shadow-inner">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-600/20">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-bengali mb-2">
              আজই আপনার প্রথম ফ্রি মডেল টেস্ট দিন
            </h3>
            <p className="text-blue-100 font-bengali text-base max-w-xl">
              কোনো ক্রেডিট কার্ড ছাড়াই রেজিস্ট্রেশন করে তাৎক্ষণিক প্রস্তুতি যাচাই করুন।
            </p>
          </div>
          <Link to="/register">
            <Button size="lg" className="h-14 px-8 text-base font-bengali font-bold rounded-xl bg-white text-blue-600 hover:bg-slate-100 shadow-lg cursor-pointer shrink-0">
              ফ্রি শুরু করুন <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 font-bengali bg-white">
        © ২০২৬ MCQ অনুশীলন। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
};

export default FeaturesPage;
