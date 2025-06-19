
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
    createTavusConversation({
      replicaId: currentAgent.replicaId,
      personaId: currentAgent.personaId,
      name: `${currentAgent.name} Conversation`,
      context: currentAgent.context,
      greeting: currentAgent.greeting,
    })
      .then(setConversationUrl)
      .catch((err) => {
        console.error("Failed to start conversation", err);
      });
  }, []);

  const endCall = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>{`${currentAgent.name} Chat`}</h1>
      {conversationUrl ? (
        <TavusCVIFrame conversationUrl={conversationUrl} />
      ) : (
        <p>Loading {`${currentAgent.name} Chat`}...</p>
      )}
    </div>
  );
  };

export default Conversation;
