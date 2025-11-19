import { useEffect, useRef } from 'react';

const AdSlot = ({ slot = 'horizontal', className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Google AdSense script
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  const getAdDimensions = () => {
    switch (slot) {
      case 'horizontal':
        return 'min-h-[90px] md:min-h-[250px]';
      case 'vertical':
        return 'min-h-[600px]';
      case 'square':
        return 'min-h-[250px]';
      default:
        return 'min-h-[100px]';
    }
  };

  return (
    <div className={`ad-container ${getAdDimensions()} ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1811916017128614"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
