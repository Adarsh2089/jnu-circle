import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Shield, Star, Users, Award, ImageOff, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import NominationForm from '../components/NominationForm';
import { useState } from 'react';
import Lottie from 'lottie-react';
import studentAnimation from '../assets/animations/STUDENT.json';
import educationAnimation from '../assets/animations/Education.json';

const Home = () => {
  const { user } = useAuth();
  const { isAdmin, hasAdminAccess } = useAdmin();
  const navigate = useNavigate();
  const [showNominationForm, setShowNominationForm] = useState(false);

  const handleGetStarted = (e) => {
    if (user) {
      e.preventDefault();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#F7F7F7] py-16 md:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                Welcome to <span className="text-blue-600">JNU Study Circle</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-700 leading-relaxed">
                Your Central Hub for PYQs, Notes & Study Materials
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  to={user ? "/dashboard" : "/signup"} 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  Get Started Free
                </Link>
                <Link to="/resources" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform">
                  Browse Resources
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-md">
                <Lottie animationData={studentAnimation} loop={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">Why Choose JNU Study Circle?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Everything you need for academic excellence</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-2xl">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Extensive Library</h3>
              <p className="text-gray-600 leading-relaxed">
                Access thousands of PYQs, notes, and study materials from all JNU schools.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-2xl">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Verified Content</h3>
              <p className="text-gray-600 leading-relaxed">
                All materials are verified by JNU students to ensure quality and authenticity.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-2xl">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Community Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Built by students, for students. Contribute and help your peers succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Get started in three simple steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Register</h3>
              <p className="text-gray-600">
                Sign up with your JNU email to verify your student status.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute or Subscribe</h3>
              <p className="text-gray-600">
                Upload at least one resource or get premium access for ₹1/year.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Access Everything</h3>
              <p className="text-gray-600">
                View and study from our entire collection of resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nomination Banner - Only show for non-admin users */}
      {!hasAdminAccess && (
        <section className="py-12 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-8 md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-3">
                <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Become a Representative
                </h3>
              </div>
              <p className="text-gray-600 text-lg">
                Help manage resources for your school or centre. Nominate yourself as a School or Centre Admin!
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Review and approve course requests
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Manage resources for your school/centre
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Support your academic community
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowNominationForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <UserPlus className="h-5 w-5" />
              Nominate Now
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Education Section with Animation */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="w-full max-w-lg mx-auto">
                <Lottie animationData={educationAnimation} loop={true} />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Made with <span className="text-red-500">♥</span> for
                <span className="block text-blue-600 mt-2">JNU Students</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Night Owls, we've got your back! Access quality study materials anytime, anywhere. Join thousands of JNU students who trust our platform for their academic success.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3K+</div>
                  <div className="text-gray-600">Active Students</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2K+</div>
                  <div className="text-gray-600">Study Materials</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Schools/Centres Covered</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600">Access Anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Contribution Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card border-2 border-gray-200">
              <div className="text-center">
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Contributor</h3>
                <p className="text-4xl font-bold text-blue-600 mb-4">FREE</p>
                <p className="text-gray-600 mb-6">
                  Upload at least one PYQ or study material to unlock full access
                </p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    Full access to all resources
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    View-only mode (no downloads)
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    Contribute to community
                  </li>
                </ul>
                <Link to="/signup" className="btn-secondary w-full">
                  Start Contributing
                </Link>
              </div>
            </div>

            <div className="card border-2 border-blue-600 relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                Popular
              </div>
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Premium</h3>
                <p className="text-4xl font-bold text-blue-600 mb-4">
                  ₹1<span className="text-lg text-gray-600">/year</span>
                </p>
                <p className="text-gray-600 mb-6">
                  Get instant access without uploading anything
                </p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    Full access to all resources
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    View-only mode (no downloads)
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    No contribution required
                  </li>
                </ul>
                <Link 
                  to={user ? "/dashboard" : "/signup"} 
                  onClick={handleGetStarted}
                  className="btn-primary w-full"
                >
                  Contribute to Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel in Your Exams?</h2>
          <p className="text-xl mb-8">
            Join thousands of JNU students already using JNU Study Circle
          </p>
          <Link 
            to={user ? "/dashboard" : "/signup"} 
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all shadow-lg inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Nomination Form Modal */}
      {showNominationForm && (
        <NominationForm onClose={() => setShowNominationForm(false)} />
      )}
    </div>
  );
};

export default Home;
