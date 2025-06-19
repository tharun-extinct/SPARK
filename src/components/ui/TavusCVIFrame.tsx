import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Video, VideoOff, Phone, Send, MoreVertical, Maximize2, Minimize2 } from "lucide-react";

interface Message {
	id: string;
	sender: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

interface TavusCVIFrameProps {
	conversationUrl: string;
	agentName?: string;
	agentAvatar?: string;
	onEndCall?: () => void;
	onSendMessage?: (message: string) => void;
	messages?: Message[];
}

export const TavusCVIFrame = ({ 
	conversationUrl, 
	agentName = "AI Assistant", 
	agentAvatar,
	onEndCall,
	onSendMessage,
	messages = []
}: TavusCVIFrameProps) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [message, setMessage] = useState("");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(true);
	const [isAudioOn, setIsAudioOn] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [localMessages, setLocalMessages] = useState<Message[]>(messages);

	// Scroll to bottom whenever messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [localMessages, messages]);

	useEffect(() => {
		if (messages.length > 0) {
			setLocalMessages(messages);
		}
	}, [messages]);

	useEffect(() => {
		if (iframeRef.current && conversationUrl) {
			iframeRef.current.src = conversationUrl;
		}
	}, [conversationUrl]);

	const handleSendMessage = () => {
		if (message.trim() === "") return;

		// If there's an external handler, use it
		if (onSendMessage) {
			onSendMessage(message);
		} else {
			// Otherwise, handle locally
			const newMessage: Message = {
				id: Date.now().toString(),
				sender: 'user',
				content: message,
				timestamp: new Date(),
			};

			setLocalMessages(prev => [...prev, newMessage]);
		}

		setMessage("");
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const toggleVideo = () => {
		setIsVideoOn(!isVideoOn);
		// In a real implementation, you would send a message to the iframe to toggle video
	};

	const toggleAudio = () => {
		setIsAudioOn(!isAudioOn);
		// In a real implementation, you would send a message to the iframe to toggle audio
	};
	return (
		<div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'rounded-xl overflow-hidden border shadow-md h-full'}`}>
			{/* Header with agent info and controls */}
			<div className="flex items-center justify-between p-2 bg-primary/5 border-b">
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8 border-2 border-primary/20">
						{agentAvatar ? (
							<AvatarImage src={agentAvatar} alt={agentName} />
						) : (
							<AvatarFallback className="bg-primary text-primary-foreground">
								{agentName.charAt(0)}
							</AvatarFallback>
						)}
					</Avatar>
					<div>
						<h3 className="font-medium text-sm">{agentName}</h3>
						<p className="text-xs text-muted-foreground">Mental Wellness Assistant</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" className="rounded-full h-7 w-7" onClick={toggleFullscreen}>
						{isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
					</Button>
				</div>
			</div>

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Video area */}
				<div className="flex-1 relative">
					<iframe
						ref={iframeRef}
						title="Tavus CVI"
						allow="microphone; camera"
						className="w-full h-full border-none"
					/>					{/* Video controls overlay at bottom */}
					<div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 p-1 bg-background/80 backdrop-blur-sm rounded-full shadow-md">
						<Button
							variant="ghost"
							size="icon"
							className={`rounded-full h-7 w-7 ${!isAudioOn ? 'bg-destructive/10 text-destructive' : ''}`}
							onClick={toggleAudio}
						>
							{isAudioOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={`rounded-full h-7 w-7 ${!isVideoOn ? 'bg-destructive/10 text-destructive' : ''}`}
							onClick={toggleVideo}
						>
							{isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
						</Button>
						<Button
							variant="destructive"
							size="icon"
							className="rounded-full h-7 w-7"
							onClick={onEndCall}
						>
							<Phone className="h-3 w-3 rotate-135" />
						</Button>
					</div>
				</div>				{/* Chat panel */}
				<div className="w-1/3 min-w-[250px] border-l flex flex-col bg-background">
					<div className="p-2 border-b">
						<h3 className="font-medium text-sm">Conversation</h3>
					</div>

					{/* Messages area */}
					<ScrollArea className="flex-1 p-2">
						<div className="space-y-3">
							{(localMessages.length > 0 ? localMessages : messages).map((msg) => (
								<div
									key={msg.id}
									className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[80%] rounded-lg p-2 ${
											msg.sender === 'user'
												? 'bg-primary text-primary-foreground ml-8'
												: 'bg-muted mr-8'
										}`}
									>
										<p className="text-xs">{msg.content}</p>
										<span className="text-[10px] opacity-70 mt-1 block text-right">
											{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>					{/* Message input */}
					<div className="p-2 border-t flex gap-1">
						<Input
							placeholder="Type your message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
							className="flex-1 text-xs h-8"
						/>
						<Button onClick={handleSendMessage} size="icon" className="h-8 w-8">
							<Send className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TavusCVIFrame;
