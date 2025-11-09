import { Link } from 'react-router-dom';
import { BookOpen, Upload, Shield, Star, Users, Award } from 'lucide-react';
import AdSlot from '../components/AdSlot';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to JNU Circle
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your Central Hub for PYQs, Notes & Study Materials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all shadow-lg">
                Get Started Free
              </Link>
              <Link to="/resources" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all">
                Browse Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <AdSlot slot="horizontal" />
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose JNU Circle?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center animate-slide-up">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Extensive Library</h3>
              <p className="text-gray-600">
                Access thousands of PYQs, notes, and study materials from all JNU schools.
              </p>
            </div>

            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Content</h3>
              <p className="text-gray-600">
                All materials are verified by JNU students to ensure quality and authenticity.
              </p>
            </div>

            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Built by students, for students. Contribute and help your peers succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <AdSlot slot="horizontal" />
      </div>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Register</h3>
              <p className="text-gray-600">
                Sign up with your JNU email to verify your student status.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute or Subscribe</h3>
              <p className="text-gray-600">
                Upload at least one resource or get premium access for ₹99/year.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Access Everything</h3>
              <p className="text-gray-600">
                View and study from our entire collection of resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card border-2 border-gray-200">
              <div className="text-center">
                <Upload className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Contributor</h3>
                <p className="text-4xl font-bold text-primary-600 mb-4">FREE</p>
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

            <div className="card border-2 border-primary-600 relative">
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                Popular
              </div>
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Premium</h3>
                <p className="text-4xl font-bold text-primary-600 mb-4">
                  ₹99<span className="text-lg text-gray-600">/year</span>
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
                <Link to="/signup" className="btn-primary w-full">
                  Get Premium
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <AdSlot slot="horizontal" />
      </div>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel in Your Exams?</h2>
          <p className="text-xl mb-8">
            Join thousands of JNU students already using JNU Circle
          </p>
          <Link to="/signup" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all shadow-lg inline-block">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
