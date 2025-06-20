import React, { useState, useEffect, useRef } from 'react';

interface TavusCVIFrameProps {
  url: string;
  className?: string;
}

export const TavusCVIFrame: React.FC<TavusCVIFrameProps> = ({ url, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sometimes iframe loads but doesn't trigger onLoad
      // This is a fallback in case that happens
      setIsLoading(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };
  
  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
      onClick={handleInteraction}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Connecting to video interface...</p>
          <p className="text-xs mt-2 text-gray-300 max-w-sm text-center">
            Please allow camera and microphone access when prompted
          </p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={url}
        className={`w-full h-full border-0 rounded-lg shadow-xl ${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
        allow="camera; microphone; autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title="Tavus CVI Conversation Interface"
        onLoad={handleIframeLoad}
        style={{ 
          filter: hasInteracted ? 'none' : 'brightness(0.95) contrast(1.05)',
          transition: 'filter 0.3s ease-in-out'
        }}
      />
      
      {!hasInteracted && !isLoading && (
        <div 
          className="absolute inset-0 bg-black/5 hover:bg-black/0 flex items-center justify-center transition-all duration-300 cursor-pointer z-5"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg transform hover:scale-105 transition-transform">
            <p className="font-medium text-gray-900">Click to interact with AI assistant</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TavusCVIFrame;