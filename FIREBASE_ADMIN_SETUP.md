# Firebase Setup for Hierarchical Admin System

## Required Firebase Collections

### 1. admin_nominations

**Purpose:** Store user nominations for School/Centre Admin roles

**Create Collection:**
1. Go to Firebase Console → Firestore Database
2. Click "Start Collection"
3. Collection ID: `admin_nominations`
4. Add first document with ID: `example_nomination`

**Document Structure:**
```javascript
{
  userId: "string",
  userEmail: "string",
  userName: "string",
  userSchool: "string",
  userCentre: "string",
  nominationType: "string", // 'school' or 'centre'
  targetSchool: "string",
  targetCentre: "string | null",
  reason: "string",
  experience: "string",
  commitment: "string",
  status: "string", // 'pending', 'approved', 'rejected'
  createdAt: "timestamp (string)",
  reviewedAt: "timestamp (string) | null",
  reviewedBy: "string | null",
  reviewNotes: "string"
}
```

**Indexes Required:**
- Single field indexes are auto-created
- No composite indexes needed for this collection

---

### 2. users (Update Existing)

**New Fields to Add:**

When a user is approved as admin, these fields are added to their user document:

```javascript
{
  // Existing fields remain unchanged
  name: "string",
  email: "string",
  school: "string",
  centre: "string",
  course: "string",
  hasPaid: "boolean",
  hasContributed: "boolean",
  createdAt: "timestamp",
  
  // NEW ADMIN FIELDS
  role: "string", // 'user' (default), 'schoolAdmin', 'centreAdmin'
  adminSchool: "string | undefined", // Set when user becomes school/centre admin
  adminCentre: "string | undefined", // Set when user becomes centre admin
  updatedAt: "timestamp"
}
```

**No manual updates needed** - these fields are automatically added when nominations are approved.

---

### 3. Composite Indexes Required

Firebase will automatically prompt you to create these indexes when the queries run for the first time.

#### For School Admin Queries:

**resources collection:**
```
Collection: resources
Fields:
  - uploaderSchool (Ascending)
  - uploadedAt (Descending)
Query scope: Collection
```

**course_add_request collection:**
```
Collection: course_add_request
Fields:
  - school (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**users collection:**
```
Collection: users
Fields:
  - school (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### For Centre Admin Queries:

**resources collection (compound):**
```
Collection: resources
Fields:
  - uploaderSchool (Ascending)
  - uploaderCentre (Ascending)
  - uploadedAt (Descending)
Query scope: Collection
```

**course_add_request collection (compound):**
```
Collection: course_add_request
Fields:
  - school (Ascending)
  - centre (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**users collection (compound):**
```
Collection: users
Fields:
  - school (Ascending)
  - centre (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

---

## Automatic Index Creation

**Method 1: Let Firebase Guide You**

1. Run the application
2. Login as a School Admin or Centre Admin
3. Try to access their admin panel
4. Firebase will show an error in console with a link
5. Click the link to auto-create the index
6. Wait 2-5 minutes for index building
7. Refresh the page

**Method 2: Manual Creation**

1. Go to Firebase Console → Firestore Database
2. Click "Indexes" tab
3. Click "Add Index"
4. Select collection
5. Add fields with sort orders as shown above
6. Click "Create"

---

## Security Rules

Update your Firestore security rules to allow proper access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin Nominations - Users can create, admins can read all
    match /admin_nominations/{nominationId} {
      // Allow users to create nominations
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Allow users to read their own nominations
      allow read: if request.auth != null 
                  && (resource.data.userId == request.auth.uid 
                      || request.auth.token.email == 'admin@jnu.ac.in');
      
      // Only super admin can update/delete
      allow update, delete: if request.auth != null 
                            && request.auth.token.email == 'admin@jnu.ac.in';
    }
    
    // Users collection - Updated rules for admin roles
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own non-admin fields
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                        .hasAny(['role', 'adminSchool', 'adminCentre']);
      
      // Super admin can do everything
      allow read, write: if request.auth != null 
                         && request.auth.token.email == 'admin@jnu.ac.in';
      
      // School admins can read users from their school
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.role == 'schoolAdmin'
                  && resource.data.school == get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.adminSchool;
      
      // Centre admins can read users from their centre
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.role == 'centreAdmin'
                  && resource.data.school == get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.adminSchool
                  && resource.data.centre == get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.adminCentre;
    }
    
    // Resources - School/Centre admins can manage
    match /resources/{resourceId} {
      // School admins can update resources from their school
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.role == 'schoolAdmin'
                    && resource.data.uploaderSchool == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminSchool;
      
      // Centre admins can update resources from their centre
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.role == 'centreAdmin'
                    && resource.data.uploaderSchool == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminSchool
                    && resource.data.uploaderCentre == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminCentre;
    }
    
    // Course Add Requests - School/Centre admins can manage
    match /course_add_request/{requestId} {
      // School admins can update requests for their school
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.role == 'schoolAdmin'
                    && resource.data.school == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminSchool;
      
      // Centre admins can update requests for their centre
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.role == 'centreAdmin'
                    && resource.data.school == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminSchool
                    && resource.data.centre == get(/databases/$(database)/documents/users/$(request.auth.uid))
                       .data.adminCentre;
    }
  }
}
```

---

## Testing Setup

### 1. Create Test Nomination

Use Firebase Console to manually create a test nomination:

```javascript
// Collection: admin_nominations
// Document ID: test_nomination_1

