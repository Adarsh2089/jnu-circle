import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { User, Mail, GraduationCap, Calendar, Award, Upload as UploadIcon, Edit2, Save, X, TrendingUp, Target } from 'lucide-react';
import CourseRequestModal from '../components/CourseRequestModal';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import DashboardFooter from '../components/DashboardFooter';

// Import school-course mapping
import { 
  getAllSchools, 
  isSchoolHavingCentres, 
  getCentresForSchool, 
  getCoursesForEntity 
} from '../data/schoolCourseMapping';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    school: '',
    centre: '',
    course: '',
    semester: '',
    enrollmentYear: ''
  });

  // Cascading dropdown states
  const [showCentreField, setShowCentreField] = useState(false);
  const [availableCentres, setAvailableCentres] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourseRequestModal, setShowCourseRequestModal] = useState(false);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Initialize edited profile when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setEditedProfile({
        fullName: userProfile.fullName || '',
        school: userProfile.school || '',
        centre: userProfile.centre || '',
        course: userProfile.course || '',
        semester: userProfile.semester || '',
        enrollmentYear: userProfile.enrollmentYear || ''
      });

      // Initialize cascading state based on current profile
      const initializeCascadingData = async () => {
        if (userProfile.school) {
          if (await isSchoolHavingCentres(userProfile.school)) {
            setShowCentreField(true);
            const centres = await getCentresForSchool(userProfile.school);
            setAvailableCentres(centres);
            if (userProfile.centre) {
              const courses = await getCoursesForEntity(userProfile.centre);
              setAvailableCourses(courses);
            }
          } else {
            setShowCentreField(false);
            const courses = await getCoursesForEntity(userProfile.school);
            setAvailableCourses(courses);
          }
        }
      };
      initializeCascadingData();
    }
  }, [userProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = async () => {
    setIsEditing(false);
    // Reset to original values
    setEditedProfile({
      fullName: userProfile?.fullName || '',
      school: userProfile?.school || '',
      centre: userProfile?.centre || '',
      course: userProfile?.course || '',
      semester: userProfile?.semester || '',
      enrollmentYear: userProfile?.enrollmentYear || ''
    });

    // Reset cascading states
    if (userProfile?.school) {
      if (await isSchoolHavingCentres(userProfile.school)) {
        setShowCentreField(true);
        const centres = await getCentresForSchool(userProfile.school);
        setAvailableCentres(centres);
        if (userProfile.centre) {
          const courses = await getCoursesForEntity(userProfile.centre);
          setAvailableCourses(courses);
        }
      } else {
        setShowCentreField(false);
        const courses = await getCoursesForEntity(userProfile.school);
        setAvailableCourses(courses);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: editedProfile.fullName,
        school: editedProfile.school,
        centre: editedProfile.centre || null, // Include centre
        course: editedProfile.course,
        semester: parseInt(editedProfile.semester) || null,
        enrollmentYear: editedProfile.enrollmentYear
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle school change - reset centre and course when school changes
  const handleSchoolChange = async (school) => {
    setEditedProfile(prev => ({
      ...prev,
      school: school,
      centre: '',
      course: ''
    }));

    if (school && await isSchoolHavingCentres(school)) {
      // School has centres - show centre dropdown
      setShowCentreField(true);
      const centres = await getCentresForSchool(school);
      setAvailableCentres(centres);
      setAvailableCourses([]);
    } else if (school) {
      // School has direct courses - show courses
      setShowCentreField(false);
      setAvailableCentres([]);
      const courses = await getCoursesForEntity(school);
      setAvailableCourses(courses);
    } else {
      // No school selected
      setShowCentreField(false);
      setAvailableCentres([]);
      setAvailableCourses([]);
    }
  };

  // Handle centre change - reset course when centre changes
  const handleCentreChange = async (centre) => {
    setEditedProfile(prev => ({
      ...prev,
      centre: centre,
      course: ''
    }));

    if (centre) {
      const courses = await getCoursesForEntity(centre);
      setAvailableCourses(courses);
    } else {
      setAvailableCourses([]);
    }
  };

  const jnuSchools = getAllSchools();

  return (
    <>
      <CourseRequestModal 
        isOpen={showCourseRequestModal}
        onClose={() => setShowCourseRequestModal(false)}
        prefilledSchool={editedProfile.school}
        prefilledCentre={editedProfile.centre}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userProfile?.fullName || 'Student'}
                  </h2>
                )}
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">School</p>
                  {isEditing ? (
                    <select
                      value={editedProfile.school}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      className="w-full font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                    >
                      <option value="">Select School</option>
                      {jnuSchools.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900">{userProfile?.school || 'N/A'}</p>
                  )}
                </div>
              </div>

              {/* Centre Field - Only show in edit mode if school has centres */}
              {isEditing && showCentreField && (
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Centre</p>
                    <select
                      value={editedProfile.centre}
                      onChange={(e) => handleCentreChange(e.target.value)}
                      className="w-full font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                    >
                      <option value="">Select Centre</option>
                      {availableCentres.map((centre) => (
                        <option key={centre} value={centre}>
                          {centre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {!isEditing && userProfile?.centre && (
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Centre</p>
                    <p className="font-medium text-gray-900">{userProfile.centre}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Course</p>
                  {isEditing ? (
                    <select
                      value={editedProfile.course}
                      onChange={(e) => handleChange('course', e.target.value)}
                      disabled={availableCourses.length === 0}
                      className="w-full font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent disabled:opacity-50"
                    >
                      <option value="">
                        {!editedProfile.school 
                          ? 'Select School First' 
                          : showCentreField && !editedProfile.centre
                          ? 'Select Centre First'
                          : 'Select Course'}
                      </option>
                      {availableCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900">{userProfile?.course || 'N/A'}</p>
                  )}
                  {isEditing && availableCourses.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Can't find your course?{' '}
                      <button
                        type="button"
                        onClick={() => setShowCourseRequestModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Request to add it
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Current Semester</p>
                  {isEditing ? (
                    <select
                      value={editedProfile.semester}
                      onChange={(e) => handleChange('semester', e.target.value)}
                      className="w-full font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900">
                      {userProfile?.semester ? `Semester ${userProfile.semester}` : 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Enrollment Year</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.enrollmentYear}
                      onChange={(e) => handleChange('enrollmentYear', e.target.value)}
                      className="w-full font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      placeholder="2024"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{userProfile?.enrollmentYear || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UploadIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Contributions</p>
                  <p className="font-medium text-gray-900">{userProfile?.contributionCount || 0} resources</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Resources Viewed</p>
                  <p className="font-medium text-gray-900">{userProfile?.viewCount || 0}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Account Status</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.isPremium ? 'Premium' : 
                     userProfile?.hasContributed ? 'Active (Contributor)' : 'Limited Access'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade to Premium (only if not premium) */}
        {!userProfile?.isPremium && (
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 mb-6">
            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-yellow-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                  Upgrade to Premium
                </h3>
                <p className="text-yellow-700 mb-4">
                  Get unlimited access to all resources for just ₹99/year
                </p>
                <Link to="/pricing" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Get Premium Access
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Your Statistics */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-4xl font-bold text-blue-600 mb-2">{userProfile?.contributionCount || 0}</p>
              <p className="text-sm text-gray-600">Uploads</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-4xl font-bold text-green-600 mb-2">{userProfile?.viewCount || 0}</p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <p className="text-4xl font-bold text-purple-600 mb-2">
                {userProfile?.isPremium || userProfile?.hasContributed ? '∞' : '0'}
              </p>
              <p className="text-sm text-gray-600">Access Level</p>
            </div>
            <div className="text-center p-6 bg-pink-50 rounded-lg">
              <div className="text-4xl mb-2">
                {userProfile?.isPremium ? '⭐' : userProfile?.hasContributed ? '🎯' : '👤'}
              </div>
              <p className="text-sm text-gray-600">Badge</p>
            </div>
          </div>
        </div>
        </div>
        </div>

        {/* Minimal Footer */}
        <DashboardFooter />
      </div>
    </>
  );
};

export default Profile;
