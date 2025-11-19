import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Plus, Trash2, Save, X } from 'lucide-react';

/**
 * Admin component to manage courses in Firestore
 * This is an OPTIONAL component you can add to your admin panel
 * to allow admins to add/remove courses without touching code
 */
function AdminCourseManager() {
  const [selectedCollection, setSelectedCollection] = useState('school_courses');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [entities, setEntities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all entities from selected collection
  useEffect(() => {
    fetchEntities();
  }, [selectedCollection]);

  // Fetch courses when entity is selected
  useEffect(() => {
    if (selectedEntity) {
      fetchCourses();
    }
  }, [selectedEntity]);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, selectedCollection));
      const entityList = [];
      querySnapshot.forEach((doc) => {
        entityList.push({
          id: doc.id,
          name: doc.data().name || doc.id,
          courses: doc.data().courses || []
        });
      });
      setEntities(entityList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching entities:', error);
      alert('Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const entity = entities.find(e => e.id === selectedEntity);
    if (entity) {
      setCourses(entity.courses || []);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim() || !selectedEntity) return;

    setSaving(true);
    try {
      const docRef = doc(db, selectedCollection, selectedEntity);
      await updateDoc(docRef, {
        courses: arrayUnion(newCourse.trim()),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setCourses([...courses, newCourse.trim()]);
      setNewCourse('');
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCourse = async (courseToRemove) => {
    if (!window.confirm(`Are you sure you want to remove "${courseToRemove}"?`)) {
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, selectedCollection, selectedEntity);
      await updateDoc(docRef, {
        courses: arrayRemove(courseToRemove),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setCourses(courses.filter(c => c !== courseToRemove));
      alert('Course removed successfully!');
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Course Management
      </h2>

      {/* Collection Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Collection
        </label>
        <select
          value={selectedCollection}
          onChange={(e) => {
            setSelectedCollection(e.target.value);
            setSelectedEntity('');
            setCourses([]);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="school_courses">School Courses</option>
          <option value="centre_courses">Centre Courses</option>
        </select>
      </div>

      {/* Entity Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select {selectedCollection === 'school_courses' ? 'School' : 'Centre'}
        </label>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">-- Select an entity --</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.name} ({entity.courses.length} courses)
            </option>
          ))}
        </select>
      </div>

      {/* Add New Course */}
      {selectedEntity && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Course
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Enter course name (e.g., M.A. in Computer Science)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCourse();
                }
              }}
            />
            <button
              onClick={handleAddCourse}
              disabled={!newCourse.trim() || saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Course List */}
      {selectedEntity && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Current Courses ({courses.length})
          </h3>
          
          {courses.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No courses added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-800">{course}</span>
                  <button
                    onClick={() => handleRemoveCourse(course)}
                    disabled={saving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove course"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Changes are saved immediately to Firestore. 
          All users will see updated courses within 5 minutes (cache refresh).
          To force immediate refresh, users can reload the page.
        </p>
      </div>
    </div>
  );
}

export default AdminCourseManager;
