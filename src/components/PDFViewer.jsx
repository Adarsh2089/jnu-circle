import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker from node_modules
const pdfWorkerUrl = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PDFViewer = ({ url, scale, watermarkText }) => {
  const canvasContainerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Configure PDF.js to handle CORS
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
          isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
        console.log('PDF loaded successfully:', pdf.numPages, 'pages');
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadPdf();
  }, [url]);

  // Render all pages
  useEffect(() => {
    if (!pdfDoc || !canvasContainerRef.current) return;
    
    // Prevent re-rendering if already rendering
    if (rendering) return;

    const renderPages = async () => {
      setRendering(true);
      const container = canvasContainerRef.current;
      if (!container) return;
      
      container.innerHTML = ''; // Clear previous renders

      console.log('Rendering', numPages, 'pages at scale', scale);

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          
          // Use higher DPI for sharper rendering
          const desiredWidth = 1200; // Higher base resolution
          const originalViewport = page.getViewport({ scale: 1 });
          const scaleToFit = desiredWidth / originalViewport.width;
          const viewport = page.getViewport({ scale: scaleToFit * scale });

          // Create canvas with device pixel ratio for crisp display
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const devicePixelRatio = window.devicePixelRatio || 2;
          
          canvas.height = viewport.height * devicePixelRatio;
          canvas.width = viewport.width * devicePixelRatio;
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '10px auto';
          canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          canvas.style.backgroundColor = 'white';

          // Disable right-click on canvas
          canvas.oncontextmenu = (e) => {
            e.preventDefault();
            return false;
          };
          canvas.onmousedown = (e) => {
            if (e.button === 2) {
              e.preventDefault();
              return false;
            }
          };

          container.appendChild(canvas);

          // Scale context to match device pixel ratio for sharp rendering
          context.scale(devicePixelRatio, devicePixelRatio);

          // Render PDF page with high quality
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            intent: 'display',
            enableWebGL: true,
            renderInteractiveForms: false
          };

          container.appendChild(canvas);

          // Render PDF page with high quality
          await page.render(renderContext).promise;
          console.log(`Page ${pageNum} rendered`);

          // Add watermark overlay
          if (watermarkText) {
            context.save();
            context.globalAlpha = 0.08;
            context.font = '12px Arial';
            context.fillStyle = '#666';
            context.rotate(-45 * Math.PI / 180);

            // Draw multiple watermarks
            for (let i = 0; i < 8; i++) {
              const x = (i % 4) * (viewport.width / 4) - viewport.width / 2;
              const y = Math.floor(i / 4) * (viewport.height / 2);
              context.fillText(watermarkText, x, y);
            }

            context.restore();
          }
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error);
        }
      }

      setRendering(false);
      console.log('All pages rendered successfully');
    };

    renderPages();
  }, [pdfDoc, numPages, scale, watermarkText]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">⚠️ Error Loading PDF</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasContainerRef}
      className="w-full h-full overflow-auto bg-gray-800"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onMouseDown={(e) => {
        if (e.button === 2) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }}
      style={{
        userSelect: 'none', // Disable text selection
        WebkitUserSelect: 'none',
        touchAction: 'pan-y pinch-zoom',
        padding: '20px 0'
      }}
    />
  );
};

export default PDFViewer;
