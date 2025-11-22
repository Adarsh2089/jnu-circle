import { CheckCircle, X, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UploadSuccessModal = ({ onClose, onViewDashboard }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Success Icon */}
        <div className="text-center pt-8 pb-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Successful! 🎉
          </h2>
          <p className="text-gray-600">
            Thank you for contributing to JNU Study Circle
          </p>
        </div>

        {/* Review Info Card */}
        <div className="px-8 pb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start mb-3">
              <Clock className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Under Review
                </h3>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  Your resource is now pending admin verification. This helps maintain quality content for all students.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Admin will review your resource</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Once approved, you'll get <strong>full access</strong> to all resources</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Your content will be visible to other students</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>You'll become a <strong>contributor</strong> with unlimited access</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onViewDashboard}
              className="w-full btn-primary flex items-center justify-center"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <Link
              to="/upload"
              onClick={onClose}
              className="w-full btn-secondary flex items-center justify-center"
            >
              Upload Another Resource
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Review usually takes 24-48 hours. You'll be notified once approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadSuccessModal;
