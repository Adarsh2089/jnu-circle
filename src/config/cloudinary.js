// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'jnu_circle_preset'
};

// Cloudinary upload function
export const uploadToCloudinary = async (file) => {
  // Validate configuration
  if (!cloudinaryConfig.cloudName) {
    throw new Error('Cloudinary cloud name is not configured. Check your .env file.');
  }

  // Determine resource type based on file type
  let resourceType = 'auto';
  const fileType = file.type.toLowerCase();
  
  if (fileType === 'application/pdf') {
    resourceType = 'raw'; // PDFs should be uploaded as 'raw' type
  } else if (fileType.startsWith('image/')) {
    resourceType = 'image';
  } else if (fileType.startsWith('video/')) {
    resourceType = 'video';
  }

  console.log('Uploading file:', {
    name: file.name,
    type: file.type,
    size: file.size,
    resourceType: resourceType
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  
  // Add folder organization
  formData.append('folder', 'jnu_circle');
  
  // For PDFs, add resource type
  if (resourceType === 'raw') {
    formData.append('resource_type', 'raw');
  }

  try {
    // Use the appropriate endpoint based on resource type
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
    
    console.log('Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    console.log('Cloudinary response:', data);

    if (!response.ok) {
      // Provide detailed error message
      const errorMessage = data.error?.message || 'Upload failed';
      console.error('Cloudinary error:', data);
      
      if (errorMessage.includes('preset') || errorMessage.includes('Invalid')) {
        throw new Error(
          `Upload preset "${cloudinaryConfig.uploadPreset}" not found. Please create it in Cloudinary Dashboard:\n\n` +
          '1. Go to Settings → Upload\n' +
          '2. Scroll to "Upload presets"\n' +
          '3. Click "Add upload preset"\n' +
          '4. Preset name: "jnu_circle_preset"\n' +
          '5. Signing mode: "Unsigned"\n' +
          '6. Folder: "jnu_circle" (optional)\n' +
          '7. Allowed formats: pdf,jpg,jpeg,png,gif\n' +
          '8. Save and try again\n\n' +
          `Current cloud name: ${cloudinaryConfig.cloudName}`
        );
      }
      
      throw new Error(`Upload failed: ${errorMessage}`);
    }

    // Return data with fallbacks for undefined values
    const result = {
      url: data.secure_url || data.url || '',
      publicId: data.public_id || '',
      resourceType: data.resource_type || resourceType || 'raw',
      format: data.format || (file.name ? file.name.split('.').pop() : 'unknown'),
      bytes: data.bytes || file.size || 0,
    };
    
    console.log('Upload result:', result);
    return result;
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
