import React, { useState } from 'react';
import { migrateCourseDataToFirestore } from '../utils/migrateCourseDataToFirestore';

/**
 * Component to trigger one-time migration of course data to Firestore
 * This should only be used once by an admin to populate the database
 */
function MigrateCourseData() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const handleMigration = async () => {
    if (migrated) {
      alert('Data has already been migrated in this session!');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to migrate course data to Firestore? ' +
      'This will overwrite any existing data in the collections: ' +
      'school_courses, centre_courses, and school_to_centres.'
    );

    if (!confirmed) return;

    setLoading(true);
    setStatus('Starting migration...');

    try {
      const result = await migrateCourseDataToFirestore();
      setStatus('✅ Migration completed successfully!');
      setMigrated(true);
      console.log('Migration result:', result);
    } catch (error) {
      setStatus('❌ Migration failed: ' + error.message);
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Course Data Migration Tool
      </h2>
      
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> This tool should only be run once by an administrator 
          to populate the Firestore database with course data. Running it multiple times 
          will overwrite existing data.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">What this migration does:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li>Creates <code className="bg-gray-100 px-1 rounded">school_courses</code> collection with all school courses</li>
          <li>Creates <code className="bg-gray-100 px-1 rounded">centre_courses</code> collection with all centre courses</li>
          <li>Creates <code className="bg-gray-100 px-1 rounded">school_to_centres</code> collection with school-centre mappings</li>
          <li>Preserves all existing course data structure</li>
        </ul>
      </div>

      <button
        onClick={handleMigration}
        disabled={loading || migrated}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          loading || migrated
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Migrating...' : migrated ? 'Migration Completed' : 'Start Migration'}
      </button>

      {status && (
        <div className={`mt-4 p-4 rounded-lg ${
          status.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : status.includes('❌')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <p className="font-medium">{status}</p>
        </div>
      )}

      {migrated && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400">
          <p className="text-sm text-green-800">
            <strong>Next steps:</strong>
            <br />
            1. Verify the data in your Firebase Console
            <br />
            2. Remove this component from your app
            <br />
            3. All course-related functions will now fetch from Firestore
          </p>
        </div>
      )}
    </div>
  );
}

export default MigrateCourseData;
