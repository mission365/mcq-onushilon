import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Subject } from '@/src/types';
import Navbar from '@/src/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookMarked, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const Dashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.email === 'mission.use01@gmail.com') {
          setIsDeveloper(true);
        }
        const q = query(collection(db, 'subjects'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const makeAdmin = async () => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'profiles', user.uid), { role: 'admin' }, { merge: true });
      toast.success("আপনি এখন অ্যাডমিন! ড্যাশবোর্ড রিফ্রেশ করুন।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-bengali text-slate-900 mb-3 tracking-tight">বিষয় নির্বাচন করো</h1>
            <p className="text-slate-500 font-bengali text-lg">পরীক্ষা শুরু করতে যেকোনো একটি বিষয় বেছে নাও</p>
          </div>
          {isDeveloper && (
            <Button onClick={makeAdmin} variant="outline" className="gap-2 font-bengali border-amber-200 text-amber-700 bg-amber-50 shadow-sm">
              <Settings className="w-4 h-4" /> অ্যাডমিন হোন
            </Button>
          )}
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white border border-slate-200 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.length > 0 ? (
              subjects.map((subject, idx) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={`/subjects/${subject.id}`}>
                    <Card className="group hover:border-blue-400 transition-all cursor-pointer overflow-hidden border-slate-200 shadow-sm rounded-xl h-full bg-white flex flex-col">
                      <CardHeader className="pb-4 pt-8 px-8">
                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 border border-slate-100 group-hover:border-blue-500">
                          <BookMarked className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-3xl font-bengali font-bold text-slate-800">{subject.nameBn}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 flex-1 flex flex-col justify-end">
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <span className="text-xs font-sans text-slate-400 font-bold uppercase tracking-widest">{subject.name}</span>
                          <div className="flex items-center text-blue-600 font-bengali font-bold group-hover:translate-x-1 transition-transform">
                            পরীক্ষাসমূহ <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-bengali text-xl font-medium">কোনো বিষয় পাওয়া যায়নি। অনুগ্রহ করে অপেক্ষা করুন।</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
