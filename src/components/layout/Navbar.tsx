import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { CurriculumVersion, AcademicLevel } from '@/src/types';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';

const Navbar = ({ role: propsRole }: { role?: 'student' | 'admin' }) => {
  const navigate = useNavigate();
  const { user, logout, setCurriculumVersion, setAcademicLevel } = useAuthStore();
  const role = user?.role || propsRole || 'student';

  const curriculumVersion: CurriculumVersion = user?.curriculumVersion || 'bangla';
  const isEnglishUi = curriculumVersion !== 'bangla';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchLevel = async (newLevel: AcademicLevel) => {
    if (!user || user.academicLevel === newLevel) return;
    try {
      await apiJson('/api/user/curriculum-version', {
        method: 'PUT',
        body: JSON.stringify({ academicLevel: newLevel }),
      });
      setAcademicLevel(newLevel);
    } catch (err) {
      console.error('Failed to switch academic level:', err);
    }
  };

  const handleSwitchCurriculum = async (newVersion: CurriculumVersion) => {
    if (!user || user.curriculumVersion === newVersion) return;
    try {
      let defaultLevel: AcademicLevel = 'hsc';
      if (newVersion === 'british') defaultLevel = 'alevel';
      else if (newVersion === 'ib') defaultLevel = 'dp';

      await apiJson('/api/user/curriculum-version', {
        method: 'PUT',
        body: JSON.stringify({ curriculumVersion: newVersion, academicLevel: defaultLevel }),
      });
      setCurriculumVersion(newVersion);
      setAcademicLevel(defaultLevel);
    } catch (err) {
      console.error('Failed to switch curriculum:', err);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <nav className="sticky top-0 z-50 w-full h-16 sm:h-20 bg-white border-b border-slate-200 px-3 sm:px-8 shadow-xs flex items-center shrink-0">
      <div className="w-full flex items-center justify-between gap-2">
        <Link to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center py-1 shrink-0">
          <img
            src="/images/logo.png"
            alt="MCQ Onushilon"
            className="h-8 sm:h-12 w-auto object-contain max-w-[120px] xs:max-w-[150px] sm:max-w-[240px]"
          />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {role !== 'admin' && user && (
            <>
              {/* Dynamic Level Switcher based on active curriculum */}
              <div className="flex items-center p-0.5 bg-blue-50/80 rounded-lg border border-blue-200 text-[11px] sm:text-xs font-bold font-sans shrink-0">
                {/* NCTB (Bangla & English Version): HSC vs SSC */}
                {(curriculumVersion === 'bangla' || curriculumVersion === 'english') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('hsc')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        (user.academicLevel || 'hsc') === 'hsc'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-blue-700 hover:text-blue-900'
                      }`}
                      title="Higher Secondary Certificate"
                    >
                      HSC
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('ssc')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        user.academicLevel === 'ssc'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-blue-700 hover:text-blue-900'
                      }`}
                      title="Secondary School Certificate"
                    >
                      SSC
                    </button>
                  </>
                )}

                {/* British Curriculum: A Level vs O Level */}
                {curriculumVersion === 'british' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('alevel')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        (user.academicLevel || 'alevel') === 'alevel'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-700 hover:text-purple-900'
                      }`}
                      title="Advanced Level (Year 12-13)"
                    >
                      A Level
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('olevel')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        user.academicLevel === 'olevel'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-700 hover:text-purple-900'
                      }`}
                      title="Ordinary Level / IGCSE (Year 10-11)"
                    >
                      O Level
                    </button>
                  </>
                )}

                {/* IB Curriculum: IB DP vs IB MYP */}
                {curriculumVersion === 'ib' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('dp')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        (user.academicLevel || 'dp') === 'dp'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                      title="IB Diploma Programme (Grade 11-12)"
                    >
                      IB DP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLevel('myp')}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all cursor-pointer ${
                        user.academicLevel === 'myp'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                      title="IB Middle Years Programme (Grade 9-10)"
                    >
                      IB MYP
                    </button>
                  </>
                )}
              </div>

              {/* Curriculum Selector Dropdown */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">{getCurriculumLabel(curriculumVersion)}</span>
                  <span className="sm:hidden">{getCurriculumShortLabel(curriculumVersion)}</span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                </button>

                <div
                  className={`absolute right-0 top-full mt-1.5 w-48 sm:w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs transition-all ${
                    isDropdownOpen ? 'block' : 'hidden'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isEnglishUi ? 'Switch Curriculum' : 'কারিকুলাম পরিবর্তন'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchCurriculum('bangla');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      curriculumVersion === 'bangla' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>বাংলা মাধ্যম (NCTB)</span>
                    {curriculumVersion === 'bangla' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchCurriculum('english');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      curriculumVersion === 'english' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>English Version (NCTB)</span>
                    {curriculumVersion === 'english' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchCurriculum('british');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      curriculumVersion === 'british' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>British (O / A Level)</span>
                    {curriculumVersion === 'british' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchCurriculum('ib');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      curriculumVersion === 'ib' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>IB Curriculum (MYP/DP)</span>
                    {curriculumVersion === 'ib' && <span className="text-[10px]">✓</span>}
                  </button>
                </div>
              </div>
            </>
          )}

          {role === 'admin' && (
            <Link to="/admin/dashboard" className="shrink-0">
              <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 px-2 sm:px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold shadow-none h-8 sm:h-9">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline font-bengali">
                  {isEnglishUi ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}
                </span>
              </Button>
            </Link>
          )}

          <Link to="/dashboard" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 px-2 sm:px-3 text-slate-600 hover:text-slate-900 font-semibold shadow-none h-8 sm:h-9">
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline font-bengali">
                {isEnglishUi ? 'Dashboard' : 'ড্যাশবোর্ড'}
              </span>
            </Button>
          </Link>

          <div className="h-4 sm:h-6 w-px bg-slate-200 shrink-0"></div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 sm:gap-2 px-2 sm:px-3 text-red-500 hover:text-red-600 font-semibold shadow-none cursor-pointer h-8 sm:h-9 shrink-0"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline font-bengali">
              {isEnglishUi ? 'Log Out' : 'লগআউট'}
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
