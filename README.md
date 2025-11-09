# JNU Circle - Student Resource Hub

A centralized platform for JNU students to access Previous Year Questions (PYQs), notes, and study materials.

## 🚀 Features

- **User Authentication**: Secure registration and login with Firebase Authentication
- **Resource Upload**: Students can upload PYQs, notes, and study materials
- **Cloud Storage**: Files stored on Cloudinary, URLs saved in Firestore
- **Access Control**: 
  - Free access by contributing at least one resource
  - Premium access for ₹99/year
- **View-Only Mode**: Prevents downloading to maintain user engagement
- **Google AdSense Integration**: Monetization through strategically placed ads
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **School-wise Organization**: Resources organized by JNU schools and courses

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Cloudinary
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

## 🔧 Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Cloudinary Upload Preset**
   - Go to Cloudinary Dashboard → Settings → Upload
   - Create an upload preset named `jnu_circle_preset`
   - Set it to "unsigned" for client-side uploads
   - Configure allowed formats: pdf, jpg, jpeg, png

3. **Set up Firebase Firestore Collections**
   - `users`: User profiles
   - `resources`: Uploaded materials

4. **Configure Google AdSense**
   - Replace `ca-pub-xxxxxxxxxx` in `index.html` with your AdSense ID
   - Update ad slot IDs in `src/components/AdSlot.jsx`

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## 📁 Project Structure

```
jnucircle/
├── src/
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── pages/           # Page components
│   ├── config/          # Firebase & Cloudinary config
│   ├── App.jsx
│   └── main.jsx
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json
```

## 🎯 Key Features

- **Contribution-Based Access**: Upload to unlock OR pay ₹99/year
- **View-Only Mode**: Prevents downloads, maintains engagement
- **Cloudinary Storage**: Efficient file management
- **AdSense Integration**: Revenue generation
- **Mobile Responsive**: Works on all devices

## 🔒 Security

⚠️ **Important**: Never commit `.env` file to version control

## 📞 Support

For issues or questions about JNU Circle

---

**Built with ❤️ for JNU Students**
