import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, X } from 'lucide-react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/animations/loading.json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    // Clear all form states
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    // Navigate to home
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // Check if admin login
      if (email === 'admin@jnu.ac.in') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address.');
      return;
    }
    
    try {
      setResetError('');
      setResetMessage('');
      setResetLoading(true);
      
      console.log('Sending password reset email to:', resetEmail);
      await resetPassword(resetEmail);
      
      console.log('Password reset email sent successfully');
      setResetMessage('Password reset link has been sent to your email. Please check your inbox and spam folder.');
      setResetEmail('');
      
      // Auto close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 5000);
    } catch (error) {
      console.error('Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send reset email. ';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage += 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage += 'Too many requests. Please try again later.';
      } else {
        errorMessage += 'Please check your email address and try again.';
      }
      
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Animation */}
          <div className="hidden md:flex items-center justify-center bg-white p-12">
            <div className="w-full max-w-md">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Sign In
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <Link
                  to="/signup"
                  className="text-gray-700 hover:text-blue-600 font-medium underline transition-colors"
                >
                  Create an account
                </Link>
              </div>

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleBackToHome}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetMessage('');
                setResetError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h3>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                {resetMessage}
              </div>
            )}

            {resetError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {resetError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
