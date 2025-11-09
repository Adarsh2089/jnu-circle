# 🚨 IMPORTANT: Cloudinary Upload Preset Setup

## The upload is failing because the upload preset doesn't exist yet!

### Quick Fix (2 minutes):

1. **Go to Cloudinary Console**
   - Visit: https://console.cloudinary.com/console
   - Login with your credentials

2. **Navigate to Upload Settings**
   - Click on the ⚙️ **Settings** icon (top right)
   - Select **Upload** from the left sidebar
   - Scroll down to **Upload presets** section

3. **Add Upload Preset**
   - Click **"Add upload preset"** button
   - Fill in the following:
     ```
     Upload preset name: jnu_circle_preset
     Signing Mode: Unsigned
     Folder: jnu-circle (optional)
     ```
   
4. **Configure Allowed Formats**
   - Under **"Media Analysis and Management"**
   - Find **"Allowed formats"** field
   - Enter: `pdf,jpg,jpeg,png`
   
5. **Set File Size Limit**
   - Find **"Max file size"** field
   - Enter: `10485760` (10MB in bytes)
   - Or use the slider to set 10MB

6. **Save**
   - Scroll to bottom
   - Click **"Save"** button
   - You should see: "Upload preset 'jnu_circle_preset' created successfully"

### ✅ Verify Setup

1. Go back to your app: http://localhost:5174
2. Navigate to **Upload** page
3. Try uploading a PDF or image file
4. Should work now! ✨

---

## Alternative: Using a Different Preset Name

If you want to use a different preset name:

1. Create the preset in Cloudinary with your preferred name
2. Update the `.env` file:
   ```
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

---

## Screenshots to Help

### Step 1: Settings → Upload
![Cloudinary Settings](https://res.cloudinary.com/demo/image/upload/v1/cloudinary_console_settings.png)

### Step 2: Add Upload Preset
Look for the "Add upload preset" button in the Upload presets section

### Step 3: Configure
- **Name**: jnu_circle_preset
- **Signing mode**: Unsigned ⚠️ (Important!)
- **Allowed formats**: pdf,jpg,jpeg,png

---

## ⚠️ Common Issues

**Issue**: "Invalid upload preset"
- **Solution**: Make sure the preset name is exactly `jnu_circle_preset`
- Check that Signing Mode is set to **"Unsigned"**

**Issue**: "Unauthorized"
- **Solution**: Verify your cloud name is correct in `.env` file
- Cloud Name: `dzq5ro50y`

**Issue**: "Format not allowed"
- **Solution**: Add `pdf,jpg,jpeg,png` to allowed formats

---

## Need Help?

If you're still having issues:

1. Check browser console for detailed error messages
2. Verify `.env` file has:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=dzq5ro50y
   VITE_CLOUDINARY_UPLOAD_PRESET=jnu_circle_preset
   ```
3. Restart the development server after changes

---

**Once the preset is created, uploading should work perfectly! 🎉**
