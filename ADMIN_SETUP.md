# 🔐 Admin Account Setup Guide

## Your Admin Credentials

**Email**: `admin@jnu.ac.in`  
**Password**: `adarsh@admin`

## ✅ Setup Steps

### Step 1: Firebase Authentication (Already Done ✓)
You've already created the admin user in Firebase Authentication.

### Step 2: Create Admin Profile in Firestore

You need to create a user profile in Firestore for the admin account:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select project: `jnu-circle`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in left sidebar

3. **Find the users collection**
   - If it doesn't exist, create it by clicking "Start collection"
   - Collection ID: `users`

4. **Add Admin User Document**
   - Click "Add document"
   - **Document ID**: Use the UID from Firebase Authentication
     - Go to Authentication → Users
     - Copy the UID of `admin@jnu.ac.in`
   
   OR
   
   - Click "Auto-ID" to generate a document ID
   - Then manually link it later

5. **Add these fields**:
   ```
   Field                 Type       Value
   ────────────────────────────────────────────
   email                 string     admin@jnu.ac.in
   fullName              string     Admin
   school                string     Administration
   course                string     Admin
   enrollmentYear        number     2024
   isPremium             boolean    true
   hasContributed        boolean    true
   role                  string     admin
   contributionCount     number     0
   viewCount             number     0
   createdAt             string     2025-10-21T00:00:00.000Z
   ```

6. **Save the document**

### Alternative: Use the App to Create Profile

**Easier Method:**

1. **Go to**: http://localhost:5174/signup
2. **Fill the signup form** with:
   - Full Name: `Admin`
   - Email: `admin@jnu.ac.in`
   - School: `Administration`
   - Course: `Admin`
   - Enrollment Year: `2024`
   - Password: `adarsh@admin`
   - Confirm Password: `adarsh@admin`
3. **Click Sign up**

This will automatically create both the Firebase Auth user AND the Firestore profile!

**Note**: If the email is already registered in Firebase Auth, you'll get an error. In that case, just use Method 1 above to create the Firestore profile manually.

### Step 3: Login as Admin

1. **Go to**: http://localhost:5174/login
2. **Enter credentials**:
   - Email: `admin@jnu.ac.in`
   - Password: `adarsh@admin`
3. **Click Sign in**

### Step 4: Verify Admin Access

After logging in, you should see:
- ✅ Red "Admin" button in the navbar (with shield icon)
- ✅ Can access `/admin` route
- ✅ Can see the Admin Panel

### Step 5: Access Admin Panel

1. **Click** the red "Admin" button in navbar
2. **OR** Navigate to: http://localhost:5174/admin
3. **You'll see**:
   - Dashboard with stats
   - List of pending resources
   - Approve/Reject/Delete buttons

---

## 🔧 Troubleshooting

### Issue: "Admin" button not showing

**Solution 1**: Check if email is in admin list
- File: `src/contexts/AdminContext.jsx`
- Line 9: Should have `'admin@jnu.ac.in'`

**Solution 2**: Check Firestore profile
- Make sure user document exists in Firestore
- Email should match exactly: `admin@jnu.ac.in`

**Solution 3**: Clear browser cache and refresh
```bash
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Issue: Can't login

**Check**:
1. Email is correct: `admin@jnu.ac.in`
2. Password is correct: `adarsh@admin`
3. User exists in Firebase Authentication
4. Firebase Auth is enabled in Firebase Console

### Issue: Redirected from /admin

**Means**: You're not recognized as admin
**Fix**: 
1. Check email matches in ADMIN_EMAILS array
2. Logout and login again
3. Check browser console for errors

---

## 🎯 Quick Test

Once logged in as admin, test these:

1. **Upload a test resource** (from a different account)
2. **Go to Admin Panel** (`/admin`)
3. **Review the pending resource**
4. **Click "Approve"**
5. **Check Resources page** - should now be visible

---

## 🔐 Security Best Practices

### For Production:

1. **Use strong password**:
   - Change from `adarsh@admin` to something stronger
   - Use password manager

2. **Limit admin emails**:
   - Only add trusted emails to ADMIN_EMAILS

3. **Enable 2FA**:
   - In Firebase Console → Authentication → Settings
   - Enable multi-factor authentication

4. **Add Firebase Security Rules**:
   ```javascript
   // Only admins can approve/reject
   match /resources/{resourceId} {
     allow update: if request.auth != null && 
       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   }
   ```

5. **Monitor admin actions**:
   - Add logging for approve/reject actions
   - Track who did what and when

---

## 📝 Adding More Admins

Edit `src/contexts/AdminContext.jsx`:

```javascript
const ADMIN_EMAILS = [
  'admin@jnu.ac.in',
  'secondadmin@jnu.ac.in',  // Add more here
  'thirdadmin@jnu.ac.in',
];
```

Then create their accounts following the same steps above.

---

## ✅ Verification Checklist

- [ ] Admin user created in Firebase Authentication
- [ ] Admin profile created in Firestore
- [ ] Email matches in ADMIN_EMAILS array
- [ ] Can login successfully
- [ ] "Admin" button visible in navbar
- [ ] Can access `/admin` route
- [ ] Can approve/reject resources

---

## 🎉 You're All Set!

Your admin account is ready to use. Login and start reviewing content!

**Admin Panel**: http://localhost:5174/admin
