// Migration script to upload school-course data to Firestore
// Run this once to populate the database
import { db } from '../config/firebase.js';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

// Hardcoded data to migrate
const schoolCoursesData = {
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

const centreCoursesData = {
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

const schoolToCentresData = {
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

/**
 * Migrate all course data to Firestore
 * Collection structure:
 * - school_courses/{schoolName} - contains courses array
 * - centre_courses/{centreName} - contains courses array
 * - school_to_centres/{schoolName} - contains centres array
 */
export async function migrateCourseDataToFirestore() {
  try {
    console.log('Starting migration to Firestore...');
    
    const batch = writeBatch(db);
    let operationCount = 0;

    // Migrate school courses
    console.log('Migrating school courses...');
    for (const [schoolName, courses] of Object.entries(schoolCoursesData)) {
      const docRef = doc(db, 'school_courses', schoolName);
      batch.set(docRef, {
        name: schoolName,
        courses: courses,
        type: 'school',
        updatedAt: new Date().toISOString()
      });
      operationCount++;
      
      // Firestore batch limit is 500 operations
      if (operationCount >= 400) {
        await batch.commit();
        console.log(`Committed ${operationCount} operations`);
        operationCount = 0;
      }
    }

    // Migrate centre courses
    console.log('Migrating centre courses...');
    for (const [centreName, courses] of Object.entries(centreCoursesData)) {
      const docRef = doc(db, 'centre_courses', centreName);
      batch.set(docRef, {
        name: centreName,
        courses: courses,
        type: 'centre',
        updatedAt: new Date().toISOString()
      });
      operationCount++;
      
      if (operationCount >= 400) {
        await batch.commit();
        console.log(`Committed ${operationCount} operations`);
        operationCount = 0;
      }
    }

    // Migrate school to centres mapping
    console.log('Migrating school to centres mapping...');
    for (const [schoolName, centres] of Object.entries(schoolToCentresData)) {
      const docRef = doc(db, 'school_to_centres', schoolName);
      batch.set(docRef, {
        name: schoolName,
        centres: centres,
        updatedAt: new Date().toISOString()
      });
      operationCount++;
      
      if (operationCount >= 400) {
        await batch.commit();
        console.log(`Committed ${operationCount} operations`);
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final ${operationCount} operations`);
    }

    console.log('✅ Migration completed successfully!');
    console.log(`Total schools: ${Object.keys(schoolCoursesData).length}`);
    console.log(`Total centres: ${Object.keys(centreCoursesData).length}`);
    console.log(`Total school-centre mappings: ${Object.keys(schoolToCentresData).length}`);
    
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Uncomment and run this in your app once to migrate data
// migrateCourseDataToFirestore();
