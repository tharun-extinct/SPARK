export const createTavusConversation = async ({
  replicaId,
  personaId,
  name,
  context,
  greeting,
}: {
  replicaId: string;
  personaId: string;
  name: string;
  context: string;
  greeting: string;
}): Promise<string> => {
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": '70285b696d38469bb4dd106924099ded', // safer than hardcoding
      },
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: name,
      conversational_context: context,
      custom_greeting: greeting,
      properties: {
        enable_recording: true,
      },
    }),
  });
  console.log("Tavus API response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tavus API request failed");
  }

  const data = await response.json();
  return data.conversation_url;
};

export default createTavusConversation;