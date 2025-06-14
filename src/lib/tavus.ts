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
      "x-api-key": 'f1c7b8671f24473bad8f3a6a482f0f68', // safer than hardcoding
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