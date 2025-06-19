import React from 'react';

interface TavusCVIFrameProps {
  url: string;
  className?: string;
}

export const TavusCVIFrame: React.FC<TavusCVIFrameProps> = ({ url, className = "" }) => {
  return (
    <iframe
      src={url}
      className={`w-full h-full border-0 ${className}`}
      allow="camera; microphone; autoplay; encrypted-media; fullscreen"
      allowFullScreen
      title="Tavus CVI Conversation Interface"
    />
  );
};

export default TavusCVIFrame;