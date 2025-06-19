import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home, AlertTriangle, RefreshCw } from "lucide-react";
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

  useEffect(() => {
    initializeConversation();
  }, [agentType]); // Re-initialize if agent type changes

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
        <div className="flex items-center justify-between max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto p-4 flex-1 flex flex-col">
        {conversationUrl ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-120px)]">
            <TavusCVIFrame url={conversationUrl} />
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