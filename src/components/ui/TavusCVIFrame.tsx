// src/components/ui/TavusCVIFrame.tsx

import { useEffect, useRef } from "react";

interface TavusCVIFrameProps {
  conversationUrl: string;
}

export const TavusCVIFrame = ({ conversationUrl }: TavusCVIFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && conversationUrl) {
      iframeRef.current.src = conversationUrl;
    }
  }, [conversationUrl]);

  return (
    <iframe
      ref={iframeRef}
      title="Tavus CVI"
      allow="microphone; camera"
      style={{
        width: "100%",
        height: "600px",
        border: "none",
        borderRadius: "12px",
      }}
    />
  );
};
export default TavusCVIFrame;