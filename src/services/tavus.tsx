import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";

export default function TavusPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Talk to DJ Kot (AI)</h1>
      <TavusCVIFrame
        replicaId="re8e740a42"       // DJ Kot’s stock replica
        personaId="p24293d6"         // Celebrity DJ persona
        name="DJ Kot Conversation"
        context="Talk about the greatest hits from Daft Punk and electronic music evolution."
        greeting="Yo, DJ Kot in the house! What do you want to talk about?"
      />
    </main>
  );
}