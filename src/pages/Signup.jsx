import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import CourseRequestModal from '../components/CourseRequestModal';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/animations/loading.json';
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
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Right Side - Animation */}
            <div className="hidden md:flex items-center justify-center bg-white p-12 order-2">
              <div className="w-full max-w-md">
                <Lottie animationData={loadingAnimation} loop={true} />
              </div>
            </div>

            {/* Left Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 order-1">
              <div className="w-full max-w-md mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                  Sign up
                </h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Your Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>

                  {/* School Select */}
                  <div>
                    <select
                      name="school"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 text-base"
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
                      <select
                        name="centre"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 text-base"
                        value={formData.centre}
                        onChange={handleCentreChange}
                      >
                        <option value="">Select your centre ({availableCentres.length} available)</option>
                        {availableCentres.map((centre) => (
                          <option key={centre} value={centre}>
                            {centre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Course Field */}
                  <div>
                    <select
                      name="course"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 text-base disabled:opacity-50 disabled:bg-gray-100"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={availableCourses.length === 0}
                    >
                      <option value="">
                        {!formData.school 
                          ? 'First select a school' 
                          : showCentreField && !formData.centre
                          ? 'First select a centre'
                          : `Select your course (${availableCourses.length} available)`}
                      </option>
                      {availableCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {availableCourses.length > 0 && (
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

                  {/* Semester Select */}
                  <div>
                    <select
                      name="semester"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 text-base"
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

                  {/* Enrollment Year */}
                  <div>
                    <input
                      name="enrollmentYear"
                      type="number"
                      required
                      placeholder="Enrollment Year (e.g., 2024)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={formData.enrollmentYear}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>

                  {/* Repeat Password Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree all statements in{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
                        Terms of service
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Register'}
                  </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium underline transition-colors"
                  >
                    I am already member
                  </Link>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleBackToHome}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
