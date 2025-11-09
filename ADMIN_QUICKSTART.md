# 🚀 Admin Quick Start - 2 Minute Setup

## Your Admin Credentials

✅ **Email**: `admin@jnu.ac.in`  
✅ **Password**: `adarsh@admin`  
✅ **Already created in Firebase Authentication**

---

## 🎯 Setup in 2 Steps

### Step 1: Login (30 seconds)

1. Go to: **http://localhost:5174/login**
2. Enter:
   - Email: `admin@jnu.ac.in`
   - Password: `adarsh@admin`
3. Click **Sign in**

### Step 2: Create Admin Profile (30 seconds)

**Two Options:**

#### Option A: Automatic Setup (Recommended) ⚡

1. After login, go to: **http://localhost:5174/admin-setup**
2. Click the **"Create Admin Profile"** button
3. Wait 2 seconds - page will reload
4. Done! You'll see the red "Admin" button in navbar

#### Option B: Manual Setup (Firestore)

1. Go to: https://console.firebase.google.com
2. Select: `jnu-circle` project
3. Go to: **Firestore Database**
4. Click: **Start collection** → Name it `users`
5. Add document with:
   - **Document ID**: Copy UID from Authentication
   - **Fields**:
     ```
     email: "admin@jnu.ac.in"
     fullName: "Admin"
     school: "Administration"
     course: "Admin"
     enrollmentYear: 2024
     isPremium: true
     hasContributed: true
     role: "admin"
     createdAt: "2025-10-21T00:00:00.000Z"
     contributionCount: 0
     viewCount: 0
     ```
6. Save and refresh the app

---

## ✅ Verify Admin Access

After setup, you should see:

1. ✅ Red **"Admin"** button in navbar (with shield icon 🛡️)
2. ✅ Can click it to access Admin Panel
3. ✅ OR navigate to: **http://localhost:5174/admin**

---

## 🎉 You're Ready!

Now you can:

- **Review** pending uploads
- **Approve** quality content
- **Reject** inappropriate content
- **Delete** spam
- **Monitor** all resources

---

## 🔧 Troubleshooting

**Don't see "Admin" button?**

1. Make sure you're logged in as `admin@jnu.ac.in`
2. Go to: http://localhost:5174/admin-setup
3. Click "Create Admin Profile"
4. Page will reload

**Can't access /admin route?**

- Logout and login again
- Clear browser cache (Ctrl + Shift + R)
- Check browser console for errors

---

## 📱 Quick Access URLs

- **Login**: http://localhost:5174/login
- **Admin Setup**: http://localhost:5174/admin-setup
- **Admin Panel**: http://localhost:5174/admin
- **Dashboard**: http://localhost:5174/dashboard

---

**Total Time: 2 minutes ⏱️**  
**Complexity: Easy 🟢**  
**Status: Ready to Use 🚀**
