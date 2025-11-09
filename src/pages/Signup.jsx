import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    school: '',
    course: '',
    enrollmentYear: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        course: formData.course,
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

  const jnuSchools = [
    'Centre for African Studies',
    'Centre for Canadian, US and Latin American Studies',
    'Centre for Chinese and South East Asian Studies',
    'Centre for Comparative Politics and Political Theory',
    'Centre for East Asian Studies',
    'Centre for Economic Studies and Planning',
    'Centre for English Studies',
    'Centre for European Studies',
    'Centre for French and Francophone Studies',
    'Centre for Historical Studies',
    'Centre for Indo-Pacific Studies',
    'Centre for Inner Asian Studies',
    'Centre for International Legal Studies',
    'Centre for International Politics, Organisation and Disarmament',
    'Centre for International Trade and Development',
    'Centre for Japanese Studies',
    'Centre for Korean Studies',
    'Centre for Linguistics',
    'Centre for Media Studies',
    'Centre for North-East Studies',
    'Centre for Philosophy',
    'Centre for Political Studies',
    'Centre for Russian and Central Asian Studies',
    'Centre for South Asian Studies',
    'Centre for Studies in Science Policy',
    'Centre for the Study of Discrimination and Exclusion',
    'Centre for the Study of Law and Governance',
    'Centre for the Study of Regional Development',
    'Centre for the Study of Social Systems',
    'Centre for West Asian Studies',
    'Centre for Women\'s Studies',
    'Centre of Arabic and African studies',
    'Centre of German Studies',
    'Centre of Indian Languages',
    'Centre of Persian and Central Asian Studies',
    'Centre of Russian Studies',
    'Centre of Social Medicine and Community Health',
    'Centre of Spanish, Portuguese, Italian & Latin American',
    'Chattarpati Shivaji Maharaj Centre for Security and Strategic Studies',
    'School of Computational and Integrative Sciences',
    'School of Computer and Systems Sciences',
    'School of Engineering',
    'School of Environmental Sciences',
    'School of International Studies',
    'School of Language Literature and Culture Studies',
    'School of Life Sciences',
    'School of Physical Sciences',
    'School of Sanskrit and Indic Studies',
    'School of Social Sciences',
    'Special Centre for Molecular Medicine',
    'Special Centre for Nanoscience',
    'Special Centre for National Security Studies',
    'Special Centre for Tamil Studies',
    'Zakir Husain Centre for Educational Studies'
  ].sort();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
                Full Name
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
                JNU Email
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
                School/Centre
              </label>
              <select
                id="school"
                name="school"
                required
                className="input-field"
                value={formData.school}
                onChange={handleChange}
              >
                <option value="">Select your school/Centre</option>
                {jnuSchools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                id="course"
                name="course"
                type="text"
                required
                className="input-field"
                placeholder="e.g., B.Tech CSE, M.Sc Physics"
                value={formData.course}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="enrollmentYear" className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Year
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
                Password
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
                Confirm Password
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
  );
};

export default Signup;
