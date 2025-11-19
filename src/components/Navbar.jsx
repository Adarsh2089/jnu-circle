import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { BookOpen, LogOut, User, Menu, X, Shield, Home } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const { isAdmin, isSchoolAdmin, isCentreAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">JNU Circle</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Show Home button if not on home page */}
                {!isHomePage && (
                  <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                )}
                {/* Show Dashboard only if not on home page */}
                {!isHomePage && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                )}
                {/* Admin Panel Links */}
                {!isHomePage && isAdmin && (
                  <Link to="/admin" className="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {!isHomePage && isSchoolAdmin && (
                  <Link to="/school-admin" className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>School Admin</span>
                  </Link>
                )}
                {!isHomePage && isCentreAdmin && (
                  <Link to="/centre-admin" className="text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Centre Admin</span>
                  </Link>
                )}
                {/* Show Resources only if not on home page and not any admin */}
                {!isHomePage && !isAdmin && !isSchoolAdmin && !isCentreAdmin && (
                  <Link to="/resources" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Resources
                  </Link>
                )}
                {/* Show Upload only if not on home page */}
                {!isHomePage && (
                  <Link to="/upload" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Upload
                  </Link>
                )}
                {/* Show Profile only if not on home page and not any admin */}
                {!isHomePage && !isAdmin && !isSchoolAdmin && !isCentreAdmin && (
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Profile
                  </Link>
                )}
                {/* Show Get Started button on home page */}
                {isHomePage && (
                  <Link to="/dashboard" className="btn-primary">
                    Go to Dashboard
                  </Link>
                )}
                {userProfile?.isPremium && !isHomePage && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                    Premium
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 btn-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                {isHomePage ? (
                  <Link 
                    to="/dashboard" 
                    className="block text-white bg-primary-600 hover:bg-primary-700 px-3 py-2 rounded-md text-center font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/" 
                      className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md flex items-center space-x-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {isSchoolAdmin && (
                      <Link 
                        to="/school-admin" 
                        className="block text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md flex items-center space-x-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>School Admin</span>
                      </Link>
                    )}
                    {isCentreAdmin && (
                      <Link 
                        to="/centre-admin" 
                        className="block text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md flex items-center space-x-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Centre Admin</span>
                      </Link>
                    )}
                    {!isAdmin && !isSchoolAdmin && !isCentreAdmin && (
                      <Link 
                        to="/resources" 
                        className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Resources
                      </Link>
                    )}
                    <Link 
                      to="/upload" 
                      className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Upload
                    </Link>
                    {!isAdmin && !isSchoolAdmin && !isCentreAdmin && (
                      <Link 
                        to="/profile" 
                        className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link to="/signup" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
