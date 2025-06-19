
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home } from "lucide-react";
import { createTavusConversation } from "@/lib/tavus";
import { TavusCVIFrame } from "@/components/ui/TavusCVIFrame";

const Conversation = () => {
  const { agentType } = useParams();
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, sender: 'user' | 'ai', text: string}>>([]);

  const agentInfo = {
    psychiatrist: {
      name: "Dr.Anna",
      context: "You are a helpful virtual doctor called Dr.Anna giving medical advice.",
      avatar: "👩‍⚕️",
      greeting: "Hello! I'm Dr.Anna, your mental health companion. How are you feeling today?",
      replicaId: "r4dcf31b60e1",
      personaId: "p321a7b6f093"
    },
    tutor: {
      name: "Alex",
      context: "You are a helpful virtual tutor called Alex providing learning assistance.",
      avatar: "👨‍🏫",
      greeting: "Hi there! I'm Alex, your learning companion. What would you like to explore today?",
      replicaId: "rc2146c13e81",
      personaId: "peebe852d86b"
    },
    doctor: {
      name: "Dr.James",
      context: "You are a helpful virtual wellness coach called Dr. James providing wellness advice.",
      avatar: "👨‍⚕️",
      greeting: "Good day! I'm Dr. James, your wellness assistant. How can I help with your health today?",
      replicaId: "r4d9b2288937",
      personaId: "paf8f3186bed"
    }
  };

  const currentAgent = agentInfo[agentType as keyof typeof agentInfo] || agentInfo.psychiatrist;

  // useEffect(() => {
  //   if (!conversationStarted) return;
    
  //   // Simulate AI greeting after a short delay
  //   const timer = setTimeout(() => {
  //     setMessages([{
  //       id: 1,
  //       sender: 'ai',
  //       text: currentAgent.greeting
  //     }]);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [conversationStarted, currentAgent.greeting]);

  const [conversationUrl, setConversationUrl] = useState("");
  useEffect(() => {
    // Show loading indicator
    setConversationStarted(true);
    
    // Create a new Tavus conversation
    createTavusConversation({
      replicaId: currentAgent.replicaId,
      personaId: currentAgent.personaId,
      name: `${currentAgent.name} Conversation`,
      context: currentAgent.context,
      greeting: currentAgent.greeting,
    })
      .then(response => {
        setConversationUrl(response.conversationUrl);
        console.log("Conversation started successfully");
      })
      .catch((err) => {
        console.error("Failed to start conversation", err);
        // You could add error handling UI here
      });
  }, [currentAgent]);
  const endCall = () => {
    navigate("/dashboard");
  };
  
  // Build a custom style to control the height precisely
  const containerStyle = {
    height: "calc(100vh - 120px)" // 120px accounts for header + margins + padding
  };
  
  return (
    <div className="container mx-auto px-4 py-4 flex flex-col min-h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">{`${currentAgent.name} Session`}</h1>
        </div>
        <Button variant="outline" onClick={endCall}>
          Return to Dashboard
        </Button>
      </div>      {/* Main content */}
      <div className="flex-1 mb-4">
        {conversationUrl ? (
          <Card className="overflow-hidden">
            <CardContent className="p-0" style={containerStyle}>
              <TavusCVIFrame 
                conversationUrl={conversationUrl} 
                agentName={currentAgent.name}
                agentAvatar={currentAgent.avatar}
                onEndCall={endCall}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center bg-muted/20 rounded-lg" style={containerStyle}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading {`${currentAgent.name} Chat`}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

export default Conversation;
