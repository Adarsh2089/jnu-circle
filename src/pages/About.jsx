import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Award, Shield, Zap, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About JNU Circle</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A student-driven platform dedicated to making quality educational resources accessible 
            to every JNU student, fostering collaboration and academic excellence.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-100 p-4 rounded-xl">
              <Target className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">
            JNU Study Circle was created to bridge the gap in accessing quality study materials across different
            schools and centres at Jawaharlal Nehru University. We believe that every student deserves equal 
            access to educational resources, regardless of their background or connections. By creating a 
            centralized platform, we're building a collaborative learning environment where students can share, 
            discover, and benefit from each other's knowledge.
          </p>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Previous Year Questions</h3>
              <p className="text-gray-600">
                Access comprehensive collections of PYQs from various courses to better prepare for exams 
                and understand exam patterns.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Study Notes</h3>
              <p className="text-gray-600">
                Share and access well-organized notes, summaries, and study materials created by fellow 
                students from your school or centre.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">School-Based Access</h3>
              <p className="text-gray-600">
                Resources are organized by schools and centres, ensuring you get relevant materials specific 
                to your academic program.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contributor Rewards</h3>
              <p className="text-gray-600">
                Earn contributor status and premium access by sharing quality resources. Give back to the 
                community and unlock full platform features.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Built by students, for students. Every resource is vetted and approved to ensure quality 
                and relevance to JNU curriculum.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security. JNU email verification ensures only 
                legitimate students have access.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
              <p className="text-white/90">
                Register with your JNU email and verify your account to get started.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute</h3>
              <p className="text-white/90">
                Upload quality study materials, notes, or PYQs to earn contributor access.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Access & Learn</h3>
              <p className="text-white/90">
                Browse, download, and benefit from thousands of resources shared by the community.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Platform Statistics</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">56+</div>
              <div className="text-gray-600 font-medium">Schools & Centres</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5000+</div>
              <div className="text-gray-600 font-medium">Resources Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Access</div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Core Values</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Accessibility</h3>
                <p className="text-gray-600">
                  Making quality educational resources available to all JNU students, regardless of their network or connections.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Collaboration</h3>
                <p className="text-gray-600">
                  Fostering a culture of sharing and mutual support among students to enhance learning outcomes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Quality</h3>
                <p className="text-gray-600">
                  Maintaining high standards through admin verification to ensure all resources are valuable and relevant.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Privacy & Security</h3>
                <p className="text-gray-600">
                  Protecting user data and ensuring a safe, secure platform for all community members.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join the JNU Study Circle Community</h2>
          <p className="text-xl mb-8 text-white/90">
            Be part of a growing community of students helping each other succeed academically.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/signup" 
              className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              Get Started
            </Link>
            <Link 
              to="/contact" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-600">
          <p>
            JNU Study Circle is an independent student initiative and is not officially affiliated with 
            Jawaharlal Nehru University.
          </p>
        </div>
      </div>
    </div>
  );
}
