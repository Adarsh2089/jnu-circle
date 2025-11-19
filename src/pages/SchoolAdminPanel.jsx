import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Trash2, Filter, Search, FileText, BookOpen, Users } from 'lucide-react';
import DashboardFooter from '../components/DashboardFooter';
import SecureViewer from '../components/SecureViewer';
import { getCentresForSchool, getCoursesForSchool } from '../data/schoolCourseMapping';

const SchoolAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [courseRequests, setCourseRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterCentre, setFilterCentre] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [centres, setCentres] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const { isSchoolAdmin, adminSchool } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSchoolAdmin || !adminSchool) {
      console.log('⚠️ [SchoolAdmin] Access denied - isSchoolAdmin:', isSchoolAdmin, 'adminSchool:', adminSchool);
      navigate('/dashboard');
      return;
    }
    
    console.log('✅ [SchoolAdmin] Initializing panel for school:', adminSchool);
    
    const loadCentres = async () => {
      const centresList = await getCentresForSchool(adminSchool);
      console.log('🏢 [SchoolAdmin] Centres loaded:', centresList);
      setCentres(centresList);
    };
    
    const loadCourses = async () => {
      const coursesList = await getCoursesForSchool(adminSchool);
      console.log('🎓 [SchoolAdmin] Courses loaded from school_courses:', coursesList);
      setAvailableCourses(coursesList);
    };
    
    loadCentres();
    loadCourses();
    fetchResources();
    fetchCourseRequests();
    fetchUsers();
  }, [isSchoolAdmin, adminSchool, navigate]);

  useEffect(() => {
    filterResults();
  }, [resources, searchTerm, filterStatus, activeTab, courseRequests, users, filterCentre, filterCourse]);

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      console.log('📚 [SchoolAdmin] Fetching resources for school:', adminSchool);
      const q = query(
        collection(db, 'resources'),
        where('uploaderSchool', '==', adminSchool)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📚 [SchoolAdmin] Resources found:', querySnapshot.size);
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0);
        const dateB = new Date(b.uploadedAt || 0);
        return dateB - dateA;
      });
      
      console.log('📚 [SchoolAdmin] Resources data:', resourcesData);
      setResources(resourcesData);
    } catch (error) {
      console.error('❌ [SchoolAdmin] Error fetching resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  };

  const fetchCourseRequests = async () => {
    try {
      setRequestsLoading(true);
      console.log('📖 [SchoolAdmin] Fetching course requests for school:', adminSchool);
      const q = query(
        collection(db, 'course_add_request'),
        where('school', '==', adminSchool)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📖 [SchoolAdmin] Course requests found:', querySnapshot.size);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('📖 [SchoolAdmin] Course requests data:', requestsData);
      setCourseRequests(requestsData);
    } catch (error) {
      console.error('❌ [SchoolAdmin] Error fetching course requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('👥 [SchoolAdmin] Fetching users for school:', adminSchool);
      const q = query(
        collection(db, 'users'),
        where('school', '==', adminSchool)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('👥 [SchoolAdmin] Users found:', querySnapshot.size);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('👥 [SchoolAdmin] Users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const filterResults = () => {
    if (activeTab === 'resources') {
      let filtered = resources;
      if (filterStatus !== 'all') {
        filtered = filtered.filter(r => 
          filterStatus === 'pending' 
            ? r.verificationStatus === 'pending' || !r.verificationStatus
            : r.verificationStatus === filterStatus
        );
      }
      if (searchTerm) {
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredResources(filtered);
    } else if (activeTab === 'requests') {
      let filtered = courseRequests;
      if (filterStatus !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus);
      }
      if (searchTerm) {
        filtered = filtered.filter(r =>
          r.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredRequests(filtered);
    } else if (activeTab === 'users') {
      let filtered = users;
      
      // Filter by centre
      if (filterCentre !== 'all') {
        filtered = filtered.filter(u => u.centre === filterCentre);
      }
      
      // Filter by course
      if (filterCourse !== 'all') {
        filtered = filtered.filter(u => u.course === filterCourse);
      }
      
      // Search by name or email
      if (searchTerm) {
        filtered = filtered.filter(u =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredUsers(filtered);
    }
  };

  const handleApproveResource = async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        verificationStatus: 'approved',
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: `schoolAdmin_${adminSchool}`,
        rejectionReason: '' // Clear any previous rejection reason
      });
      alert('✅ Resource approved successfully!');
      fetchResources();
    } catch (error) {
      console.error('Error approving resource:', error);
      alert('Failed to approve resource');
    }
  };

  const handleRejectResource = async (resourceId, reason = '') => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        verificationStatus: 'rejected',
        verified: false,
        rejectedAt: new Date().toISOString(),
        rejectedBy: `schoolAdmin_${adminSchool}`,
        rejectionReason: reason || 'No reason provided'
      });
      alert('Resource rejected');
      fetchResources();
    } catch (error) {
      console.error('Error rejecting resource:', error);
      alert('Failed to reject resource');
    }
  };

  const handleApproveRequest = async (requestId) => {
    const request = courseRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const { courseName, school, centre } = request;
      const collectionName = centre ? 'centre_courses' : 'school_courses';
      const entityName = centre || school;

      const entityRef = doc(db, collectionName, entityName);
      await updateDoc(entityRef, {
        courses: arrayUnion(courseName),
        updatedAt: new Date().toISOString()
      });

      const requestRef = doc(db, 'course_add_request', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: `schoolAdmin_${adminSchool}`
      });

      alert(`✅ Course "${courseName}" approved and added!`);
      fetchCourseRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'course_add_request', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: `schoolAdmin_${adminSchool}`
      });
      alert('Course request rejected');
      fetchCourseRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (resourcesLoading && requestsLoading && usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading School Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">School Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Managing: <span className="font-semibold">{adminSchool}</span>
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('resources')}
                className={`${
                  activeTab === 'resources'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <FileText className="h-5 w-5" />
                <span>Resources ({resources.filter(r => r.verificationStatus === 'pending' || !r.verificationStatus).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`${
                  activeTab === 'requests'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <BookOpen className="h-5 w-5" />
                <span>Course Requests ({courseRequests.filter(r => r.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'users' ? 'Search by name, email, or course...' : 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Status filter for Resources and Requests tabs */}
              {activeTab !== 'users' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
              
              {/* Centre and Course filters for Users tab */}
              {activeTab === 'users' && (
                <>
                  {centres.length > 0 && (
                    <select
                      value={filterCentre}
                      onChange={(e) => setFilterCentre(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Centres</option>
                      {centres.map(centre => (
                        <option key={centre} value={centre}>{centre}</option>
                      ))}
                    </select>
                  )}
                  
                  {availableCourses.length > 0 && (
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Courses</option>
                      {availableCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {filteredResources.length === 0 ? (
                <div className="card text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No resources found</p>
                </div>
              ) : (
                filteredResources.map((resource) => (
                  <div key={resource.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.verificationStatus || 'pending')}`}>
                            {(resource.verificationStatus || 'pending').charAt(0).toUpperCase() + (resource.verificationStatus || 'pending').slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <p><span className="font-medium">Uploader:</span> {resource.uploaderName}</p>
                          <p><span className="font-medium">Course:</span> {resource.course}</p>
                          <p><span className="font-medium">Subject:</span> {resource.subject}</p>
                          <p><span className="font-medium">Type:</span> {resource.type}</p>
                          {resource.centre && <p><span className="font-medium">Centre:</span> {resource.centre}</p>}
                          <p><span className="font-medium">Year:</span> {resource.year}</p>
                        </div>
                        <p className="text-xs text-gray-500">Uploaded: {new Date(resource.uploadedAt).toLocaleString()}</p>
                        {resource.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600"><span className="font-medium">Rejection Reason:</span> {resource.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button
                          onClick={() => setSelectedResource(resource)}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {(!resource.verificationStatus || resource.verificationStatus === 'pending') && (
                          <>
                            <button
                              onClick={() => handleApproveResource(resource.id)}
                              className="flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason (optional):');
                                if (reason !== null) {
                                  handleRejectResource(resource.id, reason);
                                }
                              }}
                              className="flex items-center justify-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Course Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="card text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No course requests found</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.courseName}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Requester: {request.requesterName}</p>
                          <p>School: {request.school}</p>
                          {request.centre && <p>Centre: {request.centre}</p>}
                          <p className="text-xs">Requested: {new Date(request.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users Tab (View Only) */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="card hover:shadow-lg transition-shadow border-l-4 border-primary-500">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{user.fullName || 'Unknown User'}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">School:</span>
                            <span className="text-gray-600">{user.school}</span>
                          </div>
                          {user.centre && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Centre:</span>
                              <span className="text-gray-600">{user.centre}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Course:</span>
                            <span className="text-gray-600">{user.course}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Contributions:</span>
                            <span className="text-gray-600">{user.contributionCount || 0}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Joined: {new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {user.hasPaid && (
                          <span className="px-4 py-2 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                            💎 Premium
                          </span>
                        )}
                        {!user.hasPaid && user.hasContributed && (
                          <span className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                            ⭐ Contributor
                          </span>
                        )}
                        {!user.hasPaid && !user.hasContributed && (
                          <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                            🔒 Limited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
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

export default SchoolAdminPanel;
