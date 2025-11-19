// jnu-school-centre-course-updated.js
// Updated: Data now fetched from Firestore collections
// Collections: school_courses, centre_courses, school_to_centres

import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Cache for Firestore data
let schoolCoursesCache = null;
let centreCoursesCache = null;
let schoolToCentresCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ---------- School-level course list (fetched from Firestore) ----------
export const schoolCourses = {
  "School of Language Literature and Culture Studies": [
    "B.A. (Hons.) in Arabic",
    "B.A. (Hons.) in Chinese",
    "B.A. (Hons.) in French",
    "B.A. (Hons.) in German",
    "B.A. (Hons.) in Japanese",
    "B.A. (Hons.) in Korean",
    "B.A. (Hons.) in Persian",
    "B.A. (Hons.) in Russian",
    "B.A. (Hons.) in Spanish",
    "M.A. in Arabic",
    "M.A. in Chinese",
    "M.A. in English",
    "M.A. in French",
    "M.A. in German",
    "M.A. in Hindi",
    "M.A. in Japanese",
    "M.A. in Korean",
    "M.A. in Linguistics",
    "M.A. in Persian",
    "M.A. in Russian",
    "M.A. in Spanish",
    "M.A. in Urdu",
    "Phd",
    "Certificate in Foreign Languages",
    "Diploma in Foreign Languages",
    "Advanced Diploma in Foreign Languages"
  ],
  "School of Computational and Integrative Sciences": [
    "M.Sc. in Computational and Integrative Sciences",
    "Phd"
  ],
  "School of Computer and Systems Sciences": [
    "M.C.A. (Master of Computer Applications)",
    "M.Tech. in Computer Science & Technology",
    "M.Tech. in Data Science",
    "Phd"
  ],
  "School of Environmental Sciences": [
    "M.Sc. in Environmental Sciences",
    "Phd in Environmental Sciences"
  ],
  "School of International Studies": [
    "M.A. in Politics (International Studies)",
    "M.A. in Economics (World Economy)",
    "Phd"
  ],
  "School of Life Sciences": [
    "M.Sc. in Life Sciences",
    "Phd"
  ],
  "School of Physical Sciences": [
    "M.Sc. in Physics",
    "M.Sc. in Chemistry",
    "M.Sc. in Mathematics",
    "Phd"
  ],
  "School of Social Sciences": [],
  "School of Engineering": [
    "B.Tech. in Electronics and Communication Engineering (ECE)",
    "B.Tech. in Computer Science and Engineering (CSE)",
    "M.Tech. in Engineering",
    "Phd"
  ],
  "School of Sanskrit and Indic Studies": [
    "M.A. in Sanskrit",
    "Phd"
  ]
};

