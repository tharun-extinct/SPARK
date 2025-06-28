import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Mic, 
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  HelpCircle,
  Settings
} from 'lucide-react';
import FlashCard from './FlashCard';
import Quiz from './Quiz';
import SocraticTeaching from './SocraticTeaching';
import VoiceInteraction from './VoiceInteraction';
import useTeachingSession from '@/hooks/useTeachingSession';

interface TeachingInterfaceProps {
  onSendToChat: (message: string) => void;
  onClose?: () => void;
  initialTopic?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const TeachingInterface: React.FC<TeachingInterfaceProps> = ({ 
  onSendToChat, 
  onClose, 
  initialTopic = '',
  isMinimized = false,
  onToggleMinimize
}) => {
  const [activeTab, setActiveTab] = useState('tools');
  const [topic, setTopic] = useState(initialTopic);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const { 
    currentSession, 
    isLoading, 
    createSession, 
    completeSession 
  } = useTeachingSession();

  // Update topic if initialTopic changes
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleCreateFlashCards = async () => {
    if (!topic.trim()) return;
    
    setIsCreatingSession(true);
    try {
      await createSession('flashcards', topic);
      onSendToChat(`📚 Creating flash cards for "${topic}"...`);
      setActiveTab('session');
    } catch (error) {
      console.error('Error creating flash cards:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!topic.trim()) return;
    
    setIsCreatingSession(true);
    try {
      await createSession('quiz', topic);
      onSendToChat(`🧠 Creating a quiz on "${topic}"...`);
      setActiveTab('session');
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCreateSocraticSession = async () => {
    if (!topic.trim()) return;
    
    setIsCreatingSession(true);
    try {
      await createSession('socratic', topic);
      onSendToChat(`🎓 Starting a Socratic learning session on "${topic}"...`);
      setActiveTab('session');
    } catch (error) {
      console.error('Error creating Socratic session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleFlashCardComplete = (results: { correct: number; total: number; timeSpent: number }) => {
    if (currentSession) {
      completeSession(currentSession.id);
    }
  };

  const handleQuizComplete = (results: any) => {
    if (currentSession) {
      completeSession(currentSession.id);
    }
  };

  const handleSocraticComplete = (responses: string[]) => {
    if (currentSession) {
      completeSession(currentSession.id);
    }
  };

  const handleTranscription = (text: string) => {
    if (text.trim()) {
      onSendToChat(text);
    }
  };

  const renderSessionContent = () => {
    if (!currentSession) {
      return (
        <div className="text-center p-8">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No active learning session. Create one from the tools tab!</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your learning session...</p>
        </div>
      );
    }

    switch (currentSession.type) {
      case 'flashcards':
        return (
          <FlashCard 
            cards={currentSession.data as any} 
            onComplete={handleFlashCardComplete}
            onSendToChat={onSendToChat}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            questions={currentSession.data as any} 
            onComplete={handleQuizComplete}
            onSendToChat={onSendToChat}
          />
        );
      case 'socratic':
        return (
          <SocraticTeaching 
            session={currentSession.data as any} 
            onComplete={handleSocraticComplete}
            onSendToChat={onSendToChat}
          />
        );
      default:
        return null;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={onToggleMinimize}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Brain className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Learning Tools
          </CardTitle>
          <CardDescription>
            Interactive learning features powered by AI
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {onToggleMinimize && (
            <Button variant="ghost" size="icon" onClick={onToggleMinimize}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Learning Tools
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Active Session
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic or Subject</label>
                <div className="flex gap-2">
                  <Input 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    placeholder="e.g., JavaScript, Physics, History"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                    className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {showVoiceInterface && (
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                  <CardContent className="p-4">
                    <VoiceInteraction 
                      onTranscription={(text) => {
                        setTopic(text);
                        setShowVoiceInterface(false);
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-800">Flash Cards</h3>
                    <p className="text-sm text-blue-700">Create interactive flash cards to memorize key concepts</p>
                    <Button 
                      onClick={handleCreateFlashCards}
                      disabled={!topic.trim() || isCreatingSession}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    >
                      {isCreatingSession ? 'Creating...' : 'Create Flash Cards'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-800">Quiz</h3>
                    <p className="text-sm text-green-700">Test your knowledge with interactive quizzes</p>
                    <Button 
                      onClick={handleCreateQuiz}
                      disabled={!topic.trim() || isCreatingSession}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      {isCreatingSession ? 'Creating...' : 'Create Quiz'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-800">Socratic Method</h3>
                    <p className="text-sm text-purple-700">Learn through guided questioning and discovery</p>
                    <Button 
                      onClick={handleCreateSocraticSession}
                      disabled={!topic.trim() || isCreatingSession}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    >
                      {isCreatingSession ? 'Creating...' : 'Start Learning'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Quick Tips</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Type "create flashcards for [topic]" in chat</li>
                        <li>• Ask "quiz me on [subject]" for a quick quiz</li>
                        <li>• Say "I want to learn about [topic]" for guided learning</li>
                        <li>• Use voice commands for hands-free learning</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="session">
            {renderSessionContent()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeachingInterface;