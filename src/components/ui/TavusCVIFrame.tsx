import React, { useState, useEffect, useRef, forwardRef } from 'react';

interface TavusCVIFrameProps {
  url: string;
  className?: string;
  onTranscriptReceived?: (text: string) => void;
}

const TavusCVIFrame = forwardRef<HTMLIFrameElement, TavusCVIFrameProps>(({ 
  url, 
  className = "",
  onTranscriptReceived 
}, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  
  // Use the forwarded ref if provided, otherwise use internal ref
  const iframeRef = (ref as React.RefObject<HTMLIFrameElement>) || internalIframeRef;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sometimes iframe loads but doesn't trigger onLoad
      // This is a fallback in case that happens
      setIsLoading(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Listen for transcript messages from Tavus
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log all message events to help with debugging
      console.log("TavusCVIFrame received message:", event.origin);
      
      try {
        // Handle different message formats
        let data;
        if (typeof event.data === 'string') {
          try {
            data = JSON.parse(event.data);
            console.log("Parsed string message data:", data);
          } catch (e) {
            // If it's not valid JSON, use as-is (might be plain text)
            console.log("Using raw message text:", event.data);
            data = { text: event.data, type: 'speech' };
          }
        } else {
          data = event.data;
          console.log("Received object message data:", data);
        }
        
        // Process various transcript formats
        if (data && onTranscriptReceived) {
          let transcript = null;
          
          // Check all possible transcript formats
          if (data.type === 'speech' && data.text) {
            transcript = data.text;
          } else if (data.event === 'speech' && data.text) {
            transcript = data.text;
          } else if (data.type === 'transcript' && data.text) {
            transcript = data.text;
          } else if (data.content && data.content.text) {
            transcript = data.content.text;
          } else if (data.message && typeof data.message === 'string') {
            transcript = data.message;
          } else if (typeof data === 'string' && data.trim().length > 0) {
            // Maybe it's just a plain text message
            transcript = data;
          }
          
          if (transcript) {
            console.log("TavusCVIFrame sending transcript to parent:", transcript);
            onTranscriptReceived(transcript);
          }
        }
      } catch (error) {
        console.error('Error processing message in TavusCVIFrame:', error);
      }
    };
    
    // Listen for messages from the iframe
    window.addEventListener('message', handleMessage);
    
    // Test logging to verify event listener is working
    console.log("TavusCVIFrame message listener installed");
    
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log("TavusCVIFrame message listener removed");
    };
  }, [onTranscriptReceived]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log("TavusCVIFrame iframe loaded successfully");
  };
  
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      console.log("User interacted with TavusCVIFrame");
      
      // Attempt to get focus for the iframe
      if (iframeRef && iframeRef.current) {
        iframeRef.current.focus();
      }
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
});

TavusCVIFrame.displayName = 'TavusCVIFrame';

export default TavusCVIFrame;