// ---------- Centre → course mapping (these feed the centre route of the UI) ----------
export const centreCourses = {
  "Centre for African Studies": ["Phd in African Studies"],
  "Centre for Canadian, US and Latin American Studies": ["Phd in American Studies"],
  "Centre for Chinese and South East Asian Studies": ["Phd in Chinese & South East Asian Studies"],
  "Centre for Comparative Politics and Political Theory": ["Phd in Comparative Politics"],
  "Centre for East Asian Studies": ["Phd in East Asian Studies"],
  "Centre for English Studies": ["M.A. in English", "Phd in English"],
  "Centre for European Studies": ["Phd in European Studies"],
  "Centre for French and Francophone Studies": ["M.A. in French", "Phd in French"],
  "Centre for Historical Studies": ["M.A. in History", "Phd in History"],
  "Centre for Indo-Pacific Studies": ["Phd in Indo-Pacific Studies"],
  "Centre for Inner Asian Studies": ["Phd in Inner Asian Studies"],
  "Centre for International Politics, Organisation and Disarmament": ["Phd in International Politics"],
  "Centre for Japanese Studies": ["M.A. in Japanese Studies", "Phd in Japanese Studies"],
  "Centre for Korean Studies": ["M.A. in Korean Studies", "Phd in Korean Studies"],
  "Centre for Linguistics": ["M.A. in Linguistics", "Phd in Linguistics"],
  "Centre for Media Studies": ["Phd in Media Studies"],
  "Centre for North-East Studies": ["Phd in North-East Studies"],
  "Centre for Philosophy": ["M.A. in Philosophy", "Phd in Philosophy"],
  "Centre for Russian and Central Asian Studies": ["Phd in Russian & Central Asian Studies"],
  "Centre for South Asian Studies": ["Phd in South Asian Studies"],
  "Centre for Studies in Science Policy": ["Phd in Science Policy"],
  "Centre for the Study of Discrimination and Exclusion": ["Phd in Social Exclusion"],
  "Centre for the Study of Regional Development": ["M.A. in Geography", "Phd in Geography"],
  "Centre for the Study of Social Systems": ["M.A. in Sociology", "Phd in Sociology"],
  "Centre for West Asian Studies": ["Phd in West Asian Studies"],
  "Centre for Women's Studies": ["M.A. in Women's Studies", "Phd in Women's Studies"],
  "Centre of Arabic and African studies": ["M.A. in Arabic", "Phd in Arabic"],
  "Centre of German Studies": ["M.A. in German", "Phd in German"],
  "Centre of Indian Languages": ["M.A. in Indian Languages", "Phd in Indian Languages"],
  "Centre of Persian and Central Asian Studies": ["M.A. in Persian", "Phd in Persian"],
  "Centre of Russian Studies": ["M.A. in Russian", "Phd in Russian"],
  "Centre of Social Medicine and Community Health": ["MPH", "Phd in Public Health"],
  "Centre of Spanish, Portuguese, Italian & Latin American": ["M.A. in Spanish/Portuguese/Italian", "Phd in Spanish/Portuguese/Italian"],
  "Chattarpati Shivaji Maharaj Centre for Security and Strategic Studies": ["Phd in Security Studies"],
  "Special Centre for National Security Studies": ["Phd in National Security"],
  "Special Centre for Tamil Studies": ["M.A. in Tamil", "Phd in Tamil"],
  "Zakir Husain Centre for Educational Studies": ["M.A. in Education", "Phd in Education"],
  "Centre for Economic Studies and Planning": [
    "M.A. in Economics",
    "Phd in Economic Studies and Planning"
  ],
  "Centre for Political Studies": ["M.A. in Political Science", "Phd in Political Science"],
  "Centre for International Legal Studies": ["Phd in International Legal Studies"],
  "Centre for International Trade and Development": ["Phd in International Trade and Development"]
};

// ---------- School -> Centres mapping (used when school selected to populate centre field) ----------
export const schoolToCentres = {
  "School of Social Sciences": [
    "Centre for Economic Studies and Planning",
    "Centre for Historical Studies",
    "Centre for Informal Sector & Labour Studies",
    "Centre for Media Studies",
    "Centre for Philosophy",
    "Centre for Political Studies",
    "Centre of Social Medicine and Community Health",
    "Centre for Studies in Science Policy",
    "Centre for the Study of Regional Development",
    "Centre for the Study of Social Systems",
    "Centre for Women's Studies",
    "Zakir Husain Centre for Educational Studies",
    "Centre for South Asian Studies",
    "Centre for West Asian Studies",
    "Centre for Russian and Central Asian Studies",
    "Centre for Comparative Politics and Political Theory",
    "Centre for Indo-Pacific Studies",
    "Centre for North-East Studies"
  ],
  "School of Language Literature and Culture Studies": [
    "Centre for English Studies",
    "Centre for French and Francophone Studies",
    "Centre of German Studies",
    "Centre for Japanese Studies",
    "Centre for Korean Studies",
    "Centre for Linguistics",
    "Centre of Persian and Central Asian Studies",
    "Centre of Russian Studies",
    "Centre of Spanish, Portuguese, Italian & Latin American",
    "Centre of Indian Languages",
    "Centre of Arabic and African studies"
  ],
  "School of International Studies": [
    "Centre for Chinese and South East Asian Studies",
    "Centre for Japanese Studies",
    "Centre for Korean Studies",
    "Centre for European Studies",
    "Centre for Indo-Pacific Studies",
    "Centre for International Politics, Organisation and Disarmament",
    "Centre for Russian and Central Asian Studies",
    "Centre for South Asian Studies",
    "Centre for West Asian Studies",
    "Centre for Canadian, US and Latin American Studies"
  ],
  "School of Physical Sciences": [],
  "School of Life Sciences": [],
  "School of Computer and Systems Sciences": [],
  "School of Engineering": [],
  "School of Environmental Sciences": []
};

