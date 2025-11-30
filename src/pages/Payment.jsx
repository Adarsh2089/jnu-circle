import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QrCode, Upload as UploadIcon, CheckCircle, AlertCircle } from 'lucide-react';
import QRImage from '../assets/QR.png';

const Payment = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!txnId.trim()) {
      setError('Please enter transaction ID');
      return;
    }

    if (txnId.trim().length < 6) {
      setError('Transaction ID must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Create purchase record
      await addDoc(collection(db, 'user_purchase'), {
        user_id: user.uid,
        txn_id: txnId.trim(),
        price: 1,
        purchase_date: serverTimestamp(),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: 'pending', // pending, approved, rejected
        userEmail: user.email,
        userName: userProfile?.fullName || 'Unknown',
        userSchool: userProfile?.school || 'Unknown'
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError('Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your payment is under review. You'll be notified once it's verified.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Get Premium Access 
          </h1>
          <p className="text-gray-600">
            Scan QR code and complete payment to unlock all features
          </p>
           <p className="text-gray-600">
            Note - All the Contribution Amount is for Site Maintenance Purpose only No Any individual is involve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <QrCode className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Scan to Pay</h2>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <img 
                src={QRImage} 
                alt="Payment QR Code" 
                className="w-full max-w-xs mx-auto rounded-lg shadow-md"
              />
            </div>

            <div className="space-y-3 bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Amount:</span>
                <span className="text-2xl font-bold text-blue-600">₹1</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Validity:</span>
                <span className="text-gray-900 font-medium">1 Year</span>
              </div>
              <div className="border-t border-blue-200 pt-3 mt-3">
                <p className="text-xs text-gray-600">
                  Scan QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <UploadIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Submit Payment Details</h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID / UTR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="Enter 12-digit transaction ID"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can find this in your UPI app's transaction history
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Important:</h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Complete the payment before submitting</li>
                  <li>• Enter correct transaction ID</li>
                  <li>• Verification takes 1-2 hours</li>
                  <li>• You'll receive email notification</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Payment Details'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Having issues? <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">Contact Support</a>
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You'll Get with Premium
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Full Access</h4>
              <p className="text-sm text-gray-600">View all study materials and resources</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
              <p className="text-sm text-gray-600">Get help faster from our team</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1 Year Validity</h4>
              <p className="text-sm text-gray-600">No recurring payments needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
