import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Award, TrendingUp, UserPlus } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import SecureViewer from '../components/SecureViewer';
import DashboardFooter from '../components/DashboardFooter';
import NominationForm from '../components/NominationForm';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { isAdmin, hasAdminAccess } = useAdmin();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showNominationForm, setShowNominationForm] = useState(false);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Fetch recent approved resources from user's school
  useEffect(() => {
    if (!userProfile?.school) return;
    
    const fetchRecentResources = async () => {
      try {
        // Fetch all approved resources and filter by school on client-side
        const q = query(
          collection(db, 'resources'),
          where('verificationStatus', '==', 'approved')
        );
        
        const querySnapshot = await getDocs(q);
        const resourcesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Filter by user's school on client-side (case-insensitive and trimmed)
          .filter(resource => {
            const resourceSchool = (resource.school || '').trim().toLowerCase();
            const userSchool = (userProfile.school || '').trim().toLowerCase();
            return resourceSchool === userSchool;
          })
          .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          .slice(0, 6); // Limit to 6 recent resources
        
        console.log('Dashboard - User school:', userProfile.school);
        console.log('Dashboard - Resources found:', resourcesData.length);
        setRecentResources(resourcesData);
      } catch (error) {
        console.error('Error fetching recent resources:', error);
      } finally {
        setLoadingResources(false);
      }
    };

    fetchRecentResources();
  }, [userProfile]);

  const hasAccess = userProfile?.isPremium || userProfile?.hasContributed;

  const handleViewResource = (resource) => {
    if (!hasAccess) {
      alert('Please upload a resource or get premium access to view content');
      return;
    }
    
    // Open resource in secure viewer instead of new tab
    setSelectedResource(resource);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.fullName || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            {userProfile?.school}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Account Status</p>
                <p className="text-2xl font-bold mt-1">
                  {userProfile?.isPremium ? 'Premium' : userProfile?.hasContributed ? 'Active' : 'Limited'}
                </p>
              </div>
              <Award className="h-12 w-12 text-primary-200" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Contributions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {userProfile?.contributionCount || 0}
                </p>
              </div>
              <Upload className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resources Viewed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {userProfile?.viewCount || 0}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Access Status */}
        {!userProfile?.isPremium && !userProfile?.hasContributed && (
          <div className="card bg-yellow-50 border-2 border-yellow-200 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  Unlock Full Access
                </h3>
                <p className="mt-2 text-yellow-700">
                  To access all resources, you need to either:
                </p>
                <ul className="mt-2 text-yellow-700 list-disc list-inside">
                  <li>Upload at least one PYQ or study material</li>
                  <li>Subscribe to Premium for ₹99/year</li>
                </ul>
                <div className="mt-4 flex gap-4">
                  <Link to="/upload" className="btn-primary">
                    Upload Now
                  </Link>
                  <Link to="/pricing" className="btn-secondary">
                    Get Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/resources" className="card hover:border-primary-300 border-2 border-transparent">
            <div className="flex items-center">
              <BookOpen className="h-12 w-12 text-primary-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Browse Resources</h3>
                <p className="text-gray-600 mt-1">
                  Access PYQs, notes, and study materials
                </p>
              </div>
            </div>
          </Link>

          <Link to="/upload" className="card hover:border-primary-300 border-2 border-transparent">
            <div className="flex items-center">
              <Upload className="h-12 w-12 text-primary-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Upload Resource</h3>
                <p className="text-gray-600 mt-1">
                  Contribute to help fellow students
                </p>
              </div>
            </div>
          </Link>

          {/* Only show nomination card if user doesn't have admin access */}
          {!hasAdminAccess && (
            <button 
              onClick={() => setShowNominationForm(true)}
              className="card hover:border-blue-300 border-2 border-transparent text-left w-full"
            >
              <div className="flex items-center">
                <UserPlus className="h-12 w-12 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Become a Representative</h3>
                  <p className="text-gray-600 mt-1">
                    Nominate yourself as School/Centre Admin
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Recent Resources Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Resources</h2>
            <Link to="/resources" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loadingResources ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading resources...</p>
            </div>
          ) : recentResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentResources.map((resource) => (
                <div key={resource.id} className="card hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      resource.type === 'pyq' ? 'bg-blue-100 text-blue-800' :
                      resource.type === 'notes' ? 'bg-green-100 text-green-800' :
                      resource.type === 'assignment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {resource.type?.toUpperCase()}
                    </span>
                    <span className="text-green-500 text-xs">✓ Verified</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Subject:</span> {resource.subject}</p>
                    <p><span className="font-medium">Course:</span> {resource.course}</p>
                    <p><span className="font-medium">Year:</span> {resource.year}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      By {resource.uploaderName}
                    </div>
                    <button
                      onClick={() => handleViewResource(resource)}
                      className={`btn-primary text-sm ${!hasAccess && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!hasAccess}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <p className="text-gray-600 text-lg">No resources available yet</p>
              <p className="text-gray-500 mt-2">Be the first to contribute!</p>
              <Link to="/upload" className="btn-primary mt-4 inline-block">
                Upload Resource
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <DashboardFooter />

      {/* Secure Viewer Modal */}
      {selectedResource && (
        <SecureViewer
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}

      {/* Nomination Form Modal */}
      {showNominationForm && (
        <NominationForm onClose={() => setShowNominationForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;
