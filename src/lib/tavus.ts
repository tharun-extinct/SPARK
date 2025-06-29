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
  events?: TavusEvent[];
  shutdown_reason?: string;
  perception_analysis?: any;
  replica_joined_time?: string;
}

export interface TavusEvent {
  event_type: string;
  timestamp: string;
  properties?: any;
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

export const getTavusConversationDetails = async (conversationId: string, verbose: boolean = true): Promise<TavusConversationDetails> => {
  try {
    const url = `https://tavusapi.com/v2/conversations/${conversationId}${verbose ? '?verbose=true' : ''}`;
    const response = await fetch(url, {
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
    
    // Process events if verbose data is available
    let processedData: TavusConversationDetails = {
      conversation_id: data.conversation_id,
      status: data.status,
      duration: data.duration,
      start_time: data.start_time,
      end_time: data.end_time,
      participant_count: data.participant_count,
      recording_url: data.recording_url,
      transcript: data.transcript,
      metadata: data.metadata,
      events: data.events
    };

    // Extract specific event data if events are available
    if (data.events && Array.isArray(data.events)) {
      const events = data.events;
      
      // Find specific events
      const shutdownEvent = events.find((e: TavusEvent) => e.event_type === 'system.shutdown');
      const transcriptionEvent = events.find((e: TavusEvent) => e.event_type === 'application.transcription_ready');
      const perceptionEvent = events.find((e: TavusEvent) => e.event_type === 'application.perception_analysis');
      const replicaJoinedEvent = events.find((e: TavusEvent) => e.event_type === 'system.replica_joined');

      // Extract specific fields from their properties
      if (shutdownEvent) {
        processedData.shutdown_reason = shutdownEvent.properties?.shutdown_reason;
        processedData.end_time = shutdownEvent.timestamp;
      }

      if (transcriptionEvent) {
        processedData.transcript = transcriptionEvent.properties?.transcript;
      }

      if (perceptionEvent) {
        processedData.perception_analysis = perceptionEvent.properties?.analysis;
      }

      if (replicaJoinedEvent) {
        processedData.replica_joined_time = replicaJoinedEvent.timestamp;
        processedData.start_time = replicaJoinedEvent.timestamp;
      }

      console.log('🛑 Shutdown Reason:', processedData.shutdown_reason);
      console.log('⏱️ End Time:', processedData.end_time);
      console.log('🧠 Perception Analysis:', processedData.perception_analysis);
      console.log('🤖 Replica Joined:', processedData.replica_joined_time);
      console.log('📝 Transcript:', processedData.transcript);
    }
    
    return processedData;
  } catch (error) {
    console.error("Error fetching Tavus conversation details:", error);
    throw error;
  }
};

// Helper function to wait for transcript to be ready
export const waitForTranscript = async (conversationId: string, maxAttempts: number = 10, delayMs: number = 5000): Promise<TavusConversationDetails | null> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Checking for transcript (attempt ${attempt}/${maxAttempts})...`);
      const details = await getTavusConversationDetails(conversationId, true);
      
      // Check if transcript is available
      if (details.transcript && details.transcript.trim() !== '') {
        console.log('✅ Transcript is ready!');
        return details;
      }
      
      // Check if transcription event exists in events
      if (details.events) {
        const transcriptionEvent = details.events.find(e => e.event_type === 'application.transcription_ready');
        if (transcriptionEvent && transcriptionEvent.properties?.transcript) {
          console.log('✅ Transcript found in events!');
          return details;
        }
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Transcript not ready yet, waiting ${delayMs/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.log('⚠️ Transcript not available after maximum attempts');
  return null;
};

export default createTavusConversation;