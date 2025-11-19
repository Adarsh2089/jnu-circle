import { useEffect, useState, useRef } from 'react';
import { X, AlertTriangle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import PDFViewer from './PDFViewer';

const SecureViewer = ({ resource, onClose }) => {
  const { user, userProfile } = useAuth();
  const [watermarkText, setWatermarkText] = useState('');
  const [scale, setScale] = useState(1); // Start at 100%
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasTrackedView = useRef(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.25)); // Max 300%
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25)); // Min 50%
  };

  const resetZoom = () => {
    setScale(1); // Reset to 100%
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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

    // Disable right-click - aggressive capture at document level
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };
    
    // Block right mouse button at the earliest phase
    const blockRightClick = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
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

    // Add right-click handler to iframe when it loads
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        try {
          // Try to add context menu handler to iframe content
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.addEventListener('contextmenu', handleContextMenu);
          }
        } catch (e) {
          // Cross-origin restriction - expected for external PDFs
          console.log('Cannot access iframe content (expected for external URLs)');
        }
      }
    };

    // Add event listeners with capture phase (runs BEFORE bubble phase)
    document.addEventListener('contextmenu', handleContextMenu, true); // Capture phase
    document.addEventListener('mousedown', blockRightClick, true); // Capture phase  
    document.addEventListener('mouseup', blockRightClick, true); // Capture phase
    document.addEventListener('keydown', handleKeyDown);
    disablePrint();

    // Add listener to iframe
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
    }

    // Hide PDF toolbar using CSS injection (for browsers that support it)
    const hidePdfToolbar = () => {
      const style = document.createElement('style');
      style.id = 'hide-pdf-toolbar';
      style.innerHTML = `
        /* Hide PDF.js toolbar if present */
        #toolbarContainer, .toolbar, [role="toolbar"] {
          display: none !important;
        }
        /* Hide download and print buttons */
        #download, #print, .download, .print, 
        button[title*="Download"], button[title*="Print"],
        button[title*="download"], button[title*="print"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    };

    hidePdfToolbar();

    // Add event listeners with capture phase to block right-click
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('mousedown', blockRightClick, true);
    document.addEventListener('mouseup', blockRightClick, true);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('mousedown', blockRightClick, true);
      document.removeEventListener('mouseup', blockRightClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      const printStyle = document.getElementById('no-print-style');
      const toolbarStyle = document.getElementById('hide-pdf-toolbar');
      if (printStyle) printStyle.remove();
      if (toolbarStyle) toolbarStyle.remove();
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

  // For PDFs, use direct browser viewer with zoom enabled and toolbar hidden
  const getPdfViewerUrl = (url) => {
    // Return URL with parameters: hide toolbar, load at 100%, enable zoom
    return `${url}#toolbar=0&navpanes=0&scrollbar=1&zoom=100`;
  };

  return (
    <div 
      ref={viewerRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onContextMenu={(e) => { e.preventDefault(); return false; }}
    >
      {/* Header */}
      <div 
        className="bg-gray-900 text-white p-3 sm:p-4 flex items-center justify-between"
        style={{ touchAction: 'none' }} // Disable touch zoom on header
        onContextMenu={(e) => { e.preventDefault(); return false; }}
      >
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-sm sm:text-xl font-bold truncate">{resource.title}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
            {resource.subject} • {resource.course} • {resource.year}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Security Notice with Zoom Controls */}
      <div 
        className="bg-yellow-900 bg-opacity-50 text-yellow-200 px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm"
        style={{ touchAction: 'none' }} // Disable touch zoom on notice bar
        onContextMenu={(e) => { e.preventDefault(); return false; }}
      >
        <div className="flex items-center">
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Protected Content: Download, print, and copy functions are disabled. This viewing session is tracked.</span>
            <span className="sm:hidden">Protected Content • Tracking enabled</span>
          </span>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 sm:p-2 bg-yellow-800 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom Out (25%)"
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          
          <button
            onClick={resetZoom}
            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-yellow-800 hover:bg-yellow-700 rounded transition-colors font-semibold text-xs sm:text-sm"
            title="Reset to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-1.5 sm:p-2 bg-yellow-800 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom In (25%)"
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 bg-yellow-800 hover:bg-yellow-700 rounded transition-colors ml-1 sm:ml-2"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
          >
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Viewer Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto select-none"
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
        onMouseDown={(e) => { if (e.button === 2) { e.preventDefault(); e.stopPropagation(); return false; }}}
        onMouseUp={(e) => { if (e.button === 2) { e.preventDefault(); e.stopPropagation(); return false; }}}
        style={{ 
          backgroundColor: '#111',
          overflowX: 'auto',
          overflowY: 'auto'
        }}
      >

        {/* File Viewer */}
        <div 
          className="w-full h-full" 
          style={{ 
            userSelect: 'none', 
            touchAction: 'pan-y pinch-zoom', // Enable scroll and pinch zoom ONLY on content
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            minHeight: '100%',
            width: scale > 1 ? `${scale * 100}%` : '100%' // Expand width when zoomed
          }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
          onMouseDown={(e) => { if (e.button === 2) { e.preventDefault(); return false; } }}
        >
          {fileType === 'pdf' ? (
            <PDFViewer 
              url={resource.fileUrl} 
              scale={scale} 
              watermarkText={watermarkText}
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
      <div className="bg-gray-900 text-gray-400 px-2 sm:px-4 py-2 text-[10px] sm:text-xs text-center break-words">
        <span className="hidden sm:inline">Viewed by: {watermarkText} | © JNU Circle - All Rights Reserved</span>
        <span className="sm:hidden">Viewed by: {userProfile?.fullName || user?.email?.split('@')[0] || 'User'} | © JNU Circle</span>
      </div>
    </div>
  );
};

export default SecureViewer;
