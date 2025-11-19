import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy, arrayUnion, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Trash2, Filter, Search, Users, FileText, BookOpen, UserPlus } from 'lucide-react';
import DashboardFooter from '../components/DashboardFooter';
import AdminCourseManager from '../components/AdminCourseManager';
import { getAllSchools, getCoursesForSchool } from '../data/schoolCourseMapping';

const AdminPanel = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'users', 'requests', 'courses', or 'nominations'
  
  // Resources state
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterSchool, setUserFilterSchool] = useState('all');
  const [userFilterCourse, setUserFilterCourse] = useState('all');
  const [userFilterStatus, setUserFilterStatus] = useState('all'); // all, paid, contributor, limited
  const [userFilterRole, setUserFilterRole] = useState('all'); // all, schoolAdmin, centreAdmin, user
  
  // Course Requests state
  const [courseRequests, setCourseRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [requestFilterStatus, setRequestFilterStatus] = useState('pending'); // pending, approved, rejected
  
  // Nominations state
  const [nominations, setNominations] = useState([]);
  const [filteredNominations, setFilteredNominations] = useState([]);
  const [nominationsLoading, setNominationsLoading] = useState(true);
  const [nominationSearchTerm, setNominationSearchTerm] = useState('');
  const [nominationFilterStatus, setNominationFilterStatus] = useState('pending'); // pending, approved, rejected
  const [nominationFilterType, setNominationFilterType] = useState('all'); // all, school, centre
  
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchResources();
    fetchUsers();
    fetchCourseRequests();
    fetchNominations();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterResourceResults();
  }, [resources, filterStatus, resourceSearchTerm, filterSchool, filterCourse, filterType]);

  useEffect(() => {
    filterUserResults();
  }, [users, userSearchTerm, userFilterSchool, userFilterCourse, userFilterStatus, userFilterRole]);

  useEffect(() => {
    filterRequestResults();
  }, [courseRequests, requestSearchTerm, requestFilterStatus]);

  useEffect(() => {
    filterNominationResults();
  }, [nominations, nominationSearchTerm, nominationFilterStatus, nominationFilterType]);

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      const q = query(
        collection(db, 'resources'),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  };

  const fetchCourseRequests = async () => {
    try {
      setRequestsLoading(true);
      const q = query(
        collection(db, 'course_add_request'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourseRequests(requestsData);
    } catch (error) {
      console.error('Error fetching course requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchNominations = async () => {
    try {
      setNominationsLoading(true);
      const q = query(
        collection(db, 'admin_nominations'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const nominationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNominations(nominationsData);
    } catch (error) {
      console.error('Error fetching nominations:', error);
    } finally {
      setNominationsLoading(false);
    }
  };

  const filterResourceResults = () => {
    let filtered = resources;

    // Status filter
    if (filterStatus === 'pending') {
      filtered = filtered.filter(r => r.verificationStatus === 'pending' || !r.verificationStatus);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(r => r.verificationStatus === 'approved');
    } else if (filterStatus === 'rejected') {
      filtered = filtered.filter(r => r.verificationStatus === 'rejected');
    }

    // School filter
    if (filterSchool !== 'all') {
      filtered = filtered.filter(r => r.uploaderSchool === filterSchool);
    }

    // Course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(r => r.course === filterCourse);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Search filter
    if (resourceSearchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
        resource.subject.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
        resource.uploaderName.toLowerCase().includes(resourceSearchTerm.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const filterUserResults = () => {
    let filtered = users;

    // School filter
    if (userFilterSchool !== 'all') {
      filtered = filtered.filter(u => u.school === userFilterSchool);
    }

    // Course filter
    if (userFilterCourse !== 'all') {
      filtered = filtered.filter(u => u.course === userFilterCourse);
    }

    // Role filter
    if (userFilterRole === 'schoolAdmin') {
      filtered = filtered.filter(u => u.role === 'schoolAdmin');
    } else if (userFilterRole === 'centreAdmin') {
      filtered = filtered.filter(u => u.role === 'centreAdmin');
    } else if (userFilterRole === 'user') {
      filtered = filtered.filter(u => !u.role || u.role === 'user');
    }

    // Status filter
    if (userFilterStatus === 'paid') {
      filtered = filtered.filter(u => u.hasPaid);
    } else if (userFilterStatus === 'contributor') {
      filtered = filtered.filter(u => u.hasContributed);
    } else if (userFilterStatus === 'limited') {
      filtered = filtered.filter(u => !u.hasPaid && !u.hasContributed);
    }

    // Search filter
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.school && user.school.toLowerCase().includes(userSearchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  };

  const filterRequestResults = () => {
    let filtered = courseRequests;

    // Status filter
    if (requestFilterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === requestFilterStatus);
    }

    // Search filter
    if (requestSearchTerm) {
      filtered = filtered.filter(request =>
        request.courseName.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
        request.requesterName.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
        (request.school && request.school.toLowerCase().includes(requestSearchTerm.toLowerCase())) ||
        (request.centre && request.centre.toLowerCase().includes(requestSearchTerm.toLowerCase()))
      );
    }

    setFilteredRequests(filtered);
  };

  const filterNominationResults = () => {
    let filtered = nominations;

    // Status filter
    if (nominationFilterStatus !== 'all') {
      filtered = filtered.filter(n => n.status === nominationFilterStatus);
    }

    // Type filter
    if (nominationFilterType !== 'all') {
      filtered = filtered.filter(n => n.nominationType === nominationFilterType);
    }

    // Search filter
    if (nominationSearchTerm) {
      filtered = filtered.filter(nomination =>
        nomination.userName.toLowerCase().includes(nominationSearchTerm.toLowerCase()) ||
        nomination.userEmail.toLowerCase().includes(nominationSearchTerm.toLowerCase()) ||
        nomination.targetSchool.toLowerCase().includes(nominationSearchTerm.toLowerCase()) ||
        (nomination.targetCentre && nomination.targetCentre.toLowerCase().includes(nominationSearchTerm.toLowerCase()))
      );
    }

    setFilteredNominations(filtered);
  };

  // State for schools and courses
  const [allSchools, setAllSchools] = useState([]);
  const [availableCoursesForResources, setAvailableCoursesForResources] = useState([]);
  const [availableCoursesForUsers, setAvailableCoursesForUsers] = useState([]);

  // Initialize schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await getAllSchools();
      setAllSchools(schools);
    };
    fetchSchools();
  }, []);
  
  // Update courses when resource filter school changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (filterSchool !== 'all') {
        const courses = await getCoursesForSchool(filterSchool);
        setAvailableCoursesForResources(courses);
      } else {
        setAvailableCoursesForResources([]);
      }
    };
    fetchCourses();
  }, [filterSchool]);
  
  // Update courses when user filter school changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (userFilterSchool !== 'all') {
        const courses = await getCoursesForSchool(userFilterSchool);
        setAvailableCoursesForUsers(courses);
      } else {
        setAvailableCoursesForUsers([]);
      }
    };
    fetchCourses();
  }, [userFilterSchool]);

  // Get unique types from resources
  const getUniqueTypes = () => [...new Set(resources.map(r => r.type).filter(Boolean))];

  const handleApprove = async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        verificationStatus: 'approved',
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin'
      });

      // Update user's hasContributed status
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        const userRef = doc(db, 'users', resource.uploadedBy);
        await updateDoc(userRef, {
          hasContributed: true,
          contributionCount: (resource.contributionCount || 0) + 1
        });
      }

      alert('Resource approved successfully!');
      fetchResources();
      fetchUsers(); // Refresh users to update contributor status
    } catch (error) {
      console.error('Error approving resource:', error);
      alert('Failed to approve resource');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      // Get the request details
      const request = courseRequests.find(r => r.id === requestId);
      if (!request) {
        alert('Request not found');
        return;
      }

      const { courseName, school, centre } = request;
      
      // Determine which collection to update
      const collectionName = centre ? 'centre_courses' : 'school_courses';
      const entityName = centre || school;

      if (!entityName) {
        alert('Invalid request: missing school or centre information');
        return;
      }

      // Add course to the appropriate Firebase collection
      const entityRef = doc(db, collectionName, entityName);
      await updateDoc(entityRef, {
        courses: arrayUnion(courseName),
        updatedAt: new Date().toISOString()
      });

      // Update request status
      const requestRef = doc(db, 'course_add_request', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      });

      alert(`✅ Course "${courseName}" approved and added to ${entityName}!`);
      fetchCourseRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Are you sure you want to reject this course request?')) return;

    try {
      const requestRef = doc(db, 'course_add_request', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin'
      });

      alert('Course request rejected');
      fetchCourseRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this course request? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'course_add_request', requestId));
      alert('Course request deleted');
      fetchCourseRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request');
    }
  };

  // Nomination handlers
  const handleApproveNomination = async (nominationId) => {
    const nomination = nominations.find(n => n.id === nominationId);
    if (!nomination) return;

    const confirmMsg = `Approve ${nomination.userName} as ${nomination.nominationType === 'school' ? 'School' : 'Centre'} Admin for ${nomination.targetSchool}${nomination.targetCentre ? ` - ${nomination.targetCentre}` : ''}?`;
    if (!confirm(confirmMsg)) return;

    try {
      let userId = nomination.userId;

      // If account needs to be created (pending nomination)
      if (!nomination.accountCreated && nomination.pendingPassword) {
        try {
          // Create Firebase Auth account
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            nomination.userEmail,
            nomination.pendingPassword
          );
          userId = userCredential.user.uid;

          // Create user profile in Firestore
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            uid: userId,
            email: nomination.userEmail,
            name: nomination.userName,
            school: nomination.userSchool || nomination.targetSchool,
            centre: nomination.userCentre || nomination.targetCentre || '',
            role: nomination.nominationType === 'school' ? 'schoolAdmin' : 'centreAdmin',
            adminSchool: nomination.targetSchool,
            adminCentre: nomination.nominationType === 'centre' ? nomination.targetCentre : '',
            accountType: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          console.log('✅ Account created for:', nomination.userEmail);
        } catch (authError) {
          console.error('Error creating account:', authError);
          if (authError.code === 'auth/email-already-in-use') {
            alert('⚠️ Email already exists. Please ask the user to login and resubmit nomination.');
            return;
          }
          throw authError;
        }
      } else {
        // Update existing user role
        const userRef = doc(db, 'users', userId);
        const roleUpdate = {
          role: nomination.nominationType === 'school' ? 'schoolAdmin' : 'centreAdmin',
          adminSchool: nomination.targetSchool,
          updatedAt: new Date().toISOString()
        };
        
        if (nomination.nominationType === 'centre') {
          roleUpdate.adminCentre = nomination.targetCentre;
        }
        
        await updateDoc(userRef, roleUpdate);
      }

      // Update nomination status
      const nominationRef = doc(db, 'admin_nominations', nominationId);
      await updateDoc(nominationRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin',
        createdUserId: userId
      });

      alert(`✅ ${nomination.userName} approved as ${nomination.nominationType === 'school' ? 'School' : 'Centre'} Admin!${!nomination.accountCreated ? '\n\n📧 Account created successfully!' : ''}`);
      fetchNominations();
      fetchUsers();
    } catch (error) {
      console.error('Error approving nomination:', error);
      alert('Failed to approve nomination: ' + error.message);
    }
  };

  const handleRejectNomination = async (nominationId) => {
    const reviewNotes = prompt('Reason for rejection (optional):');
    if (reviewNotes === null) return; // User cancelled

    try {
      const nominationRef = doc(db, 'admin_nominations', nominationId);
      await updateDoc(nominationRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin',
        reviewNotes: reviewNotes || 'No reason provided'
      });

      alert('Nomination rejected');
      fetchNominations();
    } catch (error) {
      console.error('Error rejecting nomination:', error);
      alert('Failed to reject nomination');
    }
  };

  const handleDeleteNomination = async (nominationId) => {
    if (!confirm('Are you sure you want to delete this nomination? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'admin_nominations', nominationId));
      alert('Nomination deleted');
      fetchNominations();
    } catch (error) {
      console.error('Error deleting nomination:', error);
      alert('Failed to delete nomination');
    }
  };

  const handleReject = async (resourceId, reason = '') => {
    if (!confirm('Are you sure you want to reject this resource?')) return;

    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        verificationStatus: 'rejected',
        verified: false,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        rejectedBy: 'admin'
      });

      alert('Resource rejected');
      fetchResources();
    } catch (error) {
      console.error('Error rejecting resource:', error);
      alert('Failed to reject resource');
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to permanently delete this resource?')) return;

    try {
      await deleteDoc(doc(db, 'resources', resourceId));
      alert('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      // Delete user's resources first
      const userResources = resources.filter(r => r.uploadedBy === userId);
      for (const resource of userResources) {
        await deleteDoc(doc(db, 'resources', resource.id));
      }

      // Delete user
      await deleteDoc(doc(db, 'users', userId));
      
      alert('User and their resources deleted successfully');
      fetchUsers();
      fetchResources();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleTogglePaidStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        hasPaid: !currentStatus,
        paidAt: !currentStatus ? new Date().toISOString() : null
      });

      alert(`User ${!currentStatus ? 'marked as paid' : 'payment revoked'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleRemoveAdminRole = async (userId, userRole, userName) => {
    const roleText = userRole === 'schoolAdmin' ? 'School Admin' : 'Centre Admin';
    if (!confirm(`Are you sure you want to remove ${userName} as ${roleText}? This will revoke their admin privileges.`)) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'user',
        adminSchool: null,
        adminCentre: null
      });

      alert(`${userName} has been removed as ${roleText}`);
      fetchUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
      alert('Failed to remove admin role');
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

  const getUserStatusBadge = (user) => {
    if (user.hasPaid) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Paid Member</span>;
    } else if (user.hasContributed) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Contributor</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Limited Access</span>;
    }
  };

  if (resourcesLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and content</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <FileText className="h-5 w-5" />
              <span>Content Management</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`${
                activeTab === 'requests'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <FileText className="h-5 w-5" />
              <span>Course Requests ({courseRequests.filter(r => r.status === 'pending').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`${
                activeTab === 'courses'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Course Management</span>
            </button>
            <button
              onClick={() => setActiveTab('nominations')}
              className={`${
                activeTab === 'nominations'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <UserPlus className="h-5 w-5" />
              <span>Nominations ({nominations.filter(n => n.status === 'pending').length})</span>
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
              <span>User Management</span>
            </button>
          </nav>
        </div>

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {resources.filter(r => r.verificationStatus === 'pending' || !r.verificationStatus).length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {resources.filter(r => r.verificationStatus === 'approved').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {resources.filter(r => r.verificationStatus === 'rejected').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-primary-600">{resources.length}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative col-span-full">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, subject, or uploader..."
                    className="input-field pl-10"
                    value={resourceSearchTerm}
                    onChange={(e) => setResourceSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="input-field"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select
                    className="input-field"
                    value={filterSchool}
                    onChange={(e) => {
                      setFilterSchool(e.target.value);
                      setFilterCourse('all'); // Reset course when school changes
                    }}
                  >
                    <option value="all">All Schools</option>
                    {allSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    className="input-field"
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    disabled={filterSchool === 'all'}
                  >
                    <option value="all">All Courses</option>
                    {filterSchool !== 'all' && availableCoursesForResources.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="input-field"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {getUniqueTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resources List */}
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="card hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.verificationStatus || 'pending')}`}>
                          {resource.verificationStatus || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {resource.type}
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span> {resource.subject}
                        </div>
                        <div>
                          <span className="font-medium">Course:</span> {resource.course}
                        </div>
                        <div>
                          <span className="font-medium">Year:</span> {resource.year}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Uploaded by:</span> {resource.uploaderName} ({resource.uploaderSchool})
                        <span className="ml-4 font-medium">On:</span> {new Date(resource.uploadedAt).toLocaleDateString()}
                      </div>

                      {resource.rejectionReason && (
                        <div className="mt-2 text-sm text-red-600">
                          <span className="font-medium">Rejection Reason:</span> {resource.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0 md:ml-4">
                      <button
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="flex items-center space-x-1 btn-secondary text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>

                      {(resource.verificationStatus === 'pending' || !resource.verificationStatus) && (
                        <>
                          <button
                            onClick={() => handleApprove(resource.id)}
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (optional):');
                              if (reason !== null) handleReject(resource.id, reason);
                            }}
                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12 card">
                <p className="text-gray-600 text-lg">No resources found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-primary-600">{users.length}</p>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <p className="text-sm text-purple-700 font-medium">School Admins</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'schoolAdmin').length}
                </p>
              </div>
              <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <p className="text-sm text-indigo-700 font-medium">Centre Admins</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {users.filter(u => u.role === 'centreAdmin').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Paid Members</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.hasPaid).length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Contributors</p>
                <p className="text-3xl font-bold text-blue-600">
                  {users.filter(u => u.hasContributed).length}
                </p>
              </div>
            </div>

            {/* User Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative col-span-full">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or school..."
                    className="input-field pl-10"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="input-field"
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="schoolAdmin">🏫 School Admin</option>
                    <option value="centreAdmin">🏛️ Centre Admin</option>
                    <option value="user">👤 Regular User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select
                    className="input-field"
                    value={userFilterSchool}
                    onChange={(e) => {
                      setUserFilterSchool(e.target.value);
                      setUserFilterCourse('all'); // Reset course when school changes
                    }}
                  >
                    <option value="all">All Schools</option>
                    {allSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    className="input-field"
                    value={userFilterCourse}
                    onChange={(e) => setUserFilterCourse(e.target.value)}
                    disabled={userFilterSchool === 'all'}
                  >
                    <option value="all">All Courses</option>
                    {userFilterSchool !== 'all' && availableCoursesForUsers.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Status</label>
                  <select
                    className="input-field"
                    value={userFilterStatus}
                    onChange={(e) => setUserFilterStatus(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="paid">Paid Members</option>
                    <option value="contributor">Contributors</option>
                    <option value="limited">Limited Access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School & Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === 'schoolAdmin' ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                              🏫 School Admin
                            </span>
                          ) : user.role === 'centreAdmin' ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                              🏛️ Centre Admin
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                              👤 User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.school}</div>
                          <div className="text-sm text-gray-500">{user.course}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getUserStatusBadge(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.contributionCount || 0} uploads
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleTogglePaidStatus(user.id, user.hasPaid)}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                user.hasPaid 
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              }`}
                            >
                              {user.hasPaid ? '✕ Revoke Payment' : '✓ Mark Paid'}
                            </button>
                            {(user.role === 'schoolAdmin' || user.role === 'centreAdmin') && (
                              <button
                                onClick={() => handleRemoveAdminRole(user.id, user.role, user.fullName)}
                                className="px-3 py-1.5 rounded-lg font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-all"
                              >
                                🚫 Remove Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                            >
                              🗑️ Delete User
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 card">
                <p className="text-gray-600 text-lg">No users found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}

        {/* Course Requests Tab */}
        {activeTab === 'requests' && (
          <>
            {/* Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by course name, requester, school..."
                      className="input-field pl-10"
                      value={requestSearchTerm}
                      onChange={(e) => setRequestSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="input-field"
                    value={requestFilterStatus}
                    onChange={(e) => setRequestFilterStatus(e.target.value)}
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School/Centre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.courseName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.school || 'N/A'}</div>
                          {request.centre && (
                            <div className="text-xs text-gray-500">{request.centre}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.requesterName}</div>
                          <div className="text-xs text-gray-500">{request.requesterEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {request.reason ? (
                              <span className="line-clamp-2">{request.reason}</span>
                            ) : (
                              <span className="text-gray-400 italic">No additional details</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {request.status === 'pending' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {request.status === 'approved' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 card">
                <p className="text-gray-600 text-lg">No course requests found</p>
                <p className="text-gray-500 mt-2">
                  {requestFilterStatus === 'pending' 
                    ? 'No pending requests at the moment' 
                    : 'Try adjusting your filters'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Course Management Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <p className="text-gray-600 mt-2">Add or remove courses from schools and centres</p>
            </div>
            <AdminCourseManager />
          </div>
        )}

        {/* Nominations Management Tab */}
        {activeTab === 'nominations' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {nominations.filter(n => n.status === 'pending').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {nominations.filter(n => n.status === 'approved').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">School Admins</p>
                <p className="text-3xl font-bold text-blue-600">
                  {nominations.filter(n => n.nominationType === 'school' && n.status === 'approved').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Centre Admins</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {nominations.filter(n => n.nominationType === 'centre' && n.status === 'approved').length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or school..."
                      value={nominationSearchTerm}
                      onChange={(e) => setNominationSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={nominationFilterStatus}
                    onChange={(e) => setNominationFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={nominationFilterType}
                    onChange={(e) => setNominationFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="school">School Admin</option>
                    <option value="centre">Centre Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nominations List */}
            <div className="space-y-4">
              {nominationsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading nominations...</p>
                </div>
              ) : filteredNominations.length === 0 ? (
                <div className="card text-center py-12">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No nominations found</p>
                </div>
              ) : (
                filteredNominations.map((nomination) => (
                  <div key={nomination.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {nomination.userName}
                            </h3>
                            <p className="text-sm text-gray-600">{nomination.userEmail}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(nomination.status)}`}>
                            {nomination.status.charAt(0).toUpperCase() + nomination.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              nomination.nominationType === 'school' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {nomination.nominationType === 'school' ? 'School Admin' : 'Centre Admin'}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Target:</span>{' '}
                            <span className="text-gray-900">{nomination.targetSchool}</span>
                            {nomination.targetCentre && (
                              <span className="text-gray-600"> → {nomination.targetCentre}</span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Current:</span>{' '}
                            <span className="text-gray-600">
                              {nomination.userSchool || 'Not set'}
                              {nomination.userCentre && ` → ${nomination.userCentre}`}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                          <p className="text-sm text-gray-600">{nomination.reason}</p>
                        </div>

                        {nomination.experience && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Experience:</p>
                            <p className="text-sm text-gray-600">{nomination.experience}</p>
                          </div>
                        )}

                        {nomination.commitment && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Time Commitment:</p>
                            <p className="text-sm text-gray-600">{nomination.commitment}</p>
                          </div>
                        )}

                        {nomination.reviewNotes && (
                          <div className="bg-yellow-50 rounded-lg p-3 mt-2">
                            <p className="text-sm font-medium text-yellow-800 mb-1">Review Notes:</p>
                            <p className="text-sm text-yellow-700">{nomination.reviewNotes}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(nomination.createdAt).toLocaleString()}
                          {nomination.reviewedAt && (
                            <> • Reviewed: {new Date(nomination.reviewedAt).toLocaleString()}</>
                          )}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {nomination.status === 'pending' && (
                        <div className="flex lg:flex-col gap-2">
                          <button
                            onClick={() => handleApproveNomination(nomination.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Approve nomination"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectNomination(nomination.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            title="Reject nomination"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNomination(nomination.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete nomination"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                      {nomination.status !== 'pending' && (
                        <div className="flex lg:flex-col gap-2">
                          <button
                            onClick={() => handleDeleteNomination(nomination.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete nomination"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        </div>
      </div>

      {/* Minimal Footer */}
      <DashboardFooter />
    </div>
  );
};

export default AdminPanel;
