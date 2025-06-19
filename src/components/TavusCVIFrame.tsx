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
    <div style={{ display: "flex", height: "600px", borderRadius: "12px", overflow: "hidden" }}>
      {/* Video Embed */}
      <div style={{ flex: 2, marginRight: "12px" }}>
        <iframe
          ref={iframeRef}
          title="Tavus CVI"
          allow="microphone; camera"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "12px",
          }}
        />
      </div>

      {/* Chat UI or Custom Side Panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Chat</h3>
        <div style={{ height: "80%", overflowY: "auto" }}>
          {/* You can replace this with actual chat messages */}
          <p>User1: Hello!</p>
          <p>User2: Hi, how are you?</p>
        </div>
        <input
          type="text"
          placeholder="Type your message..."
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>
    </div>
  );
};

export default TavusCVIFrame;
