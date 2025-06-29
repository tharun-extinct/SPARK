import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Interface for transcript segments
export interface TranscriptSegment {
	id: string;
	speaker: 'user' | 'ai';
	text: string;
	timestamp: Date;
	confidence?: number;
}

export type TranscriptionStatus = 'idle' | 'listening' | 'processing' | 'error';

// Hook for using transcription in components
export const useTranscription = () => {
	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
		isMicrophoneAvailable
	} = useSpeechRecognition({
		clearTranscriptOnListen: false,  // Keep transcript until manually reset
		commands: []  // No custom commands needed
	});

	const startListening = () => {
		console.log("Starting speech recognition...");
		if (browserSupportsSpeechRecognition) {
			try {
				SpeechRecognition.startListening({ 
					continuous: true,  // Keep listening until explicitly stopped
					language: 'en-US',  // Set language to English
					interimResults: true  // Get results as they are processed
				});
				console.log("Speech recognition started successfully");
			} catch (error) {
				console.error("Error starting speech recognition:", error);
			}
		} else {
			console.warn("Speech recognition not supported in this browser");
		}
	};

	const stopListening = () => {
		console.log("Stopping speech recognition...");
		try {
			SpeechRecognition.stopListening();
			console.log("Speech recognition stopped successfully");
		} catch (error) {
			console.error("Error stopping speech recognition:", error);
		}
	};

	const clearTranscript = () => {
		console.log("Clearing transcript...");
		try {
			resetTranscript();
			console.log("Transcript cleared successfully");
		} catch (error) {
			console.error("Error clearing transcript:", error);
		}
	};

	// Debug logs for tracking transcript changes
	if (transcript && transcript.trim() !== '') {
		console.log("Transcript updated:", transcript);
	}

	return {
		transcript,
		isListening: listening,
		startListening,
		stopListening,
		resetTranscript: clearTranscript,
		isSupported: browserSupportsSpeechRecognition,
		isMicrophoneAvailable
	};
};

// Process Tavus messages from postMessage communication
export const processTavusMessage = (event: MessageEvent): TranscriptSegment | null => {
	console.log("Processing potential Tavus message from origin:", event.origin);
	
	// Accept messages from any origin during development and testing
	// In production, you'd want to restrict to specific domains
	try {
		const data = typeof event.data === 'string' 
			? JSON.parse(event.data) 
			: event.data;
		
		console.log("Message data:", data);
		
		// Check for various possible formats of transcript data
		if (data) {
			let text = null;
			
			// Try to extract transcript text from different possible formats
			if (data.type === 'speech' && data.text) {
				text = data.text;
			} else if (data.event === 'speech' && data.text) {
				text = data.text;
			} else if (data.type === 'transcript' && data.text) {
				text = data.text;
			} else if (data.content && data.content.text) {
				text = data.content.text;
			} else if (data.message && typeof data.message === 'string') {
				text = data.message;
			}
			
			if (text) {
				console.log("Extracted transcript text:", text);
				return {
					id: `tavus-${Date.now()}`,
					speaker: 'ai',
					text: text,
					timestamp: new Date(),
					confidence: data.confidence || 1.0
				};
			}
		}
	} catch (error) {
		console.error('Error processing message:', error);
	}
	
	return null;
};

// Helper function to convert TranscriptSegments to a readable transcript
export const formatTranscript = (segments: TranscriptSegment[]): string => {
	return segments
		.map(segment => `${segment.speaker === 'ai' ? 'AI' : 'You'}: ${segment.text}`)
		.join('\n\n');
};

export default useTranscription;
