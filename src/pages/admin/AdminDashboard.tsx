import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import Navbar from '@/src/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, FileText, BookMarked, TrendingUp, ChevronRight, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { isPaymentSettingsSubject } from '@/src/lib/paymentSettings';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    subjects: 0,
    attempts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, examsSnap, subjectsSnap, attemptsSnap] = await Promise.all([
          getDocs(collection(db, 'profiles')),
          getDocs(collection(db, 'exams')),
          getDocs(collection(db, 'subjects')),
          getDocs(collection(db, 'attempts'))
        ]);

        setStats({
          users: usersSnap.size,
          exams: examsSnap.size,
          subjects: subjectsSnap.docs.filter((doc) => !isPaymentSettingsSubject(doc.id)).length,
          attempts: attemptsSnap.size
        });
      } catch (err) {
        console.error("Stats fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role="admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold font-sans tracking-tight text-gray-900 mb-2">Admin Control</h1>
            <p className="text-gray-500 font-bengali">প্ল্যাটফর্ম ম্যানেজমেন্ট এবং পরিসংখ্যান</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <Link to="/admin/subjects">
                <Button className="font-bengali bg-gray-900 hover:bg-black h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-gray-200 border-none transition-all">
                  <PlusCircle className="w-5 h-5" /> নতুন বিষয়
                </Button>
             </Link>
             <Link to="/admin/exams">
                <Button className="font-bengali bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-blue-100 border-none transition-all">
                  <PlusCircle className="w-5 h-5" /> নতুন পরীক্ষা
                </Button>
             </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "মোট ছাত্র", value: stats.users, icon: <Users className="w-6 h-6" />, color: "bg-blue-500", shadow: "shadow-blue-100" },
              { label: "মোট পরীক্ষা", value: stats.exams, icon: <FileText className="w-6 h-6" />, color: "bg-green-500", shadow: "shadow-green-100" },
              { label: "মোট বিষয়", value: stats.subjects, icon: <BookMarked className="w-6 h-6" />, color: "bg-purple-500", shadow: "shadow-purple-100" },
              { label: "অংশগ্রহণ", value: stats.attempts, icon: <TrendingUp className="w-6 h-6" />, color: "bg-amber-500", shadow: "shadow-amber-100" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                className={`${stat.shadow} shadow-2xl`}
              >
                <Card className="rounded-[2rem] border-none overflow-hidden h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                    <CardTitle className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400">{stat.label}</CardTitle>
                    <div className={`${stat.color} p-2 rounded-xl text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="text-4xl font-sans font-black text-gray-900">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="rounded-3xl border-gray-100 shadow-sm p-8">
              <h3 className="text-xl font-bold font-sans text-gray-900 mb-6 flex items-center gap-2">
                 Quick Navigation <ChevronRight className="w-5 h-5 text-gray-300" />
              </h3>
              <div className="space-y-3">
                 {[
                   { title: "ম্যানেজ বিষয়সমূহ", desc: "বিষয় পরিবর্তন বা ডিলিট করুন", path: "/admin/subjects" },
                   { title: "মডেল টেস্ট ম্যানেজমেন্ট", desc: "নতুন পরীক্ষা ও সেটিং যুক্ত করুন", path: "/admin/exams" },
                   { title: "পেমেন্ট রিকোয়েস্ট", desc: "bKash সাবমিশন approve/reject করুন", path: "/admin/payments" }
                 ].map((nav, i) => (
                   <Link key={i} to={nav.path} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all group">
                      <div>
                        <h4 className="font-bold font-bengali text-gray-900 group-hover:text-blue-700">{nav.title}</h4>
                        <p className="text-sm font-bengali text-gray-500">{nav.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                   </Link>
                 ))}
              </div>
           </Card>
           
           <Card className="rounded-3xl border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center bg-gray-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -ml-12 -mb-12 blur-2xl" />
              
              <div className="relative">
                <FileText className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold font-sans mb-2">Content Strategy</h3>
                <p className="text-gray-400 text-sm font-bengali max-w-xs leading-relaxed">
                  পরীক্ষার সংখ্যা বাড়ানোর মাধ্যমে প্ল্যাটফর্মকে আরো সমৃদ্ধ করুন।
                </p>
                <div className="mt-8">
                  <Link to="/admin/exams">
                    <Button variant="secondary" className="rounded-full px-8 h-12 font-bengali gap-2">
                      নতুন কন্টেন্ট যোগ করুন <PlusCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
           </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
