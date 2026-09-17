import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/src/lib/authStore';
import { CurriculumVersion } from '@/src/types';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  CreditCard,
  Users,
  FileCheck2,
} from 'lucide-react';

const Navbar = ({ role: propsRole }: { role?: 'student' | 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user?.role || propsRole || 'student';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const curriculumVersion: CurriculumVersion = user?.curriculumVersion || 'bangla';
  const isEnglishUi = curriculumVersion !== 'bangla';

  // Automatically close mobile menu when changing route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const getCurriculumShortLabel = (cv: CurriculumVersion) => {
    switch (cv) {
      case 'bangla':
        return 'বাংলা';
      case 'english':
        return 'English';
      case 'british':
        return 'O/A Level';
      case 'ib':
        return 'IB';
      default:
        return 'Board';
    }
  };

  const getCurriculumLabel = (cv: CurriculumVersion) => {
    switch (cv) {
      case 'bangla':
        return 'বাংলা মাধ্যম';
      case 'english':
        return 'English Version';
      case 'british':
        return 'British O/A Level';
      case 'ib':
        return 'IB MYP/DP';
      default:
        return 'Curriculum';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-8 shadow-xs flex items-center shrink-0">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center py-1 shrink-0"
          >
            <img
              src="/images/logo.png"
              alt="MCQ Onushilon"
              className="h-8 sm:h-11 w-auto object-contain max-w-[135px] sm:max-w-[220px]"
            />
          </Link>

          {/* DESKTOP NAVIGATION (md and above) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Links */}
            {role === 'admin' && (
              <div className="flex items-center gap-1 text-xs font-bengali font-bold mr-1">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ড্যাশবোর্ড
                </Link>
                <Link
                  to="/admin/students"
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    isActive('/admin/students')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  শিক্ষার্থী
                </Link>
                <Link
                  to="/admin/subjects"
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    isActive('/admin/subjects')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  বিষয়সমূহ
                </Link>
                <Link
                  to="/admin/exams"
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    isActive('/admin/exams')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  মডেল টেস্ট
                </Link>
                <Link
                  to="/admin/payments"
                  className={`px-3 py-1.5 rounded-xl transition-colors ${
                    isActive('/admin/payments')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  পেমেন্ট
                </Link>
              </div>
            )}

            {/* Student Curriculum & Academic Level Badge */}
            {role !== 'admin' && user && (
              <Link
                to="/profile"
                title={isEnglishUi ? 'View Profile & Exam Settings' : 'প্রোফাইল ও পরীক্ষার তথ্য দেখুন'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-xs font-sans text-slate-700 hover:text-blue-900 transition-all select-none group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900 group-hover:text-blue-900">
                  {getCurriculumShortLabel(curriculumVersion)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-blue-700 uppercase">
                  {user.academicLevel || 'HSC'}
                </span>
                {user.stream && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium capitalize">
                      {user.stream}
                    </span>
                  </>
                )}
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </Link>
            )}

            {/* Student Subscription Pill */}
            {role !== 'admin' && user && (
              <Link
                to="/subscription"
                title={isEnglishUi ? 'Subscription & Pricing' : 'সাবস্ক্রিপশন ও প্যাকেজ'}
                className="shrink-0"
              >
                {user.isSubscribed ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PRO</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEnglishUi ? 'Get Pro' : 'সাবস্ক্রাইব'}</span>
                  </span>
                )}
              </Link>
            )}

            {role === 'admin' && (
              <Link to="/admin/dashboard" className="shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 px-3 font-bold shadow-none h-9 ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bengali">
                    {isEnglishUi ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}
                  </span>
                </Button>
              </Link>
            )}

            <Link to="/dashboard" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 px-3 font-semibold shadow-none h-9 ${
                  isActive('/dashboard') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="font-bengali">
                  {isEnglishUi ? 'Dashboard' : 'ড্যাশবোর্ড'}
                </span>
              </Button>
            </Link>

            <Link to="/board-questions" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 px-3 font-semibold shadow-none h-9 ${
                  isActive('/board-questions') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="font-bengali">
                  {isEnglishUi ? 'Past Papers' : 'বোর্ড প্রশ্নাবলি'}
                </span>
              </Button>
            </Link>

            <Link to="/profile" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 px-3 font-semibold shadow-none h-9 ${
                  isActive('/profile') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-bengali">
                  {isEnglishUi ? 'Profile' : 'প্রোফাইল'}
                </span>
              </Button>
            </Link>

            <div className="h-6 w-px bg-slate-200 shrink-0"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold shadow-none cursor-pointer h-9 shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bengali">
                {isEnglishUi ? 'Log Out' : 'লগআউট'}
              </span>
            </Button>
          </div>

          {/* MOBILE NAVIGATION BAR ACTIONS (< md) */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Subscription Pill on Mobile */}
            {role !== 'admin' && user && (
              <Link to="/subscription" className="shrink-0">
                {user.isSubscribed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shadow-xs">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>PRO</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>{isEnglishUi ? 'Upgrade' : 'আপগ্রেড'}</span>
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Curriculum Pill (only on screens > 400px to avoid crowding) */}
            {role !== 'admin' && user && (
              <Link
                to="/profile"
                className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700 truncate max-w-[130px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{user.academicLevel || 'HSC'}</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER / OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isEnglishUi ? 'Navigation Menu' : 'নেভিগেশন মেনু'}
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Profile Card in Drawer */}
            {user && (
              <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-b border-blue-100/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.name || user.email}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-blue-700">
                        {getCurriculumShortLabel(curriculumVersion)}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-bold text-slate-700">
                        {user.academicLevel || 'HSC'}
                      </span>
                      {user.stream && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{user.stream}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription Status Card inside Drawer */}
                {role !== 'admin' && (
                  <div className="mt-3 pt-3 border-t border-blue-100/80 flex items-center justify-between">
                    <div className="text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {isEnglishUi ? 'Status:' : 'প্যাকেজ:'}{' '}
                      </span>
                      {user.isSubscribed ? (
                        <span className="font-bold text-emerald-700">PRO সক্রিয়</span>
                      ) : (
                        <span className="font-bold text-amber-700">ফ্রি ট্রায়াল</span>
                      )}
                    </div>
                    <Link
                      to="/subscription"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>{user.isSubscribed ? 'বিস্তারিত' : 'আপগ্রেড করুন'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Links in Drawer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-sans">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-5 h-5 ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bengali">
                    {isEnglishUi ? 'Practice Dashboard' : 'অনুশীলন ড্যাশবোর্ড'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>

              <Link
                to="/board-questions"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isActive('/board-questions')
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`w-5 h-5 ${isActive('/board-questions') ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bengali">
                    {isEnglishUi ? 'Past Examination Papers' : 'বোর্ড প্রশ্নাবলি ও সমাধান'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isActive('/profile')
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${isActive('/profile') ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bengali">
                    {isEnglishUi ? 'My Profile & Syllabus' : 'আমার প্রোফাইল ও সিলেবাস'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>

              {role !== 'admin' && (
                <Link
                  to="/subscription"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActive('/subscription')
                      ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/70'
                      : 'text-slate-700 hover:bg-amber-50/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-5 h-5 ${isActive('/subscription') ? 'text-amber-600' : 'text-amber-500'}`} />
                    <span className="text-sm font-bengali">
                      {isEnglishUi ? 'Subscription & Plans' : 'সাবস্ক্রিপশন ও প্যাকেজ'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    PRO
                  </span>
                </Link>
              )}

              {/* Admin Specific Section in Drawer */}
              {role === 'admin' && (
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-bengali">
                    অ্যাডমিন কন্ট্রোল
                  </div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-slate-700 hover:bg-slate-50 text-sm font-bengali"
                  >
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>অ্যাডমিন ড্যাশবোর্ড</span>
                  </Link>
                  <Link
                    to="/admin/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-slate-700 hover:bg-slate-50 text-sm font-bengali"
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>শিক্ষার্থী তালিকা</span>
                  </Link>
                  <Link
                    to="/admin/subjects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-slate-700 hover:bg-slate-50 text-sm font-bengali"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>বিষয় ও অধ্যায়</span>
                  </Link>
                  <Link
                    to="/admin/exams"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-slate-700 hover:bg-slate-50 text-sm font-bengali"
                  >
                    <FileCheck2 className="w-5 h-5 text-blue-600" />
                    <span>মডেল টেস্ট</span>
                  </Link>
                  <Link
                    to="/admin/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-slate-700 hover:bg-slate-50 text-sm font-bengali"
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>পেমেন্ট রিকোয়েস্ট</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors cursor-pointer border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bengali">
                  {isEnglishUi ? 'Log Out' : 'লগআউট করুন'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
