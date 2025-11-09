import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: November 9, 2025</p>
        </div>

        <div className="prose prose-indigo max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using JNU Circle ("the Platform"), you accept and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
            <p>
              JNU Circle is exclusively for students, faculty, and staff of Jawaharlal Nehru University (JNU). 
              You must have a valid JNU email address to register. By registering, you confirm that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are at least 18 years old</li>
              <li>You are affiliated with JNU</li>
              <li>All information provided is accurate and truthful</li>
              <li>You will maintain the security of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Registration</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account confidentiality</li>
              <li>One account per user; no shared accounts</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, engage in 
              fraudulent activities, or misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Access Tiers</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Free Access</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browse resources from your school/centre</li>
              <li>Limited preview of materials</li>
              <li>Access to public resources</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Contributor Access</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Earned by uploading 1+ approved resource</li>
              <li>Full access to resources in your school/centre</li>
              <li>Download and view complete materials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Premium Access</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Purchased subscription or earned through contributions</li>
              <li>Priority support</li>
              <li>Ad-free experience (when available)</li>
              <li>Access to premium features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Content Guidelines</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Permitted Content</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Previous year question papers (PYQs)</li>
              <li>Study notes and summaries</li>
              <li>Educational resources and materials</li>
              <li>Course-related documents</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Prohibited Content</h3>
            <p>You may not upload content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates copyright or intellectual property rights</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Is fraudulent, misleading, or deceptive</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Includes current exam papers or solutions (cheating materials)</li>
              <li>Contains personal information of others without consent</li>
              <li>Is sexually explicit, violent, or offensive</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Content</h3>
            <p>
              You retain ownership of content you upload. By uploading, you grant JNU Circle a non-exclusive, 
              worldwide, royalty-free license to host, store, and display your content for the purpose of 
              operating the platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Platform Content</h3>
            <p>
              All platform features, design, code, and branding are owned by JNU Circle and protected by 
              copyright and intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Copyright Infringement</h3>
            <p>
              If you believe content infringes your copyright, contact us at support@jnucircle.app with 
              details. We will investigate and remove infringing content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use automated tools (bots, scrapers) to access the platform</li>
              <li>Attempt to gain unauthorized access to systems or accounts</li>
              <li>Interfere with platform operation or security</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Share your account credentials</li>
              <li>Resell or redistribute platform content</li>
              <li>Use content for commercial purposes without permission</li>
              <li>Engage in spam, phishing, or fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. School/Centre-Based Access</h2>
            <p>
              Resources are restricted to users within the same school or centre. You may only:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload resources for your own school/centre</li>
              <li>Access resources from your affiliated school/centre</li>
              <li>Not share or redistribute content outside the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Content Moderation</h2>
            <p>
              All uploaded content is subject to admin review. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Approve or reject uploaded resources</li>
              <li>Remove content that violates these terms</li>
              <li>Request modifications before approval</li>
              <li>Take action against violating accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Advertising</h2>
            <p>
              JNU Circle uses Google AdSense to display advertisements. By using the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You consent to viewing advertisements</li>
              <li>You agree not to click ads fraudulently</li>
              <li>You understand ads are served by third parties</li>
              <li>Premium users may receive reduced ads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Disclaimer of Warranties</h2>
            <p>
              JNU Circle is provided "AS IS" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy or reliability of content</li>
              <li>Security against unauthorized access</li>
              <li>Fitness for a particular purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, JNU Circle shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of the platform, 
              including but not limited to loss of data, revenue, or academic performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless JNU Circle from any claims, damages, or expenses 
              arising from your violation of these terms or misuse of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Privacy</h2>
            <p>
              Your use of the platform is also governed by our Privacy Policy. Please review it to understand 
              how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. We will notify users of significant changes. 
              Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">16. Termination</h2>
            <p>
              We may terminate or suspend your access immediately, without prior notice, for conduct that 
              we believe violates these terms or is harmful to other users, us, or third parties, or for 
              any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">17. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of India. Any disputes shall be subject to the 
              exclusive jurisdiction of courts in New Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">18. Contact Information</h2>
            <p>For questions about these Terms of Service, contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Email:</strong> support@jnucircle.app</li>
              <li><strong>Website:</strong> jnucircle.app</li>
              <li><strong>Address:</strong> Jawaharlal Nehru University, New Delhi, India</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">19. Entire Agreement</h2>
            <p>
              These Terms of Service, along with our Privacy Policy, constitute the entire agreement between 
              you and JNU Circle regarding the use of the platform.
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
