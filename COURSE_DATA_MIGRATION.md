# Course Data Migration to Firebase

This document explains how the course data has been migrated from hardcoded JavaScript objects to Firebase Firestore.

## Overview

Previously, all school-centre-course data was hardcoded in `schoolCourseMapping.js`. Now, this data is stored in Firebase Firestore collections and fetched dynamically.

## Firestore Collections

### 1. `school_courses`
Stores courses for each school that has standalone courses (schools without centres).

**Document Structure:**
```javascript
{
  name: "School of Computer and Systems Sciences",
  courses: [
    "M.C.A. (Master of Computer Applications)",
    "M.Tech. in Computer Science & Technology",
    "M.Tech. in Data Science",
    "Phd"
  ],
  type: "school",
  updatedAt: "2024-11-18T10:30:00.000Z"
}
```

### 2. `centre_courses`
Stores courses for each centre.

**Document Structure:**
```javascript
{
  name: "Centre for English Studies",
  courses: [
    "M.A. in English",
    "Phd in English"
  ],
  type: "centre",
  updatedAt: "2024-11-18T10:30:00.000Z"
}
```

### 3. `school_to_centres`
Maps schools to their centres.

**Document Structure:**
```javascript
{
  name: "School of Social Sciences",
  centres: [
    "Centre for Economic Studies and Planning",
    "Centre for Historical Studies",
    // ... more centres
  ],
  updatedAt: "2024-11-18T10:30:00.000Z"
}
```

## Migration Steps

### Step 1: Run the Migration (ONE TIME ONLY)

You have two options to migrate the data:

#### Option A: Using the Migration Component (Recommended)
1. Temporarily add the `MigrateCourseData` component to your admin panel or any route
2. Import it in your desired file:
   ```javascript
   import MigrateCourseData from '../components/MigrateCourseData';
   ```
3. Add it to your JSX:
   ```jsx
   <MigrateCourseData />
   ```
4. Visit the page and click "Start Migration"
5. Wait for completion (should take a few seconds)
6. Remove the component from your app

#### Option B: Using the Console
1. Open your browser console on your app
2. Import and run the migration function:
   ```javascript
   import { migrateCourseDataToFirestore } from './utils/migrateCourseDataToFirestore';
   await migrateCourseDataToFirestore();
   ```

### Step 2: Verify Data in Firebase Console

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Check that these collections exist and have data:
   - `school_courses` (10 documents)
   - `centre_courses` (42 documents)
   - `school_to_centres` (10 documents)

### Step 3: Test the Application

All the following features should work automatically:
- ✅ School dropdowns populate correctly
- ✅ Centre dropdowns show when school has centres
- ✅ Course dropdowns show correct courses based on selection
- ✅ Signup, Profile, Upload, and Resources pages work correctly
- ✅ Admin panel filters work

## Updated Code

### Changed Files

1. **src/data/schoolCourseMapping.js**
   - Added Firestore import
   - Added caching mechanism (5-minute cache)
   - Made all functions async
   - Added `initializeCourseData()` to fetch all data
   - Functions: `getAllSchools()`, `getCentresForSchool()`, `getCoursesForEntity()`, etc.

2. **src/pages/Signup.jsx**
   - Updated `handleSchoolChange()` to be async
   - Updated `handleCentreChange()` to be async
   - Uses `await` when calling course mapping functions

3. **src/pages/Profile.jsx**
   - Updated useEffect to use async initialization
   - Updated `handleSchoolChange()` and `handleCentreChange()` to be async
   - Updated `handleCancel()` to be async

4. **src/pages/Upload.jsx**
   - Added `useEffect` to initialize course data
   - Added state for `allSchools` and `availableCourses`
   - Updated `handleSchoolChange()` and `handleCentreChange()` to be async

5. **src/pages/Resources.jsx**
   - Added `useEffect` to fetch courses
   - Added state for `availableCourses`

6. **src/pages/AdminPanel.jsx**
   - Added `useEffect` hooks to fetch schools and courses
   - Added state for schools and courses

### New Files

1. **src/utils/migrateCourseDataToFirestore.js**
   - Migration script to upload data to Firestore
   - Run once to populate the database

2. **src/components/MigrateCourseData.jsx**
   - React component with UI to trigger migration
   - Shows progress and status

3. **src/hooks/useCourseData.js**
   - Custom React hooks for easier data fetching
   - `useCourseData()` - Get all schools
   - `useSchoolCentres(schoolName)` - Get centres for a school
   - `useEntityCourses(entityName)` - Get courses for school/centre

## Caching Strategy

The system uses a 5-minute cache to minimize Firestore reads:
- First call fetches from Firestore
- Subsequent calls (within 5 minutes) return cached data
- After 5 minutes, data is refreshed automatically
- Call `initializeCourseData(true)` to force refresh

## Benefits

✅ **Centralized Data**: All course data in one place (Firestore)
✅ **Easy Updates**: Admins can update courses without code changes
✅ **Scalable**: Can handle thousands of courses
✅ **Real-time**: Changes reflect immediately for all users
✅ **Cached**: Minimal Firestore reads due to caching
✅ **Backward Compatible**: Old hardcoded data still available as fallback

## Future Enhancements

You can now add these features easily:

1. **Admin Course Management UI**
   - Add/edit/delete schools, centres, and courses
   - Directly update Firestore collections

2. **Course Request Approval**
   - When admin approves a course request, add it to Firestore
   - Update the appropriate collection

3. **Bulk Import/Export**
   - Export all courses to CSV
   - Import courses from CSV

4. **Course Analytics**
   - Track which courses have most resources
   - See popular courses by enrollment

## Troubleshooting

### Data not loading
- Check Firebase connection
- Verify Firestore rules allow reads
- Check console for errors

### Old data still showing
- Call `initializeCourseData(true)` to force refresh
- Clear browser cache
- Check that migration completed successfully

### Migration fails
- Check Firestore rules allow writes
- Verify Firebase config is correct
- Check console for specific error messages

## Firestore Security Rules

Make sure your Firestore rules allow reads for these collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all users to read course data
    match /school_courses/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /centre_courses/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /school_to_centres/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify Firebase configuration
3. Check that migration was successful
4. Ensure Firestore rules are correct
