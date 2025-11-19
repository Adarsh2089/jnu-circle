import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../config/cloudinary';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Upload as UploadIcon, FileText, CheckCircle } from 'lucide-react';
import UploadSuccessModal from '../components/UploadSuccessModal';
import DashboardFooter from '../components/DashboardFooter';
import CourseRequestModal from '../components/CourseRequestModal';
import { 
  getCoursesForSchool, 
  getAllSchools, 
  isSchoolHavingCentres, 
  getCentresForSchool, 
  getCoursesForEntity 
} from '../data/schoolCourseMapping';

const Upload = () => {
  const { user, userProfile } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    school: isAdmin ? '' : (userProfile?.school || ''), // Admin can select any school, users locked to their school
    centre: '', // New field for centre selection
    course: '', // Let user select any course from their school
    subject: '',
    type: 'pyq',
    year: new Date().getFullYear(),
    semester: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cascading dropdown states for admin
  const [showCentreField, setShowCentreField] = useState(false);
  const [availableCentres, setAvailableCentres] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [showCourseRequestModal, setShowCourseRequestModal] = useState(false);

  // Initialize schools and courses on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Get all schools
      const schools = await getAllSchools();
      setAllSchools(schools);

      // For non-admin users, initialize courses based on their school
      if (!isAdmin && userProfile?.school) {
        setFormData(prev => ({
          ...prev,
          school: userProfile.school
        }));
        const courses = await getCoursesForSchool(userProfile.school);
        setAvailableCourses(courses);
      }
    };
    initializeData();
  }, [isAdmin, userProfile]);

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

    // For admin, handle cascading
    if (isAdmin && selectedSchool) {
      if (await isSchoolHavingCentres(selectedSchool)) {
        setShowCentreField(true);
        const centres = await getCentresForSchool(selectedSchool);
        setAvailableCentres(centres);
        setAvailableCourses([]);
      } else {
        setShowCentreField(false);
        setAvailableCentres([]);
        const courses = await getCoursesForEntity(selectedSchool);
        setAvailableCourses(courses);
      }
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(`Invalid file type: ${selectedFile.type}. Please upload only PDF or image files (PDF, JPG, PNG, GIF).`);
        setFile(null);
        return;
      }
      
      // Validate file size (max 25MB for better support)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (selectedFile.size > maxSize) {
        setError(`File size must be less than 25MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`);
        setFile(null);
        return;
      }
      
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + 'MB'
      });
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress('Preparing file...');
      
      console.log('Starting upload process...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
      });

      // Upload file to Cloudinary
      setUploadProgress(`Uploading ${file.type === 'application/pdf' ? 'PDF' : 'image'} to cloud storage...`);
      console.log('Uploading to Cloudinary...');
      const cloudinaryResult = await uploadToCloudinary(file);
      console.log('Cloudinary upload successful:', cloudinaryResult);

      // Save metadata to Firestore
      setUploadProgress('Saving resource information...');
      console.log('Saving metadata to Firestore...');
      
      // Prepare document data with proper handling of undefined values
      const resourceData = {
        ...formData,
        fileUrl: cloudinaryResult.url || '',
        filePublicId: cloudinaryResult.publicId || '',
        fileType: cloudinaryResult.resourceType || 'raw',
        fileFormat: cloudinaryResult.format || file.name.split('.').pop() || 'unknown',
        fileSize: cloudinaryResult.bytes || file.size || 0,
        uploadedBy: user.uid,
        uploaderName: userProfile?.name || userProfile?.fullName || 'Anonymous',
        uploaderEmail: user.email || '',
        uploaderSchool: formData.school || userProfile?.school || 'N/A',
        uploaderCentre: formData.centre || userProfile?.centre || '',
        uploadedAt: new Date().toISOString(),
        views: 0,
        verified: false,
        verificationStatus: 'pending', // Default status: pending admin approval
        verifiedAt: null,
        verifiedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: ''
      };
      
      console.log('Resource data to save:', resourceData);
      const docRef = await addDoc(collection(db, 'resources'), resourceData);
      
      console.log('Firestore save successful. Document ID:', docRef.id);

      // Update user's contribution status in their profile
      setUploadProgress('Updating your profile...');
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        hasContributed: true,
        contributionCount: increment(1)
      });
      console.log('User profile updated - contribution count incremented');
      
      setUploadProgress('Upload complete!');
      setSuccess(true);
      // Don't auto-redirect anymore, let user close modal
      
    } catch (error) {
      console.error('Upload error:', error);
      // Show the actual error message from Cloudinary
      setError(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccess(false);
    // Reset form - admin gets empty fields, users get their school pre-filled
    setFormData({
      title: '',
      description: '',
      school: isAdmin ? '' : (userProfile?.school || ''),
      centre: '',
      course: '',
      subject: '',
      type: 'pyq',
      year: new Date().getFullYear(),
      semester: ''
    });
    setFile(null);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <CourseRequestModal 
        isOpen={showCourseRequestModal}
        onClose={() => setShowCourseRequestModal(false)}
        prefilledSchool={formData.school}
        prefilledCentre={formData.centre}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Resource</h1>
          <p className="text-gray-600 mt-2">
            Share your PYQs, notes, or study materials with fellow JNU students
          </p>
        </div>

        {/* Access Control Notice */}
        <div className="mb-6 card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                {isAdmin ? 'Admin Upload Access' : 'Upload for Your School/Centre'}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {isAdmin ? (
                  <>
                    As an admin, you can upload resources for any school/centre and course.
                    <br />
                    Select the school and course from the dropdowns below.
                  </>
                ) : (
                  <>
                    You can upload resources for any course in your school/centre: <br />
                    <strong>{userProfile?.school}</strong>
                  </>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                {isAdmin ? 'Help students across all schools!' : 'Help your fellow students by sharing resources from any course!'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline whitespace-pre-line">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                placeholder="e.g., Data Structures Mid-Sem 2024"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                className="input-field"
                placeholder="Brief description of the resource"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type *
                </label>
                <select
                  name="type"
                  required
                  className="input-field"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="pyq">Previous Year Question</option>
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School/Centre *
                </label>
                {isAdmin ? (
                  <select
                    name="school"
                    required
                    className="input-field"
                    value={formData.school}
                    onChange={handleSchoolChange}
                  >
                    <option value="">Select school/centre</option>
                    {allSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="school"
                    required
                    className="input-field bg-gray-100 cursor-not-allowed"
                    placeholder="Your school"
                    value={formData.school}
                    readOnly
                    disabled
                    title="You can only upload resources for your own school/centre"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? 'Select any school/centre' : 'You can only upload content for your school/centre'}
                </p>
              </div>
            </div>

            {/* Centre Field - Only show for admin if school has centres */}
            {isAdmin && showCentreField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centre *
                </label>
                <select
                  name="centre"
                  required
                  className="input-field"
                  value={formData.centre}
                  onChange={handleCentreChange}
                >
                  <option value="">Select centre</option>
                  {availableCentres.map(centre => (
                    <option key={centre} value={centre}>{centre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the centre under this school
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  name="course"
                  required
                  className="input-field"
                  value={formData.course}
                  onChange={handleChange}
                  disabled={availableCourses.length === 0}
                >
                  <option value="">Select course</option>
                  {availableCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin 
                    ? (showCentreField && !formData.centre 
                        ? 'Select centre first' 
                        : !formData.school 
                        ? 'Select school first'
                        : 'Select course from the chosen ' + (formData.centre ? 'centre' : 'school'))
                    : 'Select any course from your school/centre'}
                </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="input-field"
                  placeholder="e.g., Data Structures"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  required
                  className="input-field"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  className="input-field"
                  value={formData.semester}
                  onChange={handleChange}
                >
                  <option value="">Select semester</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File * (PDF or Image, max 10MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG, GIF up to 25MB
                  </p>
                  {file && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Selected: {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)}MB • {file.type}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {uploading && uploadProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-blue-800 font-medium">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5 mr-2" />
                    Upload Resource
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
        </div>

        {/* Minimal Footer */}
        <DashboardFooter />

        {/* Success Modal Overlay */}
        {success && (
          <UploadSuccessModal
            onClose={handleCloseSuccessModal}
            onViewDashboard={handleGoToDashboard}
          />
        )}
      </div>
    </>
  );
};

export default Upload;
