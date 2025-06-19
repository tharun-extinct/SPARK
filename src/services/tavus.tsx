import React from "react";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";

const TavusPage: React.FC = () => {
  return (
    <main className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Talk to DJ Kot (AI)</h1>
      <TavusCVIFrame
        replicaId="re8e740a42"       // DJ Kot's stock replica
        personaId="p24293d6"         // Celebrity DJ persona
        name="DJ Kot Conversation"
        context="Talk about the greatest hits from Daft Punk and electronic music evolution."
        greeting="Yo, DJ Kot in the house! What do you want to talk about?"
        enableEmotionDetection={true}
        enableCrisisIntervention={true}
        primaryColor="#6366f1"
        onConversationEnd={(transcript) => {
          console.log("Conversation ended", transcript);
        }}
      />
    </main>
  );
};

export default TavusPage;