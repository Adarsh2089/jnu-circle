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
  const [schoolAdmin, setSchoolAdmin] = useState(null);
  const [centreAdmin, setCentreAdmin] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Fetch school and centre admins
  useEffect(() => {
    if (!userProfile?.school) return;
    
    const fetchAdmins = async () => {
      try {
        // Fetch school admin
        const schoolAdminQuery = query(
          collection(db, 'users'),
          where('isSchoolAdmin', '==', true),
          where('school', '==', userProfile.school)
        );
        const schoolAdminSnapshot = await getDocs(schoolAdminQuery);
        if (!schoolAdminSnapshot.empty) {
          const adminData = schoolAdminSnapshot.docs[0].data();
          setSchoolAdmin({
            name: adminData.fullName || adminData.name,
            email: adminData.email,
            school: adminData.school,
            course: adminData.course
          });
        }

        // Fetch centre admin if user has a centre
        if (userProfile.centre) {
          const centreAdminQuery = query(
            collection(db, 'users'),
            where('isCentreAdmin', '==', true),
            where('school', '==', userProfile.school),
            where('centre', '==', userProfile.centre)
          );
          const centreAdminSnapshot = await getDocs(centreAdminQuery);
          if (!centreAdminSnapshot.empty) {
            const adminData = centreAdminSnapshot.docs[0].data();
            setCentreAdmin({
              name: adminData.fullName || adminData.name,
              email: adminData.email,
              centre: adminData.centre,
              course: adminData.course
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, [userProfile]);

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
                  <li>Subscribe to Premium for ₹1/year</li>
                </ul>
                <div className="mt-4 flex gap-4">
                  <Link to="/upload" className="btn-primary">
                    Upload Now
                  </Link>
                  <Link to="/payment" className="btn-secondary">
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
              {recentResources.slice(0, 6).map((resource) => (
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

        {/* Admin Contact Information - Only show to non-admin users */}
        {!loadingAdmins && !hasAdminAccess && (schoolAdmin || centreAdmin) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 md:h-40 md:w-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 md:h-48 md:w-48 rounded-full bg-white opacity-10"></div>
            
            <div className="relative">
              {/* Responsive Layout - Stack on mobile, side by side on desktop */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
                {/* Left side - Icon and Text */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="bg-white bg-opacity-20 p-4 md:p-5 rounded-xl backdrop-blur-sm">
                    <UserPlus className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">Need Help?</h3>
                    <p className="text-white text-opacity-90 text-base md:text-lg">Contact Your Admin</p>
                    <p className="text-blue-100 text-sm md:text-base mt-1">Get assistance from your school or centre representative</p>
                  </div>
                </div>

                {/* Right side - Admin Details Cards */}
                <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[450px]">
                  {schoolAdmin && (
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 rounded-lg">
                            <UserPlus className="h-6 w-6 md:h-7 md:w-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-bold rounded-full mb-2">
                            School Admin
                          </span>
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 truncate">{schoolAdmin.name}</h4>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{schoolAdmin.school}</p>
                          {schoolAdmin.course && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{schoolAdmin.course}</p>
                          )}
                          <a 
                            href={`mailto:${schoolAdmin.email}`} 
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline mt-1 inline-block break-all"
                          >
                            {schoolAdmin.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {centreAdmin && (
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 md:p-4 rounded-lg">
                            <UserPlus className="h-6 w-6 md:h-7 md:w-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs md:text-sm font-bold rounded-full mb-2">
                            Centre Admin
                          </span>
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 truncate">{centreAdmin.name}</h4>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{centreAdmin.centre}</p>
                          {centreAdmin.course && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{centreAdmin.course}</p>
                          )}
                          <a 
                            href={`mailto:${centreAdmin.email}`} 
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline mt-1 inline-block break-all"
                          >
                            {centreAdmin.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

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
