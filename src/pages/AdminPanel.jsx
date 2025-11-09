import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Trash2, Filter, Search, Users, FileText } from 'lucide-react';

const AdminPanel = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'users'
  
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
  
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchResources();
    fetchUsers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterResourceResults();
  }, [resources, filterStatus, resourceSearchTerm, filterSchool, filterCourse, filterType]);

  useEffect(() => {
    filterUserResults();
  }, [users, userSearchTerm, userFilterSchool, userFilterCourse, userFilterStatus]);

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

  // Get unique values for filters
  const getUniqueSchools = () => [...new Set(resources.map(r => r.uploaderSchool).filter(Boolean))];
  const getUniqueCourses = () => [...new Set(resources.map(r => r.course).filter(Boolean))];
  const getUniqueTypes = () => [...new Set(resources.map(r => r.type).filter(Boolean))];
  const getUserSchools = () => [...new Set(users.map(u => u.school).filter(Boolean))];
  const getUserCourses = () => [...new Set(users.map(u => u.course).filter(Boolean))];

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
    <div className="min-h-screen bg-gray-50 py-8">
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
                    onChange={(e) => setFilterSchool(e.target.value)}
                  >
                    <option value="all">All Schools</option>
                    {getUniqueSchools().map(school => (
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
                  >
                    <option value="all">All Courses</option>
                    {getUniqueCourses().map(course => (
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-primary-600">{users.length}</p>
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
              <div className="card">
                <p className="text-sm text-gray-600">Limited Access</p>
                <p className="text-3xl font-bold text-gray-600">
                  {users.filter(u => !u.hasPaid && !u.hasContributed).length}
                </p>
              </div>
            </div>

            {/* User Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select
                    className="input-field"
                    value={userFilterSchool}
                    onChange={(e) => setUserFilterSchool(e.target.value)}
                  >
                    <option value="all">All Schools</option>
                    {getUserSchools().map(school => (
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
                  >
                    <option value="all">All Courses</option>
                    {getUserCourses().map(course => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleTogglePaidStatus(user.id, user.hasPaid)}
                            className={`${
                              user.hasPaid 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.hasPaid ? 'Revoke Payment' : 'Mark Paid'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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
      </div>
    </div>
  );
};

export default AdminPanel;
