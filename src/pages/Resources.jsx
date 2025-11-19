import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdSlot from '../components/AdSlot';
import SecureViewer from '../components/SecureViewer';
import DashboardFooter from '../components/DashboardFooter';
import { getCoursesForSchool } from '../data/schoolCourseMapping';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('user'); // 'user' means user's course, 'all' means all courses
  const [filterSemester, setFilterSemester] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const { userProfile } = useAuth();

  // Get available courses for user's school
  useEffect(() => {
    const fetchCourses = async () => {
      if (userProfile?.school) {
        const courses = await getCoursesForSchool(userProfile.school);
        setAvailableCourses(courses);
      }
    };
    fetchCourses();
  }, [userProfile?.school]);

  // Set default filter to user's course and semester
  useEffect(() => {
    if (userProfile?.course) {
      setFilterCourse('user'); // Default to user's course
    }
    if (userProfile?.semester) {
      setFilterSemester(userProfile.semester.toString());
    }
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile?.school) return;
    
    // Set up real-time listener for approved resources
    // Filter by school on client-side to avoid composite index requirement
    const q = query(
      collection(db, 'resources'),
      where('verificationStatus', '==', 'approved')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
        // Sort by uploadedAt on client side
        .sort((a, b) => {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          return dateB - dateA; // Most recent first
        })
        .slice(0, 50); // Limit to 50
      
      console.log('Resources from your school:', resourcesData.length);
      console.log('User school:', userProfile.school);
      console.log('All resources:', querySnapshot.docs.map(d => ({ id: d.id, school: d.data().school })));
      setResources(resourcesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching resources:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, filterType, filterCourse, filterSemester, resources]);

  const fetchResources = async () => {
    try {
      // Only fetch approved resources for regular users
      const q = query(
        collection(db, 'resources'),
        where('verificationStatus', '==', 'approved')
      );
      
      const querySnapshot = await getDocs(q);
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by uploadedAt on client side to avoid needing composite index
      .sort((a, b) => {
        const dateA = new Date(a.uploadedAt);
        const dateB = new Date(b.uploadedAt);
        return dateB - dateA; // Most recent first
      })
      .slice(0, 50); // Limit to 50
      
      console.log('Approved resources fetched:', resourcesData.length);
      setResources(resourcesData);
      setFilteredResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert('Error loading resources. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.type === filterType);
    }

    // School filter (automatic - user can only see their school)
    if (userProfile?.school) {
      filtered = filtered.filter(resource => 
        resource.school && resource.school.toLowerCase() === userProfile.school.toLowerCase()
      );
    }

    // Course filter (user can choose to see their course or all courses)
    if (filterCourse === 'user' && userProfile?.course) {
      filtered = filtered.filter(resource => 
        resource.course && resource.course.toLowerCase() === userProfile.course.toLowerCase()
      );
    } else if (filterCourse !== 'all' && filterCourse !== 'user') {
      // Specific course selected
      filtered = filtered.filter(resource => 
        resource.course && resource.course.toLowerCase() === filterCourse.toLowerCase()
      );
    }
    // If filterCourse is 'all', don't filter by course

    // Semester filter
    if (filterSemester !== 'all') {
      filtered = filtered.filter(resource => 
        resource.semester && resource.semester.toString() === filterSemester
      );
    }

    setFilteredResources(filtered);
  };

  const hasAccess = userProfile?.isPremium || userProfile?.hasContributed;

  const handleViewResource = (resource) => {
    if (!hasAccess) {
      alert('Please upload a resource or get premium access to view content');
      return;
    }
    
    // Open resource in secure viewer instead of new tab
    setSelectedResource(resource);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Resources</h1>
          <p className="text-gray-600 mt-2">
            Showing resources from: <span className="font-semibold text-primary-600">{userProfile?.school || 'Your School'}</span>
            {filterCourse === 'user' && userProfile?.course && (
              <> • Course: <span className="font-semibold text-primary-600">{userProfile.course}</span></>
            )}
            {filterCourse === 'all' && (
              <> • <span className="font-semibold text-primary-600">All Courses</span></>
            )}
            {filterCourse !== 'all' && filterCourse !== 'user' && (
              <> • Course: <span className="font-semibold text-primary-600">{filterCourse}</span></>
            )}
            {filterSemester !== 'all' && (
              <> • Semester: <span className="font-semibold text-primary-600">{filterSemester}</span></>
            )}
          </p>
        </div>

        {/* School & Course Filter Notice */}
        <div className="mb-6 card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start">
            <Filter className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                School-Based Access with Course Filtering
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You can view resources from all courses in your school/centre: <strong>{userProfile?.school}</strong>
                <br />
                Use the course filter below to view resources from specific courses or all courses.
              </p>
            </div>
          </div>
        </div>

        {/* Access Status Warning */}
        {!hasAccess && (
          <div className="card bg-yellow-50 border-2 border-yellow-200 mb-6">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  Limited Access
                </h3>
                <p className="mt-1 text-yellow-700">
                  You can browse resources, but need to upload content or get premium to view them.
                </p>
                <div className="mt-3 flex gap-4">
                  <Link to="/upload" className="btn-primary text-sm">
                    Upload Resource
                  </Link>
                  <Link to="/pricing" className="btn-secondary text-sm">
                    Get Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="input-field"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="pyq">PYQs</option>
                <option value="notes">Notes</option>
                <option value="assignment">Assignments</option>
                <option value="syllabus">Syllabus</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <select
                className="input-field"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="user">{userProfile?.course || 'My Course'}</option>
                <option value="all">All Courses</option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="input-field"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Info */}
          {(filterCourse !== 'user' || filterSemester !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-600">Active Filters:</span>
                {filterCourse !== 'user' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Course: {filterCourse === 'all' ? 'All Courses' : filterCourse}
                    <button
                      onClick={() => setFilterCourse('user')}
                      className="ml-1 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterSemester !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Semester: {filterSemester}
                    <button
                      onClick={() => setFilterSemester('all')}
                      className="ml-1 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilterCourse('user');
                    setFilterSemester('all');
                    setFilterType('all');
                    setSearchTerm('');
                  }}
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredResources.length}</span> {filteredResources.length === 1 ? 'resource' : 'resources'}
            {(filterCourse !== 'user' || filterSemester !== 'all' || filterType !== 'all' || searchTerm) && (
              <span> matching your filters</span>
            )}
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  resource.type === 'pyq' ? 'bg-blue-100 text-blue-800' :
                  resource.type === 'notes' ? 'bg-green-100 text-green-800' :
                  resource.type === 'assignment' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {resource.type.toUpperCase()}
                </span>
                {resource.verified && (
                  <span className="text-green-500 text-xs">✓ Verified</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Subject:</span> {resource.subject}</p>
                <p><span className="font-medium">Course:</span> {resource.course}</p>
                <p><span className="font-medium">Year:</span> {resource.year}</p>
                {resource.semester && (
                  <p><span className="font-medium">Semester:</span> {resource.semester}</p>
                )}
              </div>

              {resource.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="h-4 w-4 mr-1" />
                  {resource.views || 0} views
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

        {filteredResources.length === 0 && (
          <div className="text-center py-12 card">
            <div className="max-w-md mx-auto">
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 text-lg font-semibold mb-2">No resources found</p>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterCourse !== 'user' || filterSemester !== 'all' ? (
                  <>Try adjusting your filters or search term</>
                ) : (
                  <>No resources available from your school and course yet. Be the first to contribute!</>
                )}
              </p>
              {(searchTerm || filterType !== 'all' || filterCourse !== 'user' || filterSemester !== 'all') && (
                <button
                  onClick={() => {
                    setFilterCourse('user');
                    setFilterSemester('all');
                    setFilterType('all');
                    setSearchTerm('');
                  }}
                  className="btn-secondary"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
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
    </div>
  );
};

export default Resources;
