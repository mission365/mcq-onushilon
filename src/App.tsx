import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Toaster } from '../components/ui/sonner';

// Pages
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/LoginPage';
import ForgotPasswordPage from '@/src/pages/ForgotPasswordPage';
import RegisterPage from '@/src/pages/RegisterPage';
import Dashboard from '@/src/pages/Dashboard';
import SubjectExams from '@/src/pages/SubjectExams';
import LiveExam from '@/src/pages/LiveExam';
import ResultPage from '@/src/pages/ResultPage';
import BkashPaymentCallback from '@/src/pages/BkashPaymentCallback';

// Admin Pages
import AdminDashboard from '@/src/pages/admin/AdminDashboard';
import AdminSubjects from '@/src/pages/admin/AdminSubjects';
import AdminExams from '@/src/pages/admin/AdminExams';
import AdminQuestions from '@/src/pages/admin/AdminQuestions';
import AdminManualPayments from '@/src/pages/admin/AdminManualPayments';

const ProtectedRoute = ({ role }: { role?: 'student' | 'admin' }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const docRef = doc(db, 'profiles', authUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && userRole !== role) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payments/bkash/callback" element={<BkashPaymentCallback />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects/:subjectId" element={<SubjectExams />} />
          <Route path="/exam/:examId/start" element={<LiveExam />} />
          <Route path="/exam/:attemptId/result" element={<ResultPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/exams/:examId/questions" element={<AdminQuestions />} />
          <Route path="/admin/payments" element={<AdminManualPayments />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
