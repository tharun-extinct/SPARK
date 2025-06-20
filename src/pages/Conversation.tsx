import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home, AlertTriangle, RefreshCw, Send, MessageSquare, Volume2, VolumeX, Maximize2, UserRound, MoreHorizontal, Bot } from "lucide-react";
import { createTavusConversation } from "@/lib/tavus";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";
import { useToast } from "@/components/ui/use-toast";

const Conversation = () => {
  const { agentType = "psychiatrist" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationUrl, setConversationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState("");

  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const agentInfo = {
    psychiatrist: {
      name: "Dr. Anna",
      context: "You are a helpful virtual doctor called Dr. Anna giving mental health advice. Be empathetic and supportive.",
      avatar: "👩‍⚕️",
      greeting: "Hello! I'm Dr.Anna, your mental health companion. How are you feeling today?",
      replicaId: "r6ae5b6efc9d",
      personaId: "p57b90fab974"
    },
    tutor: {
      name: "Alex",
      context: "You are a helpful virtual tutor called Alex providing learning assistance and educational guidance.",
      avatar: "👨‍🏫",
      greeting: "Hi there! I'm Alex, your learning companion. What would you like to explore today?",
      replicaId: "rc2146c13e81",
      personaId: "peebe852d86b"
    },
    doctor: {
      name: "Dr. James",
      context: "You are a helpful virtual wellness coach called Dr. James providing physical health and wellness advice.",
      avatar: "👨‍⚕️",
      greeting: "Good day! I'm Dr. James, your wellness assistant. How can I help with your health today?",
      replicaId: "r4d9b2288937",
      personaId: "paf8f3186bed"
    }
  };

  const currentAgent = agentInfo[agentType as keyof typeof agentInfo] || agentInfo.psychiatrist;

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Initializing conversation with ${currentAgent.name}...`);
      
      const url = await createTavusConversation({
        replicaId: currentAgent.replicaId,
        personaId: currentAgent.personaId,
        name: `${currentAgent.name} Conversation`,
        context: currentAgent.context,
        greeting: currentAgent.greeting,
      });
      
      setConversationUrl(url);
      setConversationStarted(true);
      setIsLoading(false);
      
      toast({
        title: "Connection Established",
        description: `Successfully connected to ${currentAgent.name}`,
      });
      
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
      
      let errorMessage = "Unable to connect to the AI assistant.";
      
      // Handle different types of errors
      if (err.message?.includes("network") || err.message?.includes("fetch")) {
        errorMessage = "Network connection issue. Please check your internet connection.";
      } else if (err.message?.includes("API") || err.message?.includes("401") || err.message?.includes("403")) {
        errorMessage = "Service temporarily unavailable. Our team has been notified.";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Connection timeout. The service might be experiencing high traffic.";
      } else if (err.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRetry = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast({
        title: "Maximum Retries Reached",
        description: "Returning to dashboard. Please try again later.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    toast({
      title: "Retrying Connection",
      description: `Attempt ${retryCount + 1} of ${MAX_RETRIES}...`,
    });

    // Add delay before retry
    setTimeout(async () => {
      await initializeConversation();
      setIsRetrying(false);
    }, RETRY_DELAY);
  };

  const handleReturnToDashboard = () => {
    toast({
      title: "Returning to Dashboard",
      description: "You can try connecting to an AI assistant again from there.",
    });
    
    navigate("/dashboard");
  };

  // Add a function to handle sending messages
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      text: inputMessage.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage = {
        text: `I'm processing your message: "${inputMessage.trim()}"`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const videoContainer = document.querySelector(".video-container");
      if (videoContainer) {
        videoContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    initializeConversation();
  }, [agentType]); // Re-initialize if agent type changes

  // Add initial greeting message from AI
  useEffect(() => {
    if (conversationStarted && chatMessages.length === 0) {
      setChatMessages([{
        text: currentAgent.greeting,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [conversationStarted, currentAgent.greeting]);

  // Loading State
  if (isLoading || isRetrying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{currentAgent.avatar}</span>
            </div>
            <CardTitle>
              {isRetrying ? `Retrying Connection (${retryCount}/${MAX_RETRIES})` : `Connecting to ${currentAgent.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">
                {isRetrying ? "Attempting to reconnect..." : "Establishing secure connection..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Connection Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                We're sorry for the inconvenience. You can try again or return to your dashboard.
              </p>
              
              <div className="flex flex-col space-y-2">
                {retryCount < MAX_RETRIES && (
                  <Button 
                    onClick={handleRetry} 
                    disabled={isRetrying}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({MAX_RETRIES - retryCount} attempts left)
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleReturnToDashboard}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>
              
              {retryCount >= MAX_RETRIES && (
                <p className="text-xs text-gray-500 mt-4">
                  If this problem persists, please contact support or try again later.
                </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Success State - Show the conversation
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <style>{scrollbarStyles}</style>      {/* Header */}<div className="bg-slate-800 text-white shadow-md px-5 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">{currentAgent.avatar}</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{currentAgent.name}</h1>
              <p className="text-sm text-slate-300">SPARK AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-slate-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>{/* Main Content */}
      <div className="w-full max-w-none px-4 py-2 flex-1 flex flex-col">
        {conversationUrl ? (          <div className="flex h-[calc(100vh-100px)] w-full mx-auto gap-4">
            {/* Video conversation */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col video-container">
              {/* Video controls header */}
              <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white text-sm">{currentAgent.name}</h2>
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-xs text-green-300">Live</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-2 rounded-full hover:bg-slate-700 ${!isVideoOn ? 'bg-red-900/50 text-red-400' : 'text-slate-300'}`}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className={`p-2 rounded-full hover:bg-slate-700 ${!isAudioOn ? 'bg-red-900/50 text-red-400' : 'text-slate-300'}`}
                  >
                    {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`p-2 rounded-full hover:bg-slate-700 ${!isSpeakerOn ? 'bg-red-900/50 text-red-400' : 'text-slate-300'}`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full hover:bg-slate-700 text-slate-300"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Video frame */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TavusCVIFrame url={conversationUrl} className="h-full" />
                </div>
                
                {/* User video thumbnail */}
                <div className="absolute bottom-4 right-4 w-48 h-32 bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 shadow-lg">
                  <div className="h-full flex items-center justify-center">
                    <UserRound className="h-12 w-12 text-slate-400" />
                  </div>
                </div>
              </div>
              
              {/* Bottom controls */}
              <div className="p-3 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Session time: 00:12:34</p>
                </div>
                <div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => navigate("/dashboard")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </div>
              </div>
            </div>
              {/* Chat interface */}
            <div className="w-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/70 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h2 className="font-medium text-white">Chat with {currentAgent.name}</h2>
                </div>
                <button className="text-slate-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              
              {/* Messages container */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-900/50 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <MessageSquare className="h-10 w-10 opacity-20" />
                    <p>Your chat messages will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <div 
                          className={`max-w-[85%] rounded-lg px-4 py-2 shadow-md ${
                            msg.sender === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-slate-700 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        {msg.sender === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                            <UserRound className="h-3 w-3 text-slate-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="p-3 border-t border-slate-700 bg-slate-800">
                <div className="flex bg-slate-700 rounded-md overflow-hidden shadow-inner">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none px-4 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="rounded-none bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Preparing your conversation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;

// Add custom styling for scrollbars
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.1);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
`;