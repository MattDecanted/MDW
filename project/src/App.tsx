import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Subscribe from './pages/Subscribe';
import Pricing from './pages/Pricing';
import MemberDashboard from './pages/MemberDashboard';
import Success from './pages/Success';
import LeadMagnet from './pages/LeadMagnet';
import Community from './pages/Community';
import CourseDetail from './pages/CourseDetail';
import ModuleDetail from './pages/ModuleDetail';
import ContentItems from './pages/ContentItems';
import ManualLogin from './components/ManualLogin'; // ✅ Test page route
import WineOptionsGame from './pages/WineOptionsGame';
import UserDashboard from './pages/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLeads from './pages/admin/AdminLeads';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminMedia from './pages/admin/AdminMedia';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminTranslations from './pages/admin/AdminTranslations';
import AdminContentItems from './pages/admin/AdminContentItems';
import AdminSwirdle from './pages/admin/AdminSwirdle';

// Blog Pages
import BlogIndex from './pages/blog/BlogIndex';
import WSETLevel2Questions from './pages/blog/WSETLevel2Questions';
import WineVocabularyQuiz from './pages/blog/WineVocabularyQuiz';
import HowToBecomeWinemaker from './pages/blog/HowToBecomeWinemaker';
import WineTastingGuide from './pages/blog/WineTastingGuide';
import Swirdle from './pages/Swirdle';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/lead-magnet" element={<LeadMagnet />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/success" element={<Success />} />
                <Route path="/community" element={<Community />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route path="/module/:moduleId" element={<ModuleDetail />} />
                <Route path="/content" element={<ContentItems />} />
                <Route path="/test-login" element={<ManualLogin />} />
                <Route path="/wine-game" element={<WineOptionsGame />} />

                {/* Swirdle Game */}
                <Route
                  path="/swirdle"
                  element={
                    <ProtectedRoute>
                      <Swirdle />
                    </ProtectedRoute>
                  }
                />

                {/* Blog Pages */}
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/wset-level-2-sample-questions" element={<WSETLevel2Questions />} />
                <Route path="/blog/wine-vocabulary-quiz" element={<WineVocabularyQuiz />} />
                <Route path="/blog/how-to-become-winemaker" element={<HowToBecomeWinemaker />} />
                <Route path="/blog/wine-tasting-guide" element={<WineTastingGuide />} />

                {/* Member Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/member"
                  element={
                    <ProtectedRoute>
                      <MemberDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/legacy"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Pages */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/leads"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLeads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/community"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCommunity />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/media"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminMedia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/translations"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminTranslations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/content-items"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminContentItems />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/swirdle"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminSwirdle />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
};

export default App;
