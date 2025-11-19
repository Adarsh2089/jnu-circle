import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import SchoolAdminPanel from './pages/SchoolAdminPanel';
import CentreAdminPanel from './pages/CentreAdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import About from './pages/About';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

// School Admin Route Component
const SchoolAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isSchoolAdmin } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (!isSchoolAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

// Centre Admin Route Component
const CentreAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isCentreAdmin } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (!isCentreAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

function AppContent() {
  const location = useLocation();
  
  // Routes that should NOT show the large footer (they have their own footer)
  const dashboardRoutes = ['/dashboard', '/admin', '/school-admin', '/centre-admin', '/resources', '/upload', '/profile'];
  const showLargeFooter = !dashboardRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/school-admin" element={
            <SchoolAdminRoute>
              <SchoolAdminPanel />
            </SchoolAdminRoute>
          } />
          <Route path="/centre-admin" element={
            <CentreAdminRoute>
              <CentreAdminPanel />
            </CentreAdminRoute>
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {showLargeFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
