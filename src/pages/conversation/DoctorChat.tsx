// src/pages/doctor.tsx

import { useEffect, useState } from "react";
import { createTavusConversation } from "@/lib/tavus";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";

export default function DoctorPage() {
  const [conversationUrl, setConversationUrl] = useState("");

  useEffect(() => {
    createTavusConversation({
    replicaId: "r4dcf31b60e1", // replace with actual replica ID
    personaId: "p321a7b6f093", // replace with actual persona ID
    name: "Doctor Chat",
    context: "You are a helpful virtual doctor called Dr anna giving medical advice.",
    greeting: "Hello! How can I assist with your health today?",
  })
      .then(setConversationUrl)
      .catch((err) => {
        console.error("Failed to start conversation", err);
      });
  }, []);

  return (
    <div>
      <h1>Doctor Chat</h1>
      {conversationUrl ? (
        <TavusCVIFrame conversationUrl={conversationUrl} />
      ) : (
        <p>Loading DoctorChat...</p>
      )}
    </div>
  );
}
