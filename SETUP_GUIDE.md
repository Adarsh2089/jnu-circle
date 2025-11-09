# 🚀 Quick Setup Guide for JNU Circle

## ⏱️ 5-Minute Setup

### Step 1: Cloudinary Upload Preset (2 minutes)

1. Visit: https://cloudinary.com/console
2. Login with your credentials
3. Go to: **Settings** → **Upload** → **Upload presets**
4. Click **"Add upload preset"**
5. Configure:
   - **Upload preset name**: `jnu_circle_preset`
   - **Signing mode**: Select **"Unsigned"**
   - **Folder**: Leave empty or set to `jnu-circle`
   - **Allowed formats**: `pdf, jpg, jpeg, png`
   - **Max file size**: `10485760` (10MB in bytes)
6. Click **Save**

✅ Done! Your upload system is ready.

### Step 2: Firebase Firestore Collections (2 minutes)

1. Visit: https://console.firebase.google.com
2. Select project: **jnu-circle**
3. Go to: **Firestore Database**
4. Click **"Start collection"**

**Create Collection 1: `users`**
- Collection ID: `users`
- Document ID: Auto-generate
- Add a test field: `email` (string) = `test@jnu.ac.in`
- Click **Save**

**Create Collection 2: `resources`**
- Collection ID: `resources`
- Document ID: Auto-generate
- Add a test field: `title` (string) = `Test Resource`
- Click **Save**

✅ Done! Database is ready.

### Step 3: Test the Application (1 minute)

1. Application is already running at: http://localhost:5174
2. Click **"Sign Up"**
3. Fill the form with:
   - Name: Your name
   - Email: yourname@jnu.ac.in
   - School: Select your school
   - Course: Your course
   - Year: Current year
   - Password: Choose a password (min 6 characters)
4. Click **"Sign up"**

✅ Done! You're registered and logged in.

## 🎯 Next: Upload Your First Resource

1. Go to **Dashboard**
2. Click **"Upload Resource"**
3. Fill in the details:
   - Title: e.g., "Data Structures Mid-Sem 2024"
   - Type: Select "Previous Year Question"
   - School/Course/Subject: Fill in
   - Year: 2024
4. Select a PDF or image file
5. Click **"Upload Resource"**

✅ Your first resource is uploaded to Cloudinary!

## 🔧 Optional: Google AdSense Setup (Later)

**Note**: You can add this later when you have traffic

1. Apply for Google AdSense
2. Wait for approval (can take 1-2 weeks)
3. Once approved:
   - Get your Publisher ID (ca-pub-XXXXXXXX)
   - Replace in `index.html` line 11
   - Get ad slot IDs from AdSense dashboard
   - Update in `src/components/AdSlot.jsx`

## 🎨 Customize Your Site

### Change Colors
Edit `tailwind.config.js` - lines 8-18:
```javascript
primary: {
  500: '#0ea5e9',  // Change to your color
  600: '#0284c7',  // Darker shade
  // ... other shades
}
```

### Change Site Name
Edit `index.html` - line 9:
```html
<title>Your Site Name</title>
```

### Update Footer
Edit `src/components/Footer.jsx` - lines 7-11

## ⚡ Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name
```

## 🐛 Troubleshooting

### Port Already in Use
- The app will automatically use next available port
- Or stop other apps using port 5173/5174

### Firebase Authentication Error
- Check Firebase console if Email/Password is enabled
- Go to: Authentication → Sign-in method → Email/Password → Enable

### Cloudinary Upload Failed
- Verify upload preset name is exactly: `jnu_circle_preset`
- Check it's set to "Unsigned" mode

### Can't See Uploaded Files
- Check Firestore rules allow read/write
- Verify you're logged in
- Check browser console for errors

## 📞 Need Help?

Check these files:
- `README.md` - Full documentation
- `PROJECT_SUMMARY.md` - Complete feature list
- `src/` - All source code with comments

## ✅ Checklist

- [ ] Cloudinary upload preset created
- [ ] Firebase Firestore collections created
- [ ] Signed up with test account
- [ ] Uploaded first resource
- [ ] Tested viewing resources
- [ ] Checked mobile responsive design

---

**You're all set! Happy coding! 🎉**
