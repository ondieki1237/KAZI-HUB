import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import Wallet from './pages/Wallet';
import CreateJob from './pages/CreateJob';
import SeeMyPostedJobs from './pages/SeeMyPostedJobs';
import CVMaker from './pages/CVMaker';
import JobDetail from './pages/JobDetail';
import MyProfile from './pages/MyProfile';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import ViewApplications from './pages/ViewApplications';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Payment from './pages/Payment';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PostMySkill from './pages/PostMySkill';
import FindSkill from './pages/FindSkill';
import SkillDetail from './pages/SkillDetail';
import SkillChat from './pages/SkillChat';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminSkills from './pages/admin/Skills';
import AppliedJobs from './pages/AppliedJobs';
import LandingPage from './pages/LandingPage';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { NotificationProvider } from './contexts/NotificationContext';
import VerificationPending from './pages/VerificationPending';

// Protected Admin Route
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user || user.email !== 'admin@gmail.com') {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Protected Route for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Protected Home Route to handle landing vs home page
const ProtectedHomeRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={
              <ProtectedHomeRoute>
                <Home />
              </ProtectedHomeRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/jobs/create" element={<CreateJob />} />
            <Route path="/jobs/my-posted" element={<SeeMyPostedJobs />} />
            <Route path="/cv-maker" element={<CVMaker />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/profile/my-profile" element={<MyProfile />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/chat/:jobId/:userId" element={<Chat />} />
            <Route path="/jobs/:jobId/applications" element={<ViewApplications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/payment/:jobId/:workerId" element={<Payment />} />
            <Route path="/post-skill" element={<PostMySkill />} />
            <Route path="/find-skill" element={<FindSkill />} />
            <Route path="/skill/:skillId" element={<SkillDetail />} />
            <Route path="/skill-chat/:skillId/:userId" element={<SkillChat />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedAdminRoute>
                <AdminJobs />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/skills" element={
              <ProtectedAdminRoute>
                <AdminSkills />
              </ProtectedAdminRoute>
            } />
            <Route path="/applied-jobs" element={
              <ProtectedRoute>
                <AppliedJobs />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;