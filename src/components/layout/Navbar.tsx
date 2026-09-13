import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

const Navbar = ({ role: initialRole = 'student' }: { role?: 'student' | 'admin' }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'admin'>(initialRole);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid));
        if (docSnap.exists()) {
          setRole(docSnap.data().role || 'student');
        }
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-white border-b border-slate-200 px-8 shadow-sm flex items-center shrink-0">
      <div className="w-full flex items-center justify-between">
        <Link to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-orange-500">MCQ<span className="text-[#3B63EA]">Onushilon</span></h1>
            <p className="text-xs text-slate-500 font-sans">{role === 'admin' ? 'Admin Controller' : 'Student Dashboard'}</p>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          {role === 'admin' && (
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold shadow-none">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline font-bengali">অ্যাডমিন প্যানেল</span>
              </Button>
            </Link>
          )}
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 font-semibold shadow-none">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline font-bengali">ড্যাশবোর্ড</span>
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-200"></div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-red-500 hover:text-red-600 font-semibold shadow-none">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-bengali">লগআউট</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