{
  userId: "test_user_123",
  userEmail: "testuser@mail.jnu.ac.in",
  userName: "Test User",
  userSchool: "School of Computer & Systems Sciences",
  userCentre: "Centre for Computer Science",
  nominationType: "school",
  targetSchool: "School of Computer & Systems Sciences",
  targetCentre: null,
  reason: "I have been a student of this school for 3 years and want to contribute to the community by managing resources and helping fellow students. I believe I can bring positive changes to how resources are organized and verified.",
  experience: "Led student technical club for 2 years",
  commitment: "5-10 hours per week",
  status: "pending",
  createdAt: "2024-01-15T10:00:00Z",
  reviewedAt: null,
  reviewedBy: null,
  reviewNotes: ""
}
```

### 2. Approve Test Nomination

1. Login as admin@jnu.ac.in
2. Go to Admin Panel → Nominations tab
3. Click "Approve" on test nomination
4. Check that user document is updated with admin role

### 3. Verify User Document

After approval, the user document should have:

```javascript
{
  // ... existing fields ...
  role: "schoolAdmin",
  adminSchool: "School of Computer & Systems Sciences",
  updatedAt: "2024-01-15T11:00:00Z"
}
```

### 4. Test School Admin Access

1. Login as the approved user
2. See "School Admin" link in navbar
3. Click to access School Admin Panel
4. Verify resources, requests, and users load correctly
5. Test approve/reject functionality

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Solution:** Check Firebase Security Rules. Make sure the rules allow:
- Users to create nominations
- Admins to read/update nominations
- School/Centre admins to query their data

### Error: "The query requires an index"

**Solution:** Click the link in the error message or manually create the index in Firebase Console.

### User not seeing admin panel link

**Check:**
1. User document has `role` field set correctly
2. `adminSchool` and/or `adminCentre` fields are set
3. User has logged out and logged back in (to refresh context)

### Nominations not appearing

**Check:**
1. `admin_nominations` collection exists
2. Documents have correct structure
3. Status is set correctly ('pending', 'approved', 'rejected')

### School/Centre admin sees no data

**Check:**
1. Composite indexes are created and active
2. Resources/users have correct school/centre fields
3. Admin's `adminSchool`/`adminCentre` matches data in collections

---

## Quick Start Commands

**Create admin_nominations collection:**
```bash
# In Firebase Console:
# 1. Click "Start Collection"
# 2. Enter "admin_nominations"
# 3. Add example document
# 4. Delete example document after creation
```

**Update existing user to School Admin (manual test):**
```javascript
// In Firebase Console, edit user document:
{
  role: "schoolAdmin",
  adminSchool: "School of Computer & Systems Sciences",
  updatedAt: new Date().toISOString()
}
```

**Update existing user to Centre Admin (manual test):**
```javascript
// In Firebase Console, edit user document:
{
  role: "centreAdmin",
  adminSchool: "School of Computer & Systems Sciences",
  adminCentre: "Centre for Computer Science",
  updatedAt: new Date().toISOString()
}
```

---

## Verification Checklist

- [ ] `admin_nominations` collection created
- [ ] Example nomination document exists
- [ ] Security rules updated
- [ ] Composite indexes created (or ready to auto-create)
- [ ] Test user promoted to School Admin
- [ ] School Admin can access panel
- [ ] School Admin can see school data
- [ ] Test user promoted to Centre Admin
- [ ] Centre Admin can access panel
- [ ] Centre Admin can see centre data

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console for data structure
3. Verify security rules are correct
4. Ensure indexes are built (check Indexes tab)
5. Clear browser cache and re-login

**All Set!** Your hierarchical admin system is ready to use.