// ---------- Firestore Data Fetching Functions ----------

/**
 * Fetch all school courses from Firestore
 */
export async function fetchSchoolCourses() {
  try {
    const querySnapshot = await getDocs(collection(db, 'school_courses'));
    const data = {};
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data().courses || [];
    });
    return data;
  } catch (error) {
    console.error('Error fetching school courses:', error);
    return {};
  }
}

/**
 * Fetch all centre courses from Firestore
 */
export async function fetchCentreCourses() {
  try {
    const querySnapshot = await getDocs(collection(db, 'centre_courses'));
    const data = {};
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data().courses || [];
    });
    return data;
  } catch (error) {
    console.error('Error fetching centre courses:', error);
    return {};
  }
}

/**
 * Fetch school to centres mapping from Firestore
 */
export async function fetchSchoolToCentres() {
  try {
    const querySnapshot = await getDocs(collection(db, 'school_to_centres'));
    const data = {};
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data().centres || [];
    });
    return data;
  } catch (error) {
    console.error('Error fetching school to centres:', error);
    return {};
  }
}

/**
 * Initialize/refresh all course data from Firestore
 * Uses caching to avoid excessive reads
 */
export async function initializeCourseData(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached data if available and fresh
  if (!forceRefresh && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return {
      schoolCourses: schoolCoursesCache,
      centreCourses: centreCoursesCache,
      schoolToCentres: schoolToCentresCache
    };
  }

  try {
    // Fetch all data in parallel
    const [schools, centres, mappings] = await Promise.all([
      fetchSchoolCourses(),
      fetchCentreCourses(),
      fetchSchoolToCentres()
    ]);

    // Update cache
    schoolCoursesCache = schools;
    centreCoursesCache = centres;
    schoolToCentresCache = mappings;
    cacheTimestamp = now;

    console.log('🔥 Firebase data loaded:', {
      schools: Object.keys(schools).length,
      centres: Object.keys(centres).length,
      mappings: Object.keys(mappings).length
    });

    return {
      schoolCourses: schools,
      centreCourses: centres,
      schoolToCentres: mappings
    };
  } catch (error) {
    console.error('Error initializing course data:', error);
    // Return empty data if fetch fails
    return {
      schoolCourses: {},
      centreCourses: {},
      schoolToCentres: {}
    };
  }
}

/**
 * Get cached course data or fetch if not available
 */
function getCachedData() {
  return {
    schoolCourses: schoolCoursesCache || {},
    centreCourses: centreCoursesCache || {},
    schoolToCentres: schoolToCentresCache || {}
  };
}

// ---------- Utilities for UI ----------

export async function getAllSelectableEntities() {
  await initializeCourseData();
  const { schoolCourses, centreCourses, schoolToCentres } = getCachedData();
  
  const schools = Object.keys(schoolCourses).map((s) => ({
    id: `school::${s}`,
    name: s,
    type: "school",
    parentSchool: null
  }));

  const centres = Object.keys(centreCourses).map((c) => {
    const parent = Object.keys(schoolToCentres).find((sch) =>
      (schoolToCentres[sch] || []).includes(c)
    );
    return {
      id: `centre::${c}`,
      name: c,
      type: "centre",
      parentSchool: parent || null
    };
  });

  Object.keys(schoolToCentres).forEach((sch) => {
    (schoolToCentres[sch] || []).forEach((c) => {
      if (!centres.find((x) => x.name === c)) {
        centres.push({
          id: `centre::${c}`,
          name: c,
          type: "centre",
          parentSchool: sch
        });
      }
    });
  });

  const merged = [...schools, ...centres];
  merged.sort((a, b) => a.name.localeCompare(b.name));
  return merged;
}

export async function isSchoolHavingCentres(schoolName) {
  await initializeCourseData();
  const { schoolToCentres } = getCachedData();
  const centres = schoolToCentres[schoolName];
  return Array.isArray(centres) && centres.length > 0;
}

export async function getCentresForSchool(schoolName) {
  await initializeCourseData();
  const { schoolToCentres } = getCachedData();
  return schoolToCentres[schoolName] ? [...schoolToCentres[schoolName]] : [];
}

