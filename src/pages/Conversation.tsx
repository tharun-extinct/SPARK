import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home, AlertTriangle, RefreshCw, Send, Copy, Download, Check, X } from "lucide-react";
import { createTavusConversation, TavusConversationResponse } from "@/lib/tavus";
import TavusCVIFrame from "@/components/ui/TavusCVIFrame";
import { useToast } from "@/components/ui/use-toast";
import { TranscriptSegment, useTranscription } from "@/services/transcriptionService";
import { useAuth } from "@/services/firebaseAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TextShimmer } from "@/components/ui/text-shimmer";

const Conversation = () => {
  const { agentType = "psychiatrist" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { recordConversation, analyticsService } = useAnalytics();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationUrl, setConversationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const tavusCVIFrameRef = useRef<HTMLIFrameElement>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [tavusConversationData, setTavusConversationData] = useState<TavusConversationResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Speech recognition
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useTranscription();

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

  // Handle user voice input from speech recognition
  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      console.log("Speech recognition transcript:", transcript);
      
      // Only add significant transcripts as messages (avoid fragments)
      if (transcript.trim().length > 3) {
        const userMessage = {
          text: transcript.trim(),
          sender: 'user' as const,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
      }
      
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add greeting message from AI when conversation starts
  useEffect(() => {
    if (conversationStarted && messages.length === 0) {
      setMessages([{
        text: currentAgent.greeting,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [conversationStarted, currentAgent.greeting, messages.length]);

  // Initialize conversation when component mounts or agent changes
  useEffect(() => {
    initializeConversation();
    return () => {
      // Cleanup speech recognition on unmount
      if (isListening) {
        stopListening();
      }
    };
  }, [agentType]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Initializing conversation with ${currentAgent.name}...`);
      
      // Create Tavus conversation and get full response including conversation_id
      const tavusResponse = await createTavusConversation({
        replicaId: currentAgent.replicaId,
        personaId: currentAgent.personaId,
        name: `${currentAgent.name} Conversation`,
        context: currentAgent.context,
        greeting: currentAgent.greeting,
      });
      
      console.log('✅ Tavus conversation created:', tavusResponse);
      
      // Store the full Tavus response
      setTavusConversationData(tavusResponse);
      setConversationUrl(tavusResponse.conversation_url);
      setConversationStarted(true);
      setSessionStartTime(new Date());
      setIsLoading(false);
      
      // Store the Tavus conversation ID in our analytics system
      if (analyticsService && tavusResponse.conversation_id && currentUser) {
        try {
          console.log('🔄 Storing Tavus conversation ID in Firebase:', tavusResponse.conversation_id);
          console.log('👤 Current user ID:', currentUser.uid);
          
          const firebaseRefId = await analyticsService.storeTavusConversationId(
            tavusResponse.conversation_id, 
            agentType as string
          );
          console.log('✅ Tavus conversation ID stored successfully with Firebase ref:', firebaseRefId);
        } catch (storageError) {
          console.warn('⚠️ Failed to store Tavus conversation ID:', storageError);
          // Don't fail the conversation if storage fails
        }
      } else {
        console.warn('⚠️ Missing required data to store Tavus conversation ID:', {
          analyticsService: !!analyticsService,
          tavusConversationId: tavusResponse.conversation_id,
          currentUser: !!currentUser
        });
      }
      
      toast({
        title: "Connection Established",
        description: `Successfully connected to ${currentAgent.name}`,
      });
      
    } catch (err: any) {
      console.error("❌ Failed to start conversation:", err);
      
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

  const handleReturnToDashboard = async () => {
    console.log('🔄 Ending session and recording conversation...');
    
    // Record the session if it was started
    if (sessionStartTime && currentUser && tavusConversationData) {
      try {
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 60000); // Duration in minutes
        
        console.log('📊 Session details:', {
          startTime: sessionStartTime,
          endTime,
          duration,
          agentType,
          tavusConversationId: tavusConversationData.conversation_id,
          messagesCount: messages.length,
          userId: currentUser.uid
        });
        
        // Sync with Tavus to get the latest conversation details
        let tavusDetails = null;
        if (analyticsService && tavusConversationData.conversation_id) {
          try {
            console.log('🔄 Syncing with Tavus for conversation ID:', tavusConversationData.conversation_id);
            tavusDetails = await analyticsService.syncTavusConversation(tavusConversationData.conversation_id);
            console.log('✅ Synced Tavus conversation details:', tavusDetails);
          } catch (syncError) {
            console.warn('⚠️ Failed to sync Tavus conversation details:', syncError);
          }
        }
        
        // Prepare conversation data with all required fields
        const conversationData = {
          agentType: agentType as 'psychiatrist' | 'tutor' | 'doctor',
          startTime: sessionStartTime,
          endTime: endTime,
          duration: Math.max(1, duration), // Minimum 1 minute
          topics: messages.filter(msg => msg.sender === 'user').map(msg => msg.text).slice(0, 5), // First 5 user messages as topics
          satisfaction: 4, // Default satisfaction
          notes: `Conversation with ${currentAgent.name}`,
          // Include Tavus data
          tavusConversationId: tavusConversationData.conversation_id,
          // Only include fields that exist
          ...(tavusDetails?.recording_url && { tavusRecordingUrl: tavusDetails.recording_url }),
          ...(tavusDetails?.transcript && { tavusTranscript: tavusDetails.transcript }),
          ...(tavusDetails?.metadata && { tavusMetadata: tavusDetails.metadata })
        };
        
        console.log('💾 Recording conversation with data:', conversationData);
        
        await recordConversation(conversationData);
        
        console.log('✅ Conversation recorded successfully to Firebase');
        
        toast({
          title: "Session Recorded",
          description: "Your conversation has been saved to your analytics.",
        });
      } catch (error) {
        console.error("❌ Error recording conversation:", error);
        // Still show a toast but don't block navigation
        toast({
          title: "Session Ended",
          description: "There was an issue saving your session data, but your conversation is complete.",
          variant: "destructive",
        });
      }
    } else {
      console.log('⚠️ No session data to record - missing required data:', {
        sessionStartTime: !!sessionStartTime,
        currentUser: !!currentUser,
        tavusConversationData: !!tavusConversationData
      });
    }
    
    toast({
      title: "Returning to Dashboard",
      description: "You can try connecting to an AI assistant again from there.",
    });
    
    navigate("/dashboard");
  };

  // Start voice input
  const startVoiceInput = () => {
    startListening();
    toast({
      title: "Voice input started",
      description: "Speak clearly, then use the check button to send."
    });
  };
  
  // Cancel voice input
  const cancelVoiceInput = () => {
    stopListening();
    resetTranscript();
    toast({
      title: "Voice input canceled",
      description: "Voice input has been discarded."
    });
  };
  
  // Send voice input
  const sendVoiceInput = () => {
    if (transcript && transcript.trim()) {
      // Add user voice message
      const userMessage = {
        text: transcript.trim(),
        sender: 'user' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      toast({
        title: "Message sent",
        description: "Your voice message has been sent."
      });
    } else {
      toast({
        title: "No voice detected",
        description: "Please speak or type your message."
      });
    }
    
    stopListening();
    resetTranscript();
  };

  // Handle sending text messages
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      text: inputMessage.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // If speech recognition is on, turn it off when sending typed message
    if (isListening) {
      stopListening();
    }
  };
  
  // Handle transcript received from Tavus
  const handleTranscriptReceived = (text: string) => {
    console.log("Transcript received from Tavus:", text);
    
    if (!text || text.trim() === '') return;
    
    const aiMessage = {
      text: text.trim(),
      sender: 'ai' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  // Copy conversation to clipboard
  const copyConversation = () => {
    const text = messages.map(msg => `${msg.sender === 'ai' ? currentAgent.name : 'You'}: ${msg.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description: "The conversation has been copied to your clipboard."
    });
  };

  // Download conversation as text file
  const downloadConversation = () => {
    const text = messages.map(msg => 
      `${msg.sender === 'ai' ? currentAgent.name : 'You'} (${msg.timestamp.toLocaleTimeString()}): ${msg.text}`
    ).join('\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `conversation-with-${currentAgent.name.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Conversation downloaded",
      description: "Your conversation has been saved to your downloads."
    });
  };

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
              {tavusConversationData && (
                <p className="text-xs text-gray-500">
                  Conversation ID: {tavusConversationData.conversation_id}
                </p>
              )}
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
              {tavusConversationData && (
                <p className="text-xs text-gray-400">ID: {tavusConversationData.conversation_id.slice(0, 8)}...</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyConversation}
              title="Copy conversation"
              disabled={messages.length === 0}
            >
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadConversation}
              title="Download conversation"
              disabled={messages.length === 0}
            >
              <Download className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturnToDashboard}
              title="Return to dashboard"
            >
              <Home className="w-4 h-4 mr-1" /> Exit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-none px-4 py-2 flex-1 flex flex-col">
        {conversationUrl ? (
          <div className="flex h-[calc(100vh-100px)] w-full mx-auto gap-4">
            {/* Video conversation */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden">
              <TavusCVIFrame 
                ref={tavusCVIFrameRef}
                url={conversationUrl} 
                onTranscriptReceived={handleTranscriptReceived}
              />
            </div>
            
            {/* Unified chat interface */}
            <div className="w-96 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <h2 className="font-semibold">Chat with {currentAgent.name}</h2>
                {tavusConversationData && (
                  <p className="text-xs text-gray-500">Session: {tavusConversationData.conversation_id.slice(-8)}</p>
                )}
              </div>
              
              {/* Messages container */}
              <div className="flex-1 p-3 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    <p>Start your conversation with {currentAgent.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
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
                          <p>{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Voice indicator removed as requested */}
              
              {/* Input area with rounded buttons */}
              <div className="p-3 border-t">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative rounded-full border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                    {isListening ? (
                      <div className="flex items-center px-4 py-2 w-full">
                        <div className="flex space-x-1 mr-2">
                          <div className="w-1.5 h-3 bg-primary rounded-full" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
                          <div className="w-1.5 h-5 bg-primary rounded-full" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.3s infinite'}}></div>
                          <div className="w-1.5 h-2 bg-primary rounded-full" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.6s infinite'}}></div>
                          <div className="w-1.5 h-4 bg-primary rounded-full" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.9s infinite'}}></div>
                          <div className="w-1.5 h-3 bg-primary rounded-full" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1.2s infinite'}}></div>
                        </div>
                        <TextShimmer 
                          className="text-sm font-medium text-primary flex-1"
                          duration={3.5}
                        >
                          Listening...
                        </TextShimmer>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask anything..."
                        className="flex-1 w-full px-4 py-2 bg-transparent border-none focus:outline-none"
                      />
                    )}
                  </div>
                  
                  {isListening ? (
                    <>
                      <Button 
                        onClick={cancelVoiceInput}
                        variant="destructive"
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                        title="Cancel recording"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        onClick={sendVoiceInput}
                        variant="default"
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-green-500 hover:bg-green-600"
                        title="Send voice message"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={startVoiceInput}
                        variant="default"
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                        title="Start voice input"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        onClick={handleSendMessage}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                        disabled={!inputMessage.trim()}
                        title="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Removed instruction text as requested */}
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