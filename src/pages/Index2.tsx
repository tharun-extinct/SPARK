
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/UI-Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/UI-Components/ui/card";
import { Heart, BookOpen, Stethoscope, ArrowRight, Users, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agentTypes = [
    {
      id: "psychiatrist",
      title: "Mental Health Companion",
      description: "Empathetic support for anxiety, depression, and emotional wellness",
      icon: Heart,
      color: "bg-rose-500",
      features: ["24/7 emotional support", "Crisis intervention", "Mood tracking"]
    },
    {
      id: "tutor",
      title: "Learning Companion",
      description: "Personalized educational support and cognitive engagement",
      icon: BookOpen,
      color: "bg-blue-500",
      features: ["Adaptive learning", "Real-time feedback", "Progress tracking"]
    },
    {
      id: "doctor",
      title: "Wellness Assistant",
      description: "Health monitoring, medication reminders, and wellness guidance",
      icon: Stethoscope,
      color: "bg-green-500",
      features: ["Health monitoring", "Medication reminders", "Symptom tracking"]
    }
  ];

  const handleStartConversation = () => {
    if (selectedAgent) {
      navigate(`/conversation/${selectedAgent}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ConnectAI</span>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Transform Mental Wellness with
          <span className="text-primary block mt-2">Real-Time AI Companions</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Experience genuine human-like connections through face-to-face conversations with our empathetic AI agents. 
          Available 24/7 to support your mental health, learning, and wellness journey.
        </p>
        
        {/* Key Benefits */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            <span>24/7 Available</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            <span>Private & Secure</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2 text-primary" />
            <span>Human-like Connection</span>
          </div>
        </div>
      </section>

      {/* AI Agent Selection */}
      <section className="px-6 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your AI Companion
        </h2>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          {agentTypes.map((agent) => {
            const IconComponent = agent.icon;
            const isSelected = selectedAgent === agent.id;
            
            return (
              <Card 
                key={agent.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                }`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${agent.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{agent.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {agent.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleStartConversation}
            disabled={!selectedAgent}
            className="px-8 py-3 text-lg"
          >
            Start Conversation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 text-center">
        <p className="text-gray-400">
          © 2024 ConnectAI. Transforming mental wellness through AI companionship.
        </p>
      </footer>
    </div>
  );
};

export default Index;
