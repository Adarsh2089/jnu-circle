import { useEffect, useState, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SecureViewer = ({ resource, onClose }) => {
  const { user, userProfile } = useAuth();
  const [watermarkText, setWatermarkText] = useState('');
  const hasTrackedView = useRef(false);

  useEffect(() => {
    // Generate watermark with user info and timestamp
    const timestamp = new Date().toLocaleString();
    const watermark = `${userProfile?.fullName || user?.email || 'User'} | ${timestamp}`;
    setWatermarkText(watermark);

    // Track view count (only once per unique resource)
    const trackView = async () => {
      // Prevent double execution in React Strict Mode
      if (hasTrackedView.current) {
        console.log('View tracking already executed');
        return;
      }
      
      if (!resource.id || !user) return;

      // Mark as tracked immediately
      hasTrackedView.current = true;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log('User document not found');
          return;
        }

        const userData = userDoc.data();
        const viewedResources = userData.viewedResources || [];
        
        // Check if user has already viewed this resource
        if (viewedResources.includes(resource.id)) {
          console.log('✓ Resource already viewed by this user');
          console.log('  Current unique view count:', viewedResources.length);
          console.log('  Viewed resources:', viewedResources);
          return;
        }

        console.log('📊 Tracking NEW unique view for resource:', resource.id);
        console.log('  Previous viewed resources:', viewedResources);
        
        // Increment resource view count
        const resourceRef = doc(db, 'resources', resource.id);
        await updateDoc(resourceRef, {
          views: increment(1)
        });

        // Add resource ID to user's viewedResources array and increment viewCount
        await updateDoc(userRef, {
          viewedResources: arrayUnion(resource.id),
          viewCount: increment(1)
        });

        const newViewCount = viewedResources.length + 1;
        console.log('✅ Unique view tracked successfully!');
        console.log('  New unique view count:', newViewCount);
        console.log('  Updated viewed resources:', [...viewedResources, resource.id]);
      } catch (error) {
        console.error('Error tracking view:', error);
        // Reset on error so it can retry
        hasTrackedView.current = false;
      }
    };

    trackView();

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for save/print
    const handleKeyDown = (e) => {
      // Ctrl+S, Ctrl+P, Ctrl+Shift+P, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'I')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        alert('This action is disabled for security reasons');
        return false;
      }
    };

    // Disable print
    const disablePrint = () => {
      const style = document.createElement('style');
      style.id = 'no-print-style';
      style.innerHTML = '@media print { body { display: none !important; } }';
      document.head.appendChild(style);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    disablePrint();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      const printStyle = document.getElementById('no-print-style');
      if (printStyle) printStyle.remove();
    };
  }, []); // Empty dependency array - only run once on mount

  // Detect file type
  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    return 'iframe';
  };

  const fileType = getFileType(resource.fileUrl);

  // For PDFs, use PDF.js viewer with disabled features
  const getPdfViewerUrl = (url) => {
    // Using Mozilla's PDF.js viewer with disabled features
    return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}#pagemode=none&toolbar=0`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{resource.title}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {resource.subject} • {resource.course} • {resource.year}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-900 bg-opacity-50 text-yellow-200 px-4 py-2 flex items-center text-sm">
        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>
          Protected Content: Download, print, and copy functions are disabled. 
          This viewing session is tracked.
        </span>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 relative overflow-hidden select-none">
        {/* Multiple Watermarks */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-gray-500 text-opacity-20 text-xs font-bold transform rotate-[-45deg] whitespace-nowrap"
              style={{
                top: `${(i % 5) * 20 + 10}%`,
                left: `${Math.floor(i / 5) * 25 + 5}%`,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {watermarkText}
            </div>
          ))}
        </div>

        {/* File Viewer */}
        <div className="w-full h-full">
          {fileType === 'pdf' ? (
            <iframe
              src={getPdfViewerUrl(resource.fileUrl)}
              className="w-full h-full border-0"
              title={resource.title}
              sandbox="allow-scripts allow-same-origin"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : fileType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 p-4">
              <img
                src={resource.fileUrl}
                alt={resource.title}
                className="max-w-full max-h-full object-contain"
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              />
            </div>
          ) : fileType === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <video
                src={resource.fileUrl}
                controls
                controlsList="nodownload"
                className="max-w-full max-h-full"
                onContextMenu={(e) => e.preventDefault()}
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : (
            <iframe
              src={resource.fileUrl}
              className="w-full h-full border-0"
              title={resource.title}
              sandbox="allow-scripts allow-same-origin"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      </div>

      {/* Footer Watermark */}
      <div className="bg-gray-900 text-gray-400 px-4 py-2 text-xs text-center">
        Viewed by: {watermarkText} | © JNU Circle - All Rights Reserved
      </div>
    </div>
  );
};

export default SecureViewer;
