import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: November 9, 2025</p>
        </div>

        <div className="prose prose-indigo max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to JNU Study Circle ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you visit our website jnucircle.app and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
            <p>We collect the following personal information when you register:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name</li>
              <li>Email address (JNU email)</li>
              <li>School/Centre affiliation</li>
              <li>Course and enrollment year</li>
              <li>Profile picture (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resources viewed and downloaded</li>
              <li>Upload history and contributions</li>
              <li>View counts and engagement metrics</li>
              <li>Login history and session data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Technical Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Authenticate users and verify JNU affiliation</li>
              <li>Enable resource sharing within your school/centre</li>
              <li>Track contributions and award premium access</li>
              <li>Send notifications about resources and platform updates</li>
              <li>Improve user experience and platform functionality</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Firebase (authentication and database), Cloudinary (file storage)</li>
              <li><strong>Other Users:</strong> Your name and school/centre are visible on uploaded resources</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. We use Google AdSense 
              for advertising, which may use cookies to serve personalized ads. You can control cookie preferences 
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Firebase:</strong> Authentication, database, and hosting</li>
              <li><strong>Cloudinary:</strong> File storage and CDN</li>
              <li><strong>Google AdSense:</strong> Advertisement serving</li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure. We use Firebase Authentication 
              with email verification and secure HTTPS connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide 
              services. You can request account deletion by contacting us. Upon deletion, your personal data will 
              be removed, but uploaded resources may remain anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at support@jnucircle.app
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p>
              JNU Study Circle is intended for university students (18+ years). We do not knowingly collect information 
              from children under 18. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and stored on servers located outside your country. 
              We use Firebase and Cloudinary, which may store data in various locations globally. 
              We ensure appropriate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Email:</strong> support@jnucircle.app</li>
              <li><strong>Website:</strong> jnucircle.app</li>
              <li><strong>Address:</strong> Jawaharlal Nehru University, New Delhi, India</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Consent</h2>
            <p>
              By using JNU Study Circle, you consent to this Privacy Policy and agree to its terms. If you do not agree 
              with this policy, please do not use our services.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
