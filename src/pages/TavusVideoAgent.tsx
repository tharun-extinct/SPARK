// src/components/TavusVideoAgent.tsx

import React from "react";

interface TavusVideoAgentProps {
  agentId: string;
  userId?: string;
  sessionId?: string;
}

const TavusVideoAgent: React.FC<TavusVideoAgentProps> = ({ agentId, userId, sessionId }) => {
  const src = `https://embed.tavus.io/agent/${agentId}${
    userId || sessionId ? `?user_id=${userId}&session_id=${sessionId}` : ""
  }`;

  return (
    <iframe
      src={src}
      width="100%"
      height="600"
      allow="camera; microphone"
      className="rounded-xl border-none"
      title="AI Video Agent"
    />
  );
};

export default TavusVideoAgent;
