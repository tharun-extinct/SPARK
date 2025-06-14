// src/pages/doctor.tsx

import { useEffect, useState } from "react";
import { createTavusConversation } from "@/lib/tavus";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";

export default function DoctorPage() {
  const [conversationUrl, setConversationUrl] = useState("");

  useEffect(() => {
    createTavusConversation({
    replicaId: "rc2146c13e81", // replace with actual replica ID
    personaId: "peebe852d86b", // replace with actual persona ID
    name: "Doctor Chat",
    context: "You are a helpful virtual doctor giving medical advice.",
    greeting: "Hello! How can I assist with your health today?",
  })
      .then(setConversationUrl)
      .catch((err) => {
        console.error("Failed to start conversation", err);
      });
  }, []);

  return (
    <div>
      <h1>Mental Chat</h1>
      {conversationUrl ? (
        <TavusCVIFrame conversationUrl={conversationUrl} />
      ) : (
        <p>Loading DoctorChat...</p>
      )}
    </div>
  );
}
