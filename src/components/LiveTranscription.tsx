import React, { useState, useEffect, useRef } from 'react';
import { IconMicrophone, IconMicrophoneOff, IconCopy, IconDownload } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranscription, TranscriptSegment, processTavusMessage } from '@/services/transcriptionService';

interface LiveTranscriptionProps {
	tavusIframeRef?: React.RefObject<HTMLIFrameElement>;
	className?: string;
	onTranscriptReceived?: (text: string) => void;
	isListening?: boolean;
	onToggleListening?: () => void;
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({
	tavusIframeRef,
	className = "",
	onTranscriptReceived,
	isListening: externalIsListening,
	onToggleListening
}) => {
	const [segments, setSegments] = useState<TranscriptSegment[]>([]);
	const { toast } = useToast();
	const transcriptRef = useRef<HTMLDivElement>(null);
	
	const {
		transcript,
		isListening: internalIsListening,
		startListening,
		stopListening,
		resetTranscript,
		isSupported,
	} = useTranscription();
	
	// Use either external or internal listening state
	const isListening = externalIsListening !== undefined ? externalIsListening : internalIsListening;
	
	// Process browser speech recognition for user's voice
	useEffect(() => {
		if (transcript && transcript.trim() !== '') {
			console.log("LiveTranscription received transcript:", transcript);
			
			const newSegment: TranscriptSegment = {
				id: `user-${Date.now()}`,
				speaker: 'user',
				text: transcript,
				timestamp: new Date()
			};
			
			setSegments(prev => [...prev, newSegment]);
			
			// Pass transcript up to parent if callback provided
			if (onTranscriptReceived && transcript.trim().length > 3) {
				onTranscriptReceived(transcript);
			}
			
			resetTranscript();
		}
	}, [transcript, onTranscriptReceived]);
	
	// Set up listener for Tavus speech events
	useEffect(() => {
		const handleTavusMessage = (event: MessageEvent) => {
			console.log("LiveTranscription handling message event:", event.origin);
			
			const segment = processTavusMessage(event);
			if (segment) {
				console.log("LiveTranscription processed segment:", segment);
				setSegments(prev => [...prev, segment]);
			}
		};
		
		window.addEventListener('message', handleTavusMessage);
		return () => {
			window.removeEventListener('message', handleTavusMessage);
		};
	}, []);
	
	// Auto-scroll transcript to bottom
	useEffect(() => {
		if (transcriptRef.current && segments.length > 0) {
			transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
		}
	}, [segments]);
	
	const toggleTranscription = () => {
		if (onToggleListening) {
			// Use external toggle if provided
			onToggleListening();
		} else {
			// Otherwise use internal toggle
			if (isListening) {
				stopListening();
			} else {
				startListening();
			}
		}
	};
	
	const copyTranscript = () => {
		const text = segments.map(s => `${s.speaker === 'ai' ? 'AI' : 'You'}: ${s.text}`).join('\n\n');
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied to clipboard",
			description: "The transcript has been copied to your clipboard."
		});
	};
	
	const downloadTranscript = () => {
		const text = segments.map(s => `${s.speaker === 'ai' ? 'AI' : 'You'} (${s.timestamp.toLocaleTimeString()}): ${s.text}`).join('\n\n');
		
		const element = document.createElement('a');
		const file = new Blob([text], {type: 'text/plain'});
		element.href = URL.createObjectURL(file);
		element.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		
		toast({
			title: "Transcript downloaded",
			description: "The transcript has been saved to your downloads."
		});
	};
	
	if (!isSupported) {
		return (
			<div className={`bg-amber-50 text-amber-800 p-3 rounded-md text-sm ${className}`}>
				Your browser doesn't support speech recognition.
			</div>
		);
	}
	
	return (
		<div className={`bg-white rounded-lg shadow-sm flex flex-col ${className}`}>
			<div className="p-3 border-b flex items-center justify-between">
				<h2 className="font-semibold">Conversation Transcript</h2>
				<div className="flex space-x-1">
					<Button
						variant={isListening ? "destructive" : "outline"}
						size="sm"
						onClick={toggleTranscription}
						title={isListening ? "Stop voice input" : "Start voice input"}
					>
						{isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={copyTranscript}
						disabled={segments.length === 0}
						title="Copy transcript"
					>
						<IconCopy size={16} />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={downloadTranscript}
						disabled={segments.length === 0}
						title="Download transcript"
					>
						<IconDownload size={16} />
					</Button>
				</div>
			</div>
			
			<div 
				ref={transcriptRef}
				className="flex-1 p-4 overflow-y-auto"
			>
				{segments.length === 0 ? (
					<div className="text-center text-gray-400 py-4">
						{isListening 
							? "Listening... Speak to start the conversation."
							: "Your conversation will appear here. Use the mic button or type below to start."
						}
					</div>
				) : (
					<div className="space-y-4">
						{segments.map((segment) => (
							<div key={segment.id} className="text-sm">
								<span className={`font-semibold ${segment.speaker === 'ai' ? 'text-blue-600' : 'text-gray-700'}`}>
									{segment.speaker === 'ai' ? 'AI: ' : 'You: '}
								</span>
								<span>{segment.text}</span>
								<div className="text-xs text-gray-400 mt-1">
									{segment.timestamp.toLocaleTimeString()}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default LiveTranscription;
