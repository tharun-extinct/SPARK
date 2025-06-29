export interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  conversational_context: string;
  custom_greeting: string;
  properties: {
    enable_recording: boolean;
  };
}

export interface TavusConversationDetails {
  conversation_id: string;
  status: 'active' | 'completed' | 'failed';
  duration?: number;
  start_time?: string;
  end_time?: string;
  participant_count?: number;
  recording_url?: string;
  transcript?: string;
  metadata?: any;
}

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
}): Promise<TavusConversationResponse> => {
  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": '70285b696d38469bb4dd106924099ded',
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
    
    // Return the full response including conversation_id
    return {
      conversation_id: data.conversation_id,
      conversation_url: data.conversation_url,
      status: data.status,
      replica_id: data.replica_id,
      persona_id: data.persona_id,
      conversation_name: data.conversation_name,
      conversational_context: data.conversational_context,
      custom_greeting: data.custom_greeting,
      properties: data.properties
    };
  } catch (error) {
    console.error("Error creating Tavus conversation:", error);
    throw error;
  }
};

export const getTavusConversationDetails = async (conversationId: string): Promise<TavusConversationDetails> => {
  try {
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}?verbose=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": '70285b696d38469bb4dd106924099ded',
      },
    });
    
    console.log("Tavus conversation details response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch conversation details");
    }

    const data = await response.json();
    
    return {
      conversation_id: data.conversation_id,
      status: data.status,
      duration: data.duration,
      start_time: data.start_time,
      end_time: data.end_time,
      participant_count: data.participant_count,
      recording_url: data.recording_url,
      transcript: data.transcript,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Error fetching Tavus conversation details:", error);
    throw error;
  }
};

export default createTavusConversation;