export async function getCoursesForEntity(name) {
  if (!name || typeof name !== "string") return [];
  await initializeCourseData();
  const { schoolCourses, centreCourses } = getCachedData();
  if (centreCourses[name]) return [...centreCourses[name]];
  if (schoolCourses[name]) return [...schoolCourses[name]];
  return [];
}

export const entityTypeFromId = (id) => {
  if (!id || typeof id !== "string") return null;
  const [type] = id.split("::");
  return type;
};

export const nameFromId = (id) => {
  if (!id || typeof id !== "string") return null;
  return id.split("::").slice(1).join("::");
};

// ---------- Backward compatibility helpers ----------

export const jnuSchoolsWithCourses = {
  "School of Language Literature and Culture Studies": [
    "B.A. (Hons.) in Arabic",
    "B.A. (Hons.) in Chinese",
    "B.A. (Hons.) in French",
    "B.A. (Hons.) in German",
    "B.A. (Hons.) in Japanese",
    "B.A. (Hons.) in Korean",
    "B.A. (Hons.) in Persian",
    "B.A. (Hons.) in Russian",
    "B.A. (Hons.) in Spanish",
    "M.A. in Arabic",
    "M.A. in Chinese",
    "M.A. in English",
    "M.A. in French",
    "M.A. in German",
    "M.A. in Hindi",
    "M.A. in Japanese",
    "M.A. in Korean",
    "M.A. in Linguistics",
    "M.A. in Persian",
    "M.A. in Russian",
    "M.A. in Spanish",
    "M.A. in Urdu",
    "M.A. in Languages & Literature",
    "Phd in Languages & Literature",
    "Certificate in Foreign Languages",
    "Diploma in Foreign Languages",
    "Advanced Diploma in Foreign Languages"
  ],
  "School of Computational and Integrative Sciences": [
    "M.Sc. in Computational and Integrative Sciences",
    "Phd in Computational and Integrative Sciences"
  ],
  "School of Computer and Systems Sciences": [
    "M.C.A. (Master of Computer Applications)",
    "M.Tech. in Computer Science & Technology",
    "M.Tech. in Data Science",
    "Phd"
  ],
  "School of Environmental Sciences": [
    "M.Sc. in Environmental Sciences",
    "Phd"
  ],
  "School of International Studies": [
    "M.A. in Politics (International Studies)",
    "M.A. in Economics (World Economy)",
    "Phd in International Studies"
  ],
  "School of Life Sciences": [
    "M.Sc. in Life Sciences",
    "Phd in Life Sciences"
  ],
  "School of Physical Sciences": [
    "M.Sc. in Physics",
    "M.Sc. in Chemistry",
    "M.Sc. in Mathematics",
    "Phd"
  ],
  "School of Social Sciences": [
    "M.A. in Economics",
    "M.A. in Geography",
    "M.A. in History",
    "M.A. in Philosophy",
    "M.A. in Political Science",
    "M.A. in Sociology",
    "M.A. in Development and Labour Studies",
    "Master of Public Health (MPH)",
    "Phd in Economic Studies and Planning",
    "Phd in Political Studies",
    "Phd in Historical Studies",
    "Phd in Regional Development",
    "Phd in Social Systems",
    "Phd in Educational Studies",
    "Phd in Women's Studies",
    "Phd in Social Sciences"
  ],
  "School of Engineering": [
    "B.Tech. in Electronics and Communication Engineering (ECE)",
    "B.Tech. in Computer Science and Engineering (CSE)",
    "M.Tech. in Engineering",
    "Phd in Engineering"
  ],
  "Special Centre for Molecular Medicine": [
    "M.Sc. in Molecular Medicine",
    "Phd in Molecular Medicine"
  ],
  "Special Centre for Nanoscience": [
    "M.Sc. in Nanoscience",
    "Phd in Nanoscience"
  ],
  "School of Sanskrit and Indic Studies": [
    "M.A. in Sanskrit",
    "Phd in Sanskrit Studies"
  ],
  "Centre for the Study of Law and Governance": [
    "Phd in Law and Governance"
  ],
  "Centre for Economic Studies and Planning": [
    "M.A. in Economics",
    "Phd in Economic Studies and Planning"
  ],
  "Centre for International Legal Studies": [
    "Phd in International Legal Studies"
  ],
  "Centre for International Trade and Development": [
    "Phd in International Trade and Development"
  ],
  "Centre for Political Studies": [
    "M.A. in Political Science",
    "Phd in Political Studies"
  ],
  // Default courses for centres not listed above
  "Centre for African Studies": ["Phd in African Studies"],
  "Centre for Canadian, US and Latin American Studies": ["Phd in American Studies"],
  "Centre for Chinese and South East Asian Studies": ["Phd in Chinese & South East Asian Studies"],
  "Centre for Comparative Politics and Political Theory": ["Phd in Comparative Politics"],
  "Centre for East Asian Studies": ["Phd in East Asian Studies"],
  "Centre for English Studies": ["M.A. in English", "Phd in English"],
  "Centre for European Studies": ["Phd in European Studies"],
  "Centre for French and Francophone Studies": ["M.A. in French", "Phd in French"],
  "Centre for Historical Studies": ["M.A. in History", "Phd in History"],
  "Centre for Indo-Pacific Studies": ["Phd in Indo-Pacific Studies"],
  "Centre for Inner Asian Studies": ["Phd in Inner Asian Studies"],
  "Centre for International Politics, Organisation and Disarmament": ["Phd in International Politics"],
  "Centre for Japanese Studies": ["M.A. in Japanese Studies", "Phd in Japanese Studies"],
  "Centre for Korean Studies": ["M.A. in Korean Studies", "Phd in Korean Studies"],
  "Centre for Linguistics": ["M.A. in Linguistics", "Phd in Linguistics"],
  "Centre for Media Studies": ["Phd in Media Studies"],
  "Centre for North-East Studies": ["Phd in North-East Studies"],
  "Centre for Philosophy": ["M.A. in Philosophy", "Phd in Philosophy"],
  "Centre for Russian and Central Asian Studies": ["Phd in Russian & Central Asian Studies"],
  "Centre for South Asian Studies": ["Phd in South Asian Studies"],
  "Centre for Studies in Science Policy": ["Phd in Science Policy"],
  "Centre for the Study of Discrimination and Exclusion": ["Phd in Social Exclusion"],
  "Centre for the Study of Regional Development": ["M.A. in Geography", "Phd in Geography"],
  "Centre for the Study of Social Systems": ["M.A. in Sociology", "Phd in Sociology"],
  "Centre for West Asian Studies": ["Phd in West Asian Studies"],
  "Centre for Women's Studies": ["Phd in Women's Studies"],
  "Centre of Arabic and African studies": ["M.A. in Arabic", "Phd in Arabic"],
  "Centre of German Studies": ["M.A. in German", "Phd in German"],
  "Centre of Indian Languages": ["M.A. in Indian Languages", "Phd in Indian Languages"],
  "Centre of Persian and Central Asian Studies": ["M.A. in Persian", "Phd in Persian"],
  "Centre of Russian Studies": ["M.A. in Russian", "Phd in Russian"],
  "Centre of Social Medicine and Community Health": ["MPH", "Phd in Public Health"],
  "Centre of Spanish, Portuguese, Italian & Latin American": ["M.A. in Spanish/Portuguese/Italian", "Phd in Spanish/Portuguese/Italian"],
  "Chattarpati Shivaji Maharaj Centre for Security and Strategic Studies": ["Phd in Security Studies"],
  "Special Centre for National Security Studies": ["Phd in National Security"],
  "Special Centre for Tamil Studies": ["M.A. in Tamil", "Phd in Tamil"],
  "Zakir Husain Centre for Educational Studies": ["M.A. in Education", "Phd in Education"]
};

// ---------- Legacy function exports for backward compatibility ----------

export const getCoursesForSchool = async (name) => {
  if (!name) return [];
  await initializeCourseData();
  const { schoolCourses, centreCourses } = getCachedData();
  if (centreCourses[name]) return centreCourses[name];
  if (schoolCourses[name]) return schoolCourses[name];
  if (jnuSchoolsWithCourses[name]) return jnuSchoolsWithCourses[name];
  return [];
};

export const getAllSchools = async () => {
  await initializeCourseData();
  const { schoolCourses } = getCachedData();
  const schools = Object.keys(schoolCourses).sort();
  console.log('📚 Schools loaded from Firebase:', schools.length > 0 ? `${schools.length} schools` : 'No schools found');
  return schools;
};

/*
----------------- Usage Examples -----------------
*/
