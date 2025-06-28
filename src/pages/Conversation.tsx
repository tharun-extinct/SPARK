import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home, AlertTriangle, RefreshCw, Send, Brain, BookOpen, Lightbulb, X } from "lucide-react";
import { createTavusConversation } from "@/lib/tavus";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";
import { useToast } from "@/components/ui/use-toast";
import TeachingInterface from "@/components/teaching/TeachingInterface";
import VoiceInteraction from "@/components/teaching/VoiceInteraction";

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
  const [showTeachingTools, setShowTeachingTools] = useState(false);
  const [isTeachingMinimized, setIsTeachingMinimized] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [detectedTopic, setDetectedTopic] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      context: "You are a helpful virtual tutor called Alex providing learning assistance and educational guidance using the Socratic method.",
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Check for learning-related keywords to show teaching tools
  useEffect(() => {
    if (agentType === 'tutor' && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.sender === 'user') {
        const text = lastMessage.text.toLowerCase();
        const learningKeywords = [
          'learn', 'teach', 'explain', 'understand', 'concept', 
          'quiz', 'test', 'flashcard', 'flash card', 'question',
          'homework', 'study', 'practice', 'exercise', 'problem'
        ];
        
        const topicPatterns = [
          /about\s+([a-z\s]+)/i,
          /on\s+([a-z\s]+)/i,
          /([a-z\s]+)\s+concepts/i,
          /([a-z\s]+)\s+basics/i,
          /([a-z\s]+)\s+fundamentals/i
        ];
        
        // Check for learning intent
        const hasLearningIntent = learningKeywords.some(keyword => text.includes(keyword));
        
        if (hasLearningIntent) {
          // Try to extract topic
          let extractedTopic = '';
          for (const pattern of topicPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              extractedTopic = match[1].trim();
              break;
            }
          }
          
          // If no specific pattern matched, use a fallback approach
          if (!extractedTopic) {
            // Remove learning keywords and common words
            const cleanedText = text
              .replace(/learn|teach|explain|understand|quiz|test|flashcard|about|on|for|me|please|can|you|i|want|to|the|a|an/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
              
            if (cleanedText) {
              extractedTopic = cleanedText;
            }
          }
          
          if (extractedTopic) {
            setDetectedTopic(extractedTopic);
          }
          
          setShowTeachingTools(true);
        }
      }
    }
  }, [chatMessages, agentType]);

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
      let aiResponse = "";
      
      // Generate different responses based on agent type and message content
      if (agentType === 'tutor') {
        const text = userMessage.text.toLowerCase();
        
        if (text.includes('quiz') || text.includes('test')) {
          aiResponse = "I'd be happy to create a quiz for you! What topic would you like to be tested on?";
          setShowTeachingTools(true);
        } else if (text.includes('flash') || text.includes('card')) {
          aiResponse = "Flash cards are a great study tool! What subject would you like to create flash cards for?";
          setShowTeachingTools(true);
        } else if (text.includes('learn') || text.includes('teach') || text.includes('explain')) {
          aiResponse = "I'd love to help you learn! I can guide you through this topic using the Socratic method, which helps you discover concepts through guided questioning.";
          setShowTeachingTools(true);
        } else {
          aiResponse = "I'm processing your question. Would you like me to create some interactive learning materials to help with this topic?";
        }
      } else if (agentType === 'psychiatrist') {
        aiResponse = "Thank you for sharing that with me. How long have you been feeling this way?";
      } else {
        aiResponse = "I understand your concern. Let me provide some information that might help with your situation.";
      }
      
      const aiMessage = {
        text: aiResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleVoiceTranscription = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message from voice
    const userMessage = {
      text: text.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = "I heard your voice message. Let me think about how to respond...";
      
      const aiMessage = {
        text: aiResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSendFromTeachingTool = (message: string) => {
    // Add message from teaching tool to chat
    const toolMessage = {
      text: message,
      sender: 'ai' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, toolMessage]);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl">{currentAgent.avatar}</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{currentAgent.name}</h1>
              <p className="text-sm text-gray-600">AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {agentType === 'tutor' && (
              <Button
                variant={showTeachingTools ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTeachingTools(!showTeachingTools)}
                className={showTeachingTools ? "bg-gradient-to-r from-blue-500 to-indigo-600" : ""}
              >
                <Brain className="w-4 h-4 mr-2" />
                Learning Tools
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-none px-4 py-2 flex-1 flex flex-col">
        {conversationUrl ? (
          <div className="flex h-[calc(100vh-100px)] w-full mx-auto gap-4">
            {/* Video conversation */}
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden">
              <TavusCVIFrame url={conversationUrl} />
            </div>
            
            {/* Chat interface */}
            <div className="w-96 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <h2 className="font-semibold">Chat with {currentAgent.name}</h2>
              </div>
              
              {/* Messages container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-3 overflow-y-auto"
                style={{ maxHeight: showTeachingTools ? 'calc(100vh - 450px)' : 'calc(100vh - 200px)' }}
              >
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    <p>Your chat messages will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            msg.sender === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="p-3 border-t">
                {isVoiceMode ? (
                  <div className="mb-3">
                    <VoiceInteraction 
                      onTranscription={handleVoiceTranscription}
                      onSpeechEnd={() => setIsVoiceMode(false)}
                    />
                  </div>
                ) : (
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsVoiceMode(true)}
                      className="rounded-r-none border-r-0"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 border rounded-l-none rounded-r-none px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="rounded-l-none"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Teaching Tools */}
              {showTeachingTools && agentType === 'tutor' && (
                <div className="border-t">
                  <TeachingInterface 
                    onSendToChat={handleSendFromTeachingTool}
                    onClose={() => setShowTeachingTools(false)}
                    initialTopic={detectedTopic}
                    isMinimized={isTeachingMinimized}
                    onToggleMinimize={() => setIsTeachingMinimized(!isTeachingMinimized)}
                  />
                </div>
              )}
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