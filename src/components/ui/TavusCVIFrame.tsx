import React, { useEffect, useRef, useState } from "react";
import { createTavusConversation } from "@/lib/tavus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Info, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, RefreshCw, Download, X } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  emotion?: "neutral" | "happy" | "sad" | "confused" | "surprised" | "angry" | "concerned";
}

interface TavusCVIFrameProps {
  replicaId: string;
  personaId: string;
  name: string;
  context: string;
  greeting: string;
  mode?: "fullscreen" | "embedded";
  enableSidebar?: boolean;
  enableEmotionDetection?: boolean;
  enableCrisisIntervention?: boolean;
  onConversationEnd?: (transcript: Message[]) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const TavusCVIFrame: React.FC<TavusCVIFrameProps> = ({
  replicaId,
  personaId,
  name,
  context,
  greeting,
  mode = "embedded",
  enableSidebar = true,
  enableEmotionDetection = true,
  enableCrisisIntervention = true,
  onConversationEnd,
  primaryColor = "#6366f1",
  secondaryColor = "#f9fafb",
}) => {
  const [conversationUrl, setConversationUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [isCrisisMode, setIsCrisisMode] = useState<boolean>(false);
  const [sessionQuality, setSessionQuality] = useState<number>(100);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoading(true);
        const url = await createTavusConversation({
          replicaId,
          personaId,
          name,
          context,
          greeting,
        });
        
        setConversationUrl(url);
        setMessages([
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: greeting,
            timestamp: new Date(),
            emotion: "neutral"
          }
        ]);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Tavus conversation:", err);
        setError("Failed to initialize the video conversation. Please try again later.");
        setIsLoading(false);
      }
    };

    initConversation();
  }, [replicaId, personaId, name, context, greeting]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Listen for CVI events from the iframe
  useEffect(() => {
    const handleCVIMessage = (event: MessageEvent) => {
      // Make sure the message is from Tavus
      if (event.origin !== "https://tavus.com" && !event.origin.includes("tavusapi.com")) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Handle different event types
        switch (data.type) {
          case "tavus:message":
            // Add AI message to chat
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              sender: "ai",
              text: data.message,
              timestamp: new Date(),
              emotion: data.emotion || "neutral"
            }]);
            
            // Update current emotion if detected
            if (enableEmotionDetection && data.emotion) {
              setCurrentEmotion(data.emotion);
            }
            
            // Check for crisis keywords
            if (enableCrisisIntervention && 
                (data.message.toLowerCase().includes("suicide") || 
                 data.message.toLowerCase().includes("harm") ||
                 data.message.toLowerCase().includes("kill") ||
                 data.message.toLowerCase().includes("die"))) {
              setIsCrisisMode(true);
            }
            break;
            
          case "tavus:session_quality":
            setSessionQuality(data.quality);
            break;
            
          case "tavus:conversation_ended":
            if (onConversationEnd) {
              onConversationEnd(messages);
            }
            break;
            
          default:
            console.log("Unhandled Tavus event:", data);
        }
      } catch (err) {
        console.error("Error handling Tavus message:", err);
      }
    };
    
    window.addEventListener("message", handleCVIMessage);
    return () => window.removeEventListener("message", handleCVIMessage);
  }, [messages, enableEmotionDetection, enableCrisisIntervention, onConversationEnd]);
  // Listen for CVI events from the iframe
  useEffect(() => {
    const handleCVIMessage = (event: MessageEvent) => {
      // Make sure the message is from Tavus
      if (event.origin !== "https://tavus.com" && !event.origin.includes("tavusapi.com")) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Handle different event types
        switch (data.type) {
          case "tavus:message":
            // Add AI message to chat
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              sender: "ai",
              text: data.message,
              timestamp: new Date(),
              emotion: data.emotion || "neutral"
            }]);
            
            // Update current emotion if detected
            if (enableEmotionDetection && data.emotion) {
              setCurrentEmotion(data.emotion);
            }
            
            // Check for crisis keywords
            if (enableCrisisIntervention && 
                (data.message.toLowerCase().includes("suicide") || 
                 data.message.toLowerCase().includes("harm") ||
                 data.message.toLowerCase().includes("kill") ||
                 data.message.toLowerCase().includes("die"))) {
              setIsCrisisMode(true);
            }
            break;
            
          case "tavus:session_quality":
            setSessionQuality(data.quality);
            break;
            
          case "tavus:conversation_ended":
            if (onConversationEnd) {
              onConversationEnd(messages);
            }
            break;
            
          default:
            console.log("Unhandled Tavus event:", data);
        }
      } catch (err) {
        console.error("Error handling Tavus message:", err);
      }
    };
    
    window.addEventListener("message", handleCVIMessage);
    return () => window.removeEventListener("message", handleCVIMessage);
  }, [messages, enableEmotionDetection, enableCrisisIntervention, onConversationEnd]);

  // Listen for CVI events from the iframe
  useEffect(() => {
    const handleCVIMessage = (event: MessageEvent) => {
      // Make sure the message is from Tavus
      if (event.origin !== "https://tavus.com" && !event.origin.includes("tavusapi.com")) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Handle different event types
        switch (data.type) {
          case "tavus:message":
            // Add AI message to chat
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              sender: "ai",
              text: data.message,
              timestamp: new Date(),
              emotion: data.emotion || "neutral"
            }]);
            
            // Update current emotion if detected
            if (enableEmotionDetection && data.emotion) {
              setCurrentEmotion(data.emotion);
            }
            
            // Check for crisis keywords
            if (enableCrisisIntervention && 
                (data.message.toLowerCase().includes("suicide") || 
                 data.message.toLowerCase().includes("harm") ||
                 data.message.toLowerCase().includes("kill") ||
                 data.message.toLowerCase().includes("die"))) {
              setIsCrisisMode(true);
            }
            break;
            
          case "tavus:session_quality":
            setSessionQuality(data.quality);
            break;
            
          case "tavus:conversation_ended":
            if (onConversationEnd) {
              onConversationEnd(messages);
            }
            break;
            
          default:
            console.log("Unhandled Tavus event:", data);
        }
      } catch (err) {
        console.error("Error handling Tavus message:", err);
      }
    };
    
    window.addEventListener("message", handleCVIMessage);
    return () => window.removeEventListener("message", handleCVIMessage);
  }, [messages, enableEmotionDetection, enableCrisisIntervention, onConversationEnd]);

  // Toggle microphone
  const toggleMicrophone = () => {
    setIsMicEnabled(prev => !prev);
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "tavus:toggle_microphone",
        enabled: !isMicEnabled
      }, "*");
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraEnabled(prev => !prev);
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "tavus:toggle_camera",
        enabled: !isCameraEnabled
      }, "*");
    }
  };  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add message to local chat
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send message to Tavus CVI iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "tavus:send_message",
        message: inputValue
      }, "*");
    }
    
    setInputValue("");
  };
  
  // Toggle audio
  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "tavus:toggle_audio",
        enabled: !isAudioEnabled
      }, "*");
    }
  };

  // Reset conversation
  const resetConversation = async () => {
    try {
      setIsLoading(true);
      setMessages([]);
      
      const url = await createTavusConversation({
        replicaId,
        personaId,
        name,
        context,
        greeting,
      });
      
      setConversationUrl(url);
      setMessages([
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: greeting,
          timestamp: new Date(),
          emotion: "neutral"
        }
      ]);
      
      setIsCrisisMode(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to reset Tavus conversation:", err);
      setError("Failed to reset the conversation. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle crisis intervention
  const handleCrisisIntervention = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "tavus:crisis_intervention",
        enabled: true
      }, "*");
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: "ai",
        text: "I've noticed this conversation contains concerning content. I'm connecting you with a human specialist who can better assist you. Please wait a moment.",
        timestamp: new Date(),
        emotion: "concerned"
      }]);
    }
  };

  // Download transcript
  const downloadTranscript = () => {
    try {
      const transcript = messages.map(msg => 
        `[${msg.timestamp.toLocaleTimeString()}] ${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`
      ).join('\n\n');
      
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download transcript:", err);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-lg">Initializing conversation...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <Card className="p-6 max-w-md">
          <div className="text-center space-y-4">
            <div className="bg-red-100 text-red-800 p-3 rounded-full inline-flex">
              <X size={24} />
            </div>
            <h3 className="text-xl font-semibold">Connection Error</h3>
            <p className="text-gray-500">{error}</p>
            <Button onClick={resetConversation}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Apply layout classes based on mode
  const containerClasses = mode === "fullscreen" 
    ? "w-full h-screen flex flex-col md:flex-row overflow-hidden"
    : "w-full h-[600px] flex flex-col md:flex-row overflow-hidden rounded-xl shadow-lg";

  // Crisis intervention alert
  const crisisAlert = isCrisisMode && (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Support Notice
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              This conversation may contain concerning content. Would you like to speak with a human specialist?
            </p>
          </div>
          <div className="mt-3">
            <Button variant="destructive" onClick={handleCrisisIntervention} size="sm">
              Connect with Specialist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={containerClasses} style={{ 
      backgroundColor: secondaryColor,
      "--primary": primaryColor,
    } as React.CSSProperties}>
      {/* Video Container */}
      <div className={enableSidebar ? "flex-1" : "w-full h-full"}>
        {isCrisisMode && crisisAlert}
        
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Video Frame */}
          <iframe
            ref={iframeRef}
            src={conversationUrl}
            title="Tavus CVI"
            allow="microphone; camera"
            className="w-full h-full border-none"
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-full">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMicrophone} 
              className={`rounded-full ${!isMicEnabled ? 'bg-red-500/20 text-red-500' : 'text-white'}`}
            >
              {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCamera} 
              className={`rounded-full ${!isCameraEnabled ? 'bg-red-500/20 text-red-500' : 'text-white'}`}
            >
              {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleAudio} 
              className={`rounded-full ${!isAudioEnabled ? 'bg-red-500/20 text-red-500' : 'text-white'}`}
            >
              {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
          </div>
          
          {/* Session Quality Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant={sessionQuality > 70 ? "default" : sessionQuality > 40 ? "secondary" : "destructive"}>
              {sessionQuality > 70 ? "Excellent" : sessionQuality > 40 ? "Good" : "Poor"} Connection
            </Badge>
          </div>
          
          {/* Emotion Badge */}
          {enableEmotionDetection && (
            <div className="absolute top-4 left-4">
              <Badge variant="outline" className="bg-black/30 backdrop-blur-sm text-white">
                {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar with Tabs */}
      {enableSidebar && (
        <div className="w-full md:w-96 h-full border-l border-gray-200 flex flex-col">
          <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
            <div className="border-b border-gray-200">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="info">
                  <Info className="mr-2 h-4 w-4" />
                  Info
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4" ref={chatScrollRef}>
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.text}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.emotion && message.sender === 'ai' && (
                            <span className="ml-2">• {message.emotion}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              
              <Separator />
              
              <div className="p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">Send</Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Info Tab */}
            <TabsContent value="info" className="h-full flex-1 p-4 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">About this AI</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This AI assistant is powered by Tavus CVI (Conversational Video Interface) 
                    using advanced models for natural conversation.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Key Features</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <span>Phoenix-3 lifelike avatar with natural facial movements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <span>Raven-0 emotional perception and ambient awareness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <span>Sparrow-0 natural turn-taking and conversation rhythm</span>
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Session Controls</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={resetConversation} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    
                    <Button variant="outline" onClick={downloadTranscript} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Transcript
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default TavusCVIFrame;
