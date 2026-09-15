import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './lib/authStore';
import { Toaster } from '../components/ui/sonner';

// Pages
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/LoginPage';
import ForgotPasswordPage from '@/src/pages/ForgotPasswordPage';
import RegisterPage from '@/src/pages/RegisterPage';
import VerifyEmailPage from '@/src/pages/VerifyEmailPage';
import { SelectVersionPage } from '@/src/pages/SelectVersionPage';
import FeaturesPage from '@/src/pages/FeaturesPage';
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
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Restrict admin routes to admin role only
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/payments/bkash/callback" element={<BkashPaymentCallback />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/select-version" element={<SelectVersionPage />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
