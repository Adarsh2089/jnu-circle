# Quick Start Guide: Firebase Course Data Migration

## 🚀 Getting Started

Your course data has been successfully migrated to use Firebase Firestore! Follow these steps to complete the setup.

## ✅ Step 1: Run the Migration (ONE TIME)

You need to populate your Firestore database with the course data. Choose one method:

### Method A: Using the Migration Component (Easiest)

1. **Add the component to AdminPanel** (or any admin-only page):

```jsx
// At the top of AdminPanel.jsx
import MigrateCourseData from '../components/MigrateCourseData';

// In your JSX, add a new tab or section:
{activeTab === 'migration' && (
  <div className="space-y-6">
    <MigrateCourseData />
  </div>
)}
```

2. **Navigate to that page** in your app while logged in as admin

3. **Click "Start Migration"** button

4. **Wait for completion** (takes ~5-10 seconds)

5. **Remove the component** after successful migration

### Method B: Using Browser Console

1. Open your app in the browser
2. Open Developer Console (F12)
3. Go to Console tab
4. Run this command:
```javascript
// Copy and paste this entire block:
import('./utils/migrateCourseDataToFirestore.js').then(module => {
  module.migrateCourseDataToFirestore()
    .then(() => console.log('✅ Migration successful!'))
    .catch(err => console.error('❌ Migration failed:', err));
});
```

## ✅ Step 2: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left menu
4. Verify these collections exist with data:
   - ✅ `school_courses` - Should have 10 documents
   - ✅ `centre_courses` - Should have 42 documents
   - ✅ `school_to_centres` - Should have 10 documents

## ✅ Step 3: Update Firestore Rules

Make sure your Firestore rules allow reading course data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Course data - everyone can read, only admins can write
    match /school_courses/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /centre_courses/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /school_to_centres/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## ✅ Step 4: Test Your App

Test these features to ensure everything works:

- [ ] **Signup Page**: School dropdown loads → Select school → Centre/Course dropdowns populate
- [ ] **Profile Page**: Edit mode → School selection → Centre/Course dropdowns work
- [ ] **Upload Page**: School/Centre/Course selection works for both admin and users
- [ ] **Resources Page**: Course filter shows correct courses
- [ ] **Admin Panel**: School and course filters work in all tabs

## 📊 What Changed?

### Before (Hardcoded)
```javascript
export const schoolCourses = {
  "School of Engineering": [
    "B.Tech. in ECE",
    "B.Tech. in CSE",
    "M.Tech. in Engineering",
    "Phd"
  ]
};
```

### After (Firebase)
```javascript
// Data stored in Firestore
// Functions now async:
const schools = await getAllSchools();
const centres = await getCentresForSchool(schoolName);
const courses = await getCoursesForEntity(entityName);
```

## 🔧 Troubleshooting

### Issue: "No schools loading"
**Solution**: 
- Check Firebase connection
- Verify migration completed
- Check browser console for errors

### Issue: "Functions not working"
**Solution**:
- Make sure you're using `await` when calling course functions
- Check that component is using `async` handlers

### Issue: "Migration button does nothing"
**Solution**:
- Check Firestore rules allow writes
- Check console for error messages
- Verify you're logged in as admin

### Issue: "Data loads slowly"
**Solution**:
- First load may be slow (fetching from Firestore)
- Subsequent loads use 5-minute cache
- This is normal behavior

## 📝 New Features You Can Build

Now that course data is in Firebase, you can easily:

1. **Admin Course Management**
   - Add UI to create/edit/delete courses
   - Update Firestore directly from admin panel

2. **Approve Course Requests**
   - When admin approves a request, add course to Firestore
   - No code deployment needed!

3. **Course Analytics**
   - Query Firestore to see which courses have most resources
   - Track popular courses

4. **Bulk Updates**
   - Export all courses to CSV
   - Import courses from spreadsheet

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Verify in Firebase Console
3. ✅ Update Firestore rules
4. ✅ Test all pages
5. ✅ Remove migration component
6. 🚀 Optional: Build admin course management UI

## 📚 Documentation

- Full details: `COURSE_DATA_MIGRATION.md`
- Custom hooks: `src/hooks/useCourseData.js`
- Migration script: `src/utils/migrateCourseDataToFirestore.js`

## Need Help?

Check these files for reference:
- **Migration**: `src/utils/migrateCourseDataToFirestore.js`
- **UI Component**: `src/components/MigrateCourseData.jsx`
- **Updated Mapping**: `src/data/schoolCourseMapping.js`
- **Example Usage**: `src/pages/Signup.jsx`, `src/pages/Profile.jsx`
- **Custom Hooks**: `src/hooks/useCourseData.js`

---

**Remember**: Run migration only ONCE! After successful migration, the data persists in Firestore.
