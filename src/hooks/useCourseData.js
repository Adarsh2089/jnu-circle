import { useEffect, useState } from 'react';
import { 
  initializeCourseData,
  getAllSchools, 
  getCentresForSchool, 
  getCoursesForEntity,
  isSchoolHavingCentres 
} from '../data/schoolCourseMapping';

/**
 * Custom hook to manage course data fetching and caching
 * Usage:
 * const { schools, loading, error } = useCourseData();
 */
export function useCourseData() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await initializeCourseData(); // Initialize cache
        const allSchools = await getAllSchools();
        setSchools(allSchools);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { schools, loading, error };
}

/**
 * Custom hook to get centres for a specific school
 * Usage:
 * const { centres, hasCentres, loading } = useSchoolCentres(schoolName);
 */
export function useSchoolCentres(schoolName) {
  const [centres, setCentres] = useState([]);
  const [hasCentres, setHasCentres] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCentres = async () => {
      if (!schoolName) {
        setCentres([]);
        setHasCentres(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hasC = await isSchoolHavingCentres(schoolName);
        setHasCentres(hasC);
        
        if (hasC) {
          const c = await getCentresForSchool(schoolName);
          setCentres(c);
        } else {
          setCentres([]);
        }
      } catch (err) {
        console.error('Error fetching centres:', err);
        setCentres([]);
        setHasCentres(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCentres();
  }, [schoolName]);

  return { centres, hasCentres, loading };
}

/**
 * Custom hook to get courses for a specific entity (school or centre)
 * Usage:
 * const { courses, loading } = useEntityCourses(entityName);
 */
export function useEntityCourses(entityName) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!entityName) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const c = await getCoursesForEntity(entityName);
        setCourses(c);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [entityName]);

  return { courses, loading };
}
