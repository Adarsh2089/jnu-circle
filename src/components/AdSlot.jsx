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
      {/* Replace with your actual AdSense code */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-xxxxxxxxxx" // Replace with your AdSense ID
        data-ad-slot="xxxxxxxxxx" // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {/* Placeholder text - remove when ads are live */}
      <span className="text-sm">Advertisement Space</span>
    </div>
  );
};

export default AdSlot;
