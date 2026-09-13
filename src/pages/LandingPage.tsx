import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Clock, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-8 border-b border-slate-100 max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-orange-500">MCQ<span className="text-[#3B63EA]">Onushilon</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login">
            <Button variant="ghost" className="text-slate-600 font-bold hover:bg-slate-50 rounded-xl px-6">লগইন</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-100 border-none h-11">রেজিস্ট্রেশন</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-24 pb-32 lg:pt-40 lg:pb-52 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8">
                The Ultimate MCQ Practice Hub
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold font-bengali text-slate-900 leading-[1.1] mb-8 tracking-tight">
                এইচএসসি পরীক্ষার প্রস্তুতির <br /> 
                <span className="text-blue-600">সেরা ডিজিটাল প্ল্যাটফর্ম</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-bengali leading-relaxed">
                বিষয়ভিত্তিক মডেল টেস্ট, সঠিক উত্তর বিশ্লেষণ এবং পূর্ণাঙ্গ মেধা যাচাইয়ের জন্য আজই আমাদের সাথে যুক্ত হও।
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-16 px-10 text-xl font-bengali font-bold rounded-2xl shadow-xl shadow-blue-200 border-none text-white transition-all transform hover:scale-105 hover:translate-y-[-2px]">
                    পরীক্ষা শুরু করো <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bengali font-bold rounded-2xl border-2 border-slate-200 text-slate-700 hover:bg-white hover:border-blue-400 transition-all">
                    ড্যাশবোর্ডে যাও
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] -z-10"></div>
      </header>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 text-slate-900">
             <h2 className="text-3xl font-bold font-bengali mb-4">কেন আমাদের বেছে নিবে?</h2>
             <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Clock className="w-8 h-8 text-blue-600" />,
                title: "টাইমড পরীক্ষা",
                desc: "আসল পরীক্ষার পরিবেশ নিশ্চিত করতে নির্দিষ্ট সময়ের মধ্যে পরীক্ষা দেওয়ার ব্যবস্থা।"
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
                title: "তাৎক্ষণিক ফলাফল",
                desc: "পরীক্ষা শেষ হওয়ার পরপরই বিস্তারিত মার্কস ও সঠিক উত্তরের এনালাইসিস দেখে নাও।"
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
                title: "সঠিক বিশ্লেষণ",
                desc: "প্রতিটি প্রশ্নের বিস্তারিত ব্যাখ্যা এবং সঠিক উত্তরের পেছনের লজিক বোঝার সুযোগ।"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-10 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold font-bengali mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 font-bengali text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-orange-500">MCQ<span className="text-[#3B63EA]">Onushilon</span></span>
          </div>
          <p className="text-slate-400 font-bengali text-sm font-medium">© ২০২৬ এইচএসসি এক্সাম হাব। সকল স্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
