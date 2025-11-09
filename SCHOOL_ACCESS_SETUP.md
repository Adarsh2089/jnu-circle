# School-Based Access Control Setup

## Firestore Composite Index Required

To enable school-based filtering, you need to create a composite index in Firestore.

### Option 1: Automatic (When you run the query)
1. Try to view resources in your app
2. You'll see an error in the console with a link
3. Click the link to auto-create the index in Firebase Console
4. Wait 2-3 minutes for the index to build

### Option 2: Manual Setup
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Configure:
   - **Collection ID**: `resources`
   - **Field 1**: `verificationStatus` (Ascending)
   - **Field 2**: `school` (Ascending)
   - **Query scope**: Collection
4. Click "Create Index"
5. Wait for status to change from "Building" to "Enabled"

### Option 3: Using Firebase CLI
```bash
# Deploy the index configuration
firebase deploy --only firestore:indexes
```

The `firestore.indexes.json` file is already created in your project root.

## How It Works

### Upload Restrictions
- Users can only upload resources for their own school/centre
- The school field is auto-filled and locked (read-only)
- Prevents cross-school uploads

### View Restrictions  
- Users can only view resources from their own school/centre
- Dashboard shows recent resources from user's school only
- Resources page filters by user's school automatically
- Blue notice banner informs users about the restriction

### Database Structure
```javascript
resource: {
  school: "School of Computer and Systems Sciences",  // Matches user's school
  verificationStatus: "approved",
  // ... other fields
}

user: {
  school: "School of Computer and Systems Sciences",  // User's school
  // ... other fields
}
```

### Query Example
```javascript
query(
  collection(db, 'resources'),
  where('verificationStatus', '==', 'approved'),
  where('school', '==', userProfile.school)  // Filter by user's school
)
```

## Testing

1. **Sign up** with different schools to test isolation
2. **Upload** a resource - should auto-fill your school
3. **View Resources** - should only show resources from your school
4. **Dashboard** - should show recent resources from your school

## Benefits

✅ School/Centre isolation - content is relevant to users
✅ Better organization - resources grouped by school
✅ Fair contribution - users contribute to their own community
✅ Scalability - queries are optimized with indexes
