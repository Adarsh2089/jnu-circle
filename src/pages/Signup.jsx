import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ArrowLeft } from 'lucide-react';
import CourseRequestModal from '../components/CourseRequestModal';
import { 
  getAllSchools, 
  isSchoolHavingCentres, 
  getCentresForSchool, 
  getCoursesForEntity 
} from '../data/schoolCourseMapping';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    school: '',
    centre: '', // New field for centre selection
    course: '',
    semester: '',
    enrollmentYear: ''
  });

  // Track if selected school has centres
  const [showCentreField, setShowCentreField] = useState(false);
  const [availableCentres, setAvailableCentres] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [jnuSchools, setJnuSchools] = useState([]);
  const [showCourseRequestModal, setShowCourseRequestModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      console.log('🔄 Loading schools from Firebase...');
      const schools = await getAllSchools();
      console.log('✅ Schools received in Signup:', schools);
      setJnuSchools(schools);
    };
    loadSchools();
  }, []);

  const handleBackToHome = () => {
    // Clear all form states
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      school: '',
      centre: '',
      course: '',
      semester: '',
      enrollmentYear: ''
    });
    setError('');
    setLoading(false);
    setShowCentreField(false);
    setAvailableCentres([]);
    setAvailableCourses([]);
    // Navigate to home
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSchoolChange = async (e) => {
    const selectedSchool = e.target.value;
    setFormData({
      ...formData,
      school: selectedSchool,
      centre: '',
      course: ''
    });

    if (selectedSchool && await isSchoolHavingCentres(selectedSchool)) {
      // School has centres - show centre dropdown
      setShowCentreField(true);
      const centres = await getCentresForSchool(selectedSchool);
      setAvailableCentres(centres);
      setAvailableCourses([]);
    } else if (selectedSchool) {
      // School has direct courses - show courses
      setShowCentreField(false);
      setAvailableCentres([]);
      const courses = await getCoursesForEntity(selectedSchool);
      setAvailableCourses(courses);
    } else {
      // No school selected
      setShowCentreField(false);
      setAvailableCentres([]);
      setAvailableCourses([]);
    }
  };

  const handleCentreChange = async (e) => {
    const selectedCentre = e.target.value;
    setFormData({
      ...formData,
      centre: selectedCentre,
      course: ''
    });

    if (selectedCentre) {
      const courses = await getCoursesForEntity(selectedCentre);
      setAvailableCourses(courses);
    } else {
      setAvailableCourses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!formData.email.includes('@jnu.ac.in')) {
      return setError('Please use your JNU email address');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        school: formData.school,
        centre: formData.centre || null, // Include centre if selected
        course: formData.course,
        semester: parseInt(formData.semester) || null,
        enrollmentYear: formData.enrollmentYear
      });
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account. ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CourseRequestModal 
        isOpen={showCourseRequestModal}
        onClose={() => setShowCourseRequestModal(false)}
        prefilledSchool={formData.school}
        prefilledCentre={formData.centre}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <button
            onClick={handleBackToHome}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                JNU Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="yourname@jnu.ac.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                School/Centre <span className="text-red-500">*</span>
              </label>
              <select
                id="school"
                name="school"
                required
                className="input-field"
                value={formData.school}
                onChange={handleSchoolChange}
              >
                <option value="">Select your school/Centre</option>
                {jnuSchools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Centre Field - Only show if school has centres */}
            {showCentreField && (
              <div>
                <label htmlFor="centre" className="block text-sm font-medium text-gray-700 mb-1">
                  Centre <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal">
                    ({availableCentres.length} available)
                  </span>
                </label>
                <select
                  id="centre"
                  name="centre"
                  required
                  className="input-field"
                  value={formData.centre}
                  onChange={handleCentreChange}
                >
                  <option value="">Select your centre</option>
                  {availableCentres.map((centre) => (
                    <option key={centre} value={centre}>
                      {centre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Course Field - Enabled after school selection (if no centres) or centre selection */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
                {availableCourses.length > 0 && (
                  <span className="text-xs text-gray-500 font-normal">
                    ({availableCourses.length} available)
                  </span>
                )}
              </label>
              <select
                id="course"
                name="course"
                required
                className="input-field"
                value={formData.course}
                onChange={handleChange}
                disabled={availableCourses.length === 0}
              >
                <option value="">
                  {!formData.school 
                    ? 'First select a school' 
                    : showCentreField && !formData.centre
                    ? 'First select a centre'
                    : 'Select your course'}
                </option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {availableCourses.length === 0 && formData.school && (
                <p className="text-xs text-gray-500 mt-1">
                  {showCentreField ? 'Please select a centre first' : 'Please select a school first'}
                </p>
              )}
              {availableCourses.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Can't find your course?{' '}
                  <button
                    type="button"
                    onClick={() => setShowCourseRequestModal(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Request to add it
                  </button>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Current Semester <span className="text-red-500">*</span>
              </label>
              <select
                id="semester"
                name="semester"
                required
                className="input-field"
                value={formData.semester}
                onChange={handleChange}
              >
                <option value="">Select your semester</option>
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

            <div>
              <label htmlFor="enrollmentYear" className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Year <span className="text-red-500">*</span>
              </label>
              <input
                id="enrollmentYear"
                name="enrollmentYear"
                type="number"
                required
                className="input-field"
                placeholder="2024"
                min="2000"
                max={new Date().getFullYear()}
                value={formData.enrollmentYear}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
