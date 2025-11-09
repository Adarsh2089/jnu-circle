# 🛡️ Admin Panel Guide - JNU Circle

## Overview

The admin verification system ensures that only quality, appropriate content is available to students. Here's how it works:

## 🔄 Content Verification Workflow

### 1. **User Upload**
- Student uploads a PYQ/notes/resource
- Status: `pending` (awaiting admin approval)
- User is notified that content is under review
- Content is NOT visible to other students yet

### 2. **Admin Review**
- Admin logs into Admin Panel (`/admin`)
- Reviews pending uploads
- Can view the actual file
- Decides to: Approve, Reject, or Delete

### 3. **Approval**
- Admin clicks "Approve"
- Status changes to: `approved`
- Resource becomes visible to all users
- User gets access granted (hasContributed = true)
- Contribution count increases

### 4. **Rejection** (Optional)
- Admin clicks "Reject" with optional reason
- Status changes to: `rejected`
- Resource hidden from all users
- User does NOT get access
- User can see rejection reason and re-upload

## 👨‍💼 Setting Up Admin Access

### Method 1: Email-Based (Recommended)

Edit `src/contexts/AdminContext.jsx`:

```javascript
const ADMIN_EMAILS = [
  'admin@jnu.ac.in',
  'youremail@jnu.ac.in',  // Add your email here
  'anotheradmin@jnu.ac.in'
];
```

### Method 2: Role-Based

When creating admin user in Firestore:

```javascript
// In Firestore Console
users/{userId}
{
  email: "admin@jnu.ac.in",
  role: "admin",  // Add this field
  fullName: "Admin Name",
  // ... other fields
}
```

## 🎯 Admin Panel Features

### Dashboard Stats
- **Pending Review**: Number of resources awaiting approval
- **Approved**: Total approved resources
- **Rejected**: Total rejected resources
- **Total Resources**: All resources in system

### Filters & Search
- **Status Filter**: View by Pending/Approved/Rejected/All
- **Search**: Search by title, subject, or uploader name
- **Real-time**: Updates immediately after actions

### Actions Available

#### 1. **View** 👁️
- Opens the actual file in new tab
- Review content before deciding
- Check quality and appropriateness

#### 2. **Approve** ✅
- Marks resource as verified
- Makes it visible to all students
- Grants uploader full access
- Increases contribution count

#### 3. **Reject** ❌
- Marks resource as rejected
- Optional: Add rejection reason
- Hides from all users
- User can see why and re-upload

#### 4. **Delete** 🗑️
- Permanently removes resource
- Cannot be undone
- Use for spam/inappropriate content

## 📋 Admin Panel Usage

### Accessing Admin Panel

1. **Login** with admin email
2. **Navigate** to `/admin` or click "Admin" button in navbar
3. **Red "Admin" badge** appears in navigation for admin users

### Reviewing Content

1. **View Pending** - Default view shows all pending resources
2. **Check Details**:
   - Title & description
   - Type (PYQ, notes, etc.)
   - Subject, course, year
   - Uploader information
   - Upload date
3. **View File** - Click "View" to open and review content
4. **Take Action** - Approve, Reject, or Delete

### Best Practices

✅ **DO:**
- Review content before approving
- Provide rejection reasons
- Approve quality content quickly
- Delete spam/inappropriate content
- Be fair and consistent

❌ **DON'T:**
- Approve without reviewing
- Reject without valid reason
- Keep pending items too long
- Show bias towards specific users

## 🔐 Security & Access Control

### Protected Routes
- `/admin` route requires admin authentication
- Non-admin users redirected to dashboard
- Admin status checked on every request

### Firestore Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only admins can update verification status
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.uid == resource.data.uploadedBy);
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📊 User Experience Flow

### For Regular Users:

1. **Upload** → Status: Pending
2. **Wait** → Admin reviews
3. **Approved** → Full access granted + visible to others
4. **OR Rejected** → See reason, can re-upload

### For Admin Users:

1. **Login** → See "Admin" button
2. **Review** → See all pending uploads
3. **Approve/Reject** → Instant update
4. **Monitor** → Track all content

## 🎨 UI Elements

### Admin Badge
- Red badge in navbar: "Admin"
- Shield icon (🛡️)
- Only visible to admin users

### Status Indicators
- 🟡 **Yellow**: Pending review
- 🟢 **Green**: Approved
- 🔴 **Red**: Rejected

### Pending Upload Notice
After user uploads:
```
✅ Upload Successful!
⏳ Pending Verification: Your resource has been submitted 
and is awaiting admin approval. Once verified, you'll get 
full access to all resources.
```

## 🔧 Customization

### Add More Admins
Edit `src/contexts/AdminContext.jsx`:
```javascript
const ADMIN_EMAILS = [
  'admin@jnu.ac.in',
  'newadmin@jnu.ac.in'  // Add here
];
```

### Change Verification Flow
Edit `src/pages/AdminPanel.jsx` to:
- Add more actions (Edit, Flag, etc.)
- Add category-specific approval
- Add bulk actions
- Add notification system

### Add Notifications
When approved/rejected:
- Send email to uploader
- Push notification
- In-app notification
- SMS alert

## 📱 Mobile Responsive
- Admin panel works on mobile
- Touch-friendly buttons
- Responsive layout
- Easy to use on any device

## 🚀 Future Enhancements

1. **Auto-Approval**
   - Trusted users get auto-approved
   - Based on reputation/history

2. **Multi-Level Review**
   - Multiple admins
   - Require 2+ approvals

3. **Analytics**
   - Approval rate
   - Average review time
   - User contributions

4. **Batch Operations**
   - Approve multiple at once
   - Bulk delete
   - Export reports

## ⚡ Quick Reference

| Action | What Happens |
|--------|--------------|
| User uploads | Status = pending, not visible |
| Admin approves | Status = approved, visible to all, user gets access |
| Admin rejects | Status = rejected, not visible, user sees reason |
| Admin deletes | Permanently removed |

---

## 📞 Admin Support

For admin-related questions:
- Check this guide
- Review code in `src/pages/AdminPanel.jsx`
- Check `src/contexts/AdminContext.jsx`

**You now have full admin control over content quality! 🎉**
