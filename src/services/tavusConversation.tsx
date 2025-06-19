import { useState, useEffect } from 'react';
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";
import tavusService, { TAVUS_MODELS, TAVUS_PERSONAS } from "@/lib/tavus";

// Wellness assistants configuration for the UI selector
export const wellnessAssistants = {
	therapist: {
		id: 'therapist',
		name: "Dr. Anna",
		title: "Mental Health Therapist",
		description: "Specializes in cognitive behavioral therapy and mindfulness techniques.",
		modelId: TAVUS_MODELS.PHOENIX.id,
		personaId: TAVUS_PERSONAS.THERAPIST.id,
		avatar: "/placeholder.svg"
	},
	coach: {
		id: 'coach',
		name: "Dr. James",
		title: "Wellness Coach",
		description: "Guides holistic well-being through lifestyle, nutrition, and stress management.",
		modelId: TAVUS_MODELS.RAVEN.id,
		personaId: TAVUS_PERSONAS.COACH.id,
		avatar: "/placeholder.svg"
	},
	meditation: {
		id: 'meditation',
		name: "Maya",
		title: "Meditation Guide",
		description: "Provides guided meditation and mindfulness practices for stress reduction.",
		modelId: TAVUS_MODELS.SPARROW.id,
		personaId: TAVUS_PERSONAS.MEDITATION.id,
		avatar: "/placeholder.svg"
	},
	companion: {
		id: 'companion',
		name: "Sam",
		title: "Supportive Companion",
		description: "A friendly, non-judgmental companion for daily emotional support.",
		modelId: TAVUS_MODELS.PHOENIX.id,
		personaId: TAVUS_PERSONAS.FRIEND.id,
		avatar: "/placeholder.svg"
	}
};

interface TavusConversationProps {
	assistantType?: keyof typeof wellnessAssistants;
	userName?: string;
	userConcerns?: string[];
}

// Component for starting and displaying a Tavus conversation
export default function TavusConversation({ 
	assistantType = 'therapist',
	userName = 'Friend',
	userConcerns = []
}: TavusConversationProps) {
	const [conversationUrl, setConversationUrl] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	const assistant = wellnessAssistants[assistantType];

	useEffect(() => {
		const startConversation = async () => {
			setIsLoading(true);
			setError(null);
			
			try {
				// Generate context and greeting
				const context = tavusService.generateWellnessContext({
					name: userName,
					concerns: userConcerns,
				});
				
				const greeting = tavusService.generateGreeting(
					userName, 
					assistantType === 'therapist' ? 'THERAPIST' : 
					assistantType === 'coach' ? 'COACH' : 
					assistantType === 'meditation' ? 'MEDITATION' : 'FRIEND'
				);
				
				// Create conversation
				const result = await tavusService.createTavusConversation({
					replicaId: assistant.modelId,
					personaId: assistant.personaId,
					name: `${assistant.name} Conversation with ${userName}`,
					context,
					greeting,
				});
				
				setConversationUrl(result.conversationUrl);
			} catch (err: any) {
				console.error("Failed to start conversation:", err);
				setError(err.message || "Failed to start conversation");
			} finally {
				setIsLoading(false);
			}
		};
		
		startConversation();
	}, [assistantType, userName, userConcerns]);

	if (error) {
		return (
			<div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
				<h3 className="font-bold mb-2">Error Starting Conversation</h3>
				<p>{error}</p>
				<button 
					className="mt-4 px-4 py-2 bg-red-100 rounded-md border border-red-300 hover:bg-red-200"
					onClick={() => window.location.reload()}
				>
					Try Again
				</button>
			</div>
		);
	}

	if (isLoading || !conversationUrl) {
		return (
			<div className="p-6 flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
				<div className="text-center">
					<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
					<p>Connecting to your {assistant.title}...</p>
				</div>
			</div>
		);
	}

	return (
		<TavusCVIFrame 
			conversationUrl={conversationUrl}
			agentName={assistant.name}
			agentAvatar={assistant.avatar}
		/>
	);
}
