// Configuration for Tavus AI models
export const TAVUS_MODELS = {
	PHOENIX: {
		id: 'phoenix-3',
		name: 'Phoenix-3',
		description: 'Lifelike avatar generation with natural facial movements'
	},
	RAVEN: {
		id: 'raven-0',
		name: 'Raven-0',
		description: 'Advanced emotional perception and ambient awareness'
	},
	SPARROW: {
		id: 'sparrow-0',
		name: 'Sparrow-0',
		description: 'Natural turn-taking and conversation rhythm'
	}
};

// Predefined personas for different wellness conversations
export const TAVUS_PERSONAS = {
	THERAPIST: {
		id: 'wellness-therapist-1',
		name: 'Supportive Therapist',
		description: 'A calm, empathetic therapist focused on cognitive behavioral techniques'
	},
	COACH: {
		id: 'wellness-coach-1',
		name: 'Motivational Coach',
		description: 'An energetic coach who helps build positive mental habits'
	},
	FRIEND: {
		id: 'wellness-companion-1',
		name: 'Friendly Companion',
		description: 'A supportive friend who listens and offers gentle guidance'
	},
	MEDITATION: {
		id: 'meditation-guide-1',
		name: 'Meditation Guide',
		description: 'A soothing presence to guide mindfulness and meditation practices'
	}
};

// API key management
const TAVUS_API_KEY = 'f1c7b8671f24473bad8f3a6a482f0f68';

// Base URL for Tavus API
const TAVUS_API_BASE = 'https://tavusapi.com/v2';

// Error handling helper
const handleTavusError = async (response: Response) => {
	try {
		const error = await response.json();
		throw new Error(error.message || `Tavus API request failed with status ${response.status}`);
	} catch (e) {
		throw new Error(`Tavus API request failed with status ${response.status}`);
	}
};

/**
 * Creates a new conversation with a Tavus AI assistant
 */
export const createTavusConversation = async ({
	replicaId,
	personaId,
	name,
	context,
	greeting,
	enableRecording = true,
}: {
	replicaId: string;
	personaId: string;
	name: string;
	context: string;
	greeting: string;
	enableRecording?: boolean;
}): Promise<{conversationId: string; conversationUrl: string}> => {
	const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": TAVUS_API_KEY,
		},
		body: JSON.stringify({
			replica_id: replicaId,
			persona_id: personaId,
			conversation_name: name,
			conversational_context: context,
			custom_greeting: greeting,
			properties: {
				enable_recording: enableRecording,
			},
		}),
	});

	if (!response.ok) {
		await handleTavusError(response);
	}

	const data = await response.json();
	return {
		conversationId: data.conversation_id,
		conversationUrl: data.conversation_url
	};
};

/**
 * Retrieves a list of available Tavus conversations
 */
export const getConversations = async (limit = 10): Promise<any[]> => {
	const response = await fetch(`${TAVUS_API_BASE}/conversations?limit=${limit}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": TAVUS_API_KEY,
		},
	});

	if (!response.ok) {
		await handleTavusError(response);
	}

	const data = await response.json();
	return data.conversations || [];
};

/**
 * Gets a specific conversation by ID
 */
export const getConversationById = async (conversationId: string): Promise<any> => {
	const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": TAVUS_API_KEY,
		},
	});

	if (!response.ok) {
		await handleTavusError(response);
	}

	return await response.json();
};

/**
 * Sends a message to an existing conversation
 */
export const sendMessage = async (conversationId: string, message: string): Promise<any> => {
	const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/messages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": TAVUS_API_KEY,
		},
		body: JSON.stringify({
			content: message,
		}),
	});

	if (!response.ok) {
		await handleTavusError(response);
	}

	return await response.json();
};

/**
 * Gets conversation history
 */
export const getConversationHistory = async (conversationId: string, limit = 50): Promise<any[]> => {
	const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/messages?limit=${limit}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": TAVUS_API_KEY,
		},
	});

	if (!response.ok) {
		await handleTavusError(response);
	}

	const data = await response.json();
	return data.messages || [];
};

/**
 * Generate context for a new wellness conversation based on user preferences
 */
export const generateWellnessContext = (userPreferences: {
	name: string;
	concerns?: string[];
	history?: string;
	goals?: string[];
}) => {
	const { name, concerns = [], history = '', goals = [] } = userPreferences;
	
	return `
This is a wellness conversation with ${name}. 
${concerns.length > 0 ? `Their primary concerns are: ${concerns.join(', ')}. ` : ''}
${history ? `Relevant background: ${history}. ` : ''}
${goals.length > 0 ? `Their wellness goals include: ${goals.join(', ')}. ` : ''}
Approach the conversation with empathy, active listening, and evidence-based support techniques.
If they show signs of crisis, follow the proper escalation protocols.
`;
};

/**
 * Generate a personalized greeting for a new conversation
 */
export const generateGreeting = (userName: string, personaType: keyof typeof TAVUS_PERSONAS) => {
	const greetings = {
		THERAPIST: `Hello ${userName}, I'm here to provide a safe space for you today. How are you feeling right now?`,
		COACH: `Hi ${userName}! I'm excited to work with you on building positive mental wellness habits. What would you like to focus on today?`,
		FRIEND: `Hey ${userName}! It's great to connect with you. I'm here to chat about whatever's on your mind.`,
		MEDITATION: `Welcome, ${userName}. Let's take a moment to center ourselves. How are you feeling in this present moment?`
	};
	
	return greetings[personaType] || `Hello ${userName}, I'm your SPARK wellness assistant. How can I support you today?`;
};

// Default export contains all functions
const tavusService = {
	createTavusConversation,
	getConversations,
	getConversationById,
	sendMessage,
	getConversationHistory,
	generateWellnessContext,
	generateGreeting,
	models: TAVUS_MODELS,
	personas: TAVUS_PERSONAS
};

export default tavusService;