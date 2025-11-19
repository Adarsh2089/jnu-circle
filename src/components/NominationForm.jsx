import { useState, useEffect } from 'react';
import { X, UserPlus, Building2, GraduationCap } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getAllSchools, getCentresForSchool } from '../data/schoolCourseMapping';

const NominationForm = ({ onClose }) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    nominationType: '', // 'school' or 'centre'
    school: '',
    centre: '',
    reason: '',
    experience: '',
    commitment: '',
    // For non-logged-in users
    name: '',
    email: '',
    password: ''
  });
  const [schools, setSchools] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load schools from database
    const loadSchools = async () => {
      const schoolsList = await getAllSchools();
      setSchools(schoolsList);
    };
    loadSchools();
  }, []);

  const loadCentres = async (school) => {
    if (!school) return;
    const centresList = await getCentresForSchool(school);
    setCentres(centresList);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'school') {
      await loadCentres(value);
      setFormData(prev => ({ ...prev, centre: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!user) {
        // Non-logged-in user validations
        if (!formData.name || formData.name.trim().length < 2) {
          throw new Error('Please enter your full name');
        }
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }
      
      if (!formData.nominationType) {
        throw new Error('Please select a nomination type');
      }
      if (!formData.school) {
        throw new Error('Please select a school');
      }
      if (formData.nominationType === 'centre' && !formData.centre) {
        throw new Error('Please select a centre');
      }
      if (!formData.reason || formData.reason.length < 50) {
        throw new Error('Please provide a detailed reason (at least 50 characters)');
      }

      // Submit nomination
      await addDoc(collection(db, 'admin_nominations'), {
        userId: user?.uid || 'pending_account',
        userEmail: user?.email || formData.email,
        userName: user ? (userProfile?.name || 'Unknown') : formData.name,
        userSchool: user ? (userProfile?.school || '') : formData.school,
        userCentre: user ? (userProfile?.centre || '') : (formData.centre || ''),
        nominationType: formData.nominationType,
        targetSchool: formData.school,
        targetCentre: formData.centre || null,
        reason: formData.reason,
        experience: formData.experience,
        commitment: formData.commitment,
        status: 'pending',
        accountCreated: !!user,
        pendingPassword: user ? null : formData.password,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: ''
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting nomination:', err);
      setError(err.message || 'Failed to submit nomination');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Nomination Submitted!
          </h3>
          <p className="text-gray-600">
            Your nomination has been submitted successfully. The admin team will review it shortly.
          </p>
          {!user && (
            <p className="text-sm text-blue-600 mt-3">
              Check your email for account verification link.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-auto max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Become a Representative</h2>
            <p className="text-sm text-blue-100 mt-1">
              Nominate yourself as a School or Centre Admin
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Account Creation Fields (if not logged in) */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-blue-900">Create Your Account</h3>
              <p className="text-sm text-blue-700">You'll need an account to submit a nomination</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@mail.jnu.ac.in"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Nomination Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomination Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, nominationType: 'school' }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.nominationType === 'school'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className={`h-6 w-6 mb-2 ${
                  formData.nominationType === 'school' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-medium text-gray-900">School Admin</div>
                <div className="text-xs text-gray-600 mt-1">
                  Manage entire school resources
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, nominationType: 'centre' }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.nominationType === 'centre'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GraduationCap className={`h-6 w-6 mb-2 ${
                  formData.nominationType === 'centre' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-medium text-gray-900">Centre Admin</div>
                <div className="text-xs text-gray-600 mt-1">
                  Manage specific centre resources
                </div>
              </button>
            </div>
          </div>

          {/* School Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School *
            </label>
            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select School</option>
              {schools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>

          {/* Centre Selection (if centre admin) */}
          {formData.nominationType === 'centre' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre *
              </label>
              <select
                name="centre"
                value={formData.centre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Centre</option>
                {centres.map(centre => (
                  <option key={centre} value={centre}>{centre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to become a representative? *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Explain your motivation and how you can contribute (minimum 50 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length}/50 characters minimum
            </p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relevant Experience (Optional)
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={3}
              placeholder="Any previous leadership or management experience"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Commitment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Commitment (Optional)
            </label>
            <textarea
              name="commitment"
              value={formData.commitment}
              onChange={handleChange}
              rows={2}
              placeholder="How much time can you dedicate to this role?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Nomination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NominationForm;
