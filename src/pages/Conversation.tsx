
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Home } from "lucide-react";

const Conversation = () => {
  const { agentType } = useParams();
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, sender: 'user' | 'ai', text: string}>>([]);

  const agentInfo = {
    psychiatrist: {
      name: "Dr. Sarah",
      specialty: "Mental Health Companion",
      avatar: "👩‍⚕️",
      greeting: "Hello! I'm Dr. Sarah, your mental health companion. How are you feeling today?"
    },
    tutor: {
      name: "Alex",
      specialty: "Learning Companion", 
      avatar: "👨‍🏫",
      greeting: "Hi there! I'm Alex, your learning companion. What would you like to explore today?"
    },
    doctor: {
      name: "Dr. James",
      specialty: "Wellness Assistant",
      avatar: "👨‍⚕️", 
      greeting: "Good day! I'm Dr. James, your wellness assistant. How can I help with your health today?"
    }
  };

  const currentAgent = agentInfo[agentType as keyof typeof agentInfo] || agentInfo.psychiatrist;

  useEffect(() => {
    if (!conversationStarted) return;
    
    // Simulate AI greeting after a short delay
    const timer = setTimeout(() => {
      setMessages([{
        id: 1,
        sender: 'ai',
        text: currentAgent.greeting
      }]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [conversationStarted, currentAgent.greeting]);

  const startConversation = () => {
    setConversationStarted(true);
  };

  const endCall = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <Home className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium">ConnectAI Session</span>
        </div>
        <div className="text-white text-sm">
          {currentAgent.name} - {currentAgent.specialty}
        </div>
      </header>

      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* AI Video Feed */}
        <div className="flex-1 relative">
          <Card className="h-full rounded-none border-0">
            <CardContent className="h-full p-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              {conversationStarted ? (
                <div className="text-center text-white">
                  <div className="text-8xl mb-4">{currentAgent.avatar}</div>
                  <h2 className="text-2xl font-bold mb-2">{currentAgent.name}</h2>
                  <p className="text-blue-200">{currentAgent.specialty}</p>
                  <div className="mt-8 w-4 h-4 bg-green-500 rounded-full mx-auto animate-pulse"></div>
                  <p className="text-sm text-green-300 mt-2">Connected & Listening</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-8xl mb-4">{currentAgent.avatar}</div>
                  <h2 className="text-2xl font-bold mb-2">{currentAgent.name}</h2>
                  <p className="text-blue-200 mb-8">{currentAgent.specialty}</p>
                  <Button onClick={startConversation} size="lg">
                    Start Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Video Feed (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36">
          <Card>
            <CardContent className="h-full p-0 bg-gray-700 flex items-center justify-center rounded-lg">
              {isVideoOn ? (
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">😊</div>
                  <p className="text-xs">You</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <VideoOff className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Video Off</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Messages */}
      {conversationStarted && (
        <div className="bg-gray-800 p-4 max-h-48 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex justify-center space-x-4">
        <Button
          variant={isAudioOn ? "default" : "destructive"}
          size="lg"
          onClick={() => setIsAudioOn(!isAudioOn)}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          size="lg"
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full w-12 h-12 p-0"
        >
          <Phone className="w-5 h-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Conversation;
