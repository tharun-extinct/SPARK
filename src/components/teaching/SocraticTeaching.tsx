import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  HelpCircle,
  MessageSquare,
  Sparkles,
  Eye,
  BookOpen
} from 'lucide-react';

interface SocraticStep {
  id: string;
  question: string;
  hints: string[];
  expectedConcepts: string[];
  followUpQuestions: string[];
  category: string;
}

interface SocraticSession {
  topic: string;
  learningObjective: string;
  steps: SocraticStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SocraticTeachingProps {
  session: SocraticSession;
  onComplete?: (responses: string[]) => void;
  onSendToChat?: (message: string) => void;
}

const SocraticTeaching: React.FC<SocraticTeachingProps> = ({ session, onComplete, onSendToChat }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [conceptsIdentified, setConceptsIdentified] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>('');

  const currentStep = session.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / session.steps.length) * 100;

  const analyzeResponse = (response: string, expectedConcepts: string[]) => {
    const foundConcepts = expectedConcepts.filter(concept => 
      response.toLowerCase().includes(concept.toLowerCase())
    );
    return foundConcepts;
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) return;

    const newResponses = [...responses, userResponse];
    setResponses(newResponses);

    // Analyze response for expected concepts
    const foundConcepts = analyzeResponse(userResponse, currentStep.expectedConcepts);
    setConceptsIdentified(prev => [...new Set([...prev, ...foundConcepts])]);

    // Send response to chat for AI analysis
    if (onSendToChat) {
      onSendToChat(
        `🧠 Socratic Learning Response:\n\n` +
        `**Question:** ${currentStep.question}\n\n` +
        `**Student Response:** ${userResponse}\n\n` +
        `**Concepts Identified:** ${foundConcepts.length > 0 ? foundConcepts.join(', ') : 'None yet - keep exploring!'}\n\n` +
        `Please provide feedback and guide the student's thinking.`
      );
    }

    // Move to next step or complete
    if (currentStepIndex < session.steps.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        setUserResponse('');
        setCurrentHintIndex(0);
        setShowHint(false);
      }, 1000);
    } else {
      handleSessionComplete(newResponses);
    }
  };

  const handleSessionComplete = (finalResponses: string[]) => {
    const summary = generateSessionSummary(finalResponses);
    setSessionSummary(summary);
    setIsComplete(true);

    if (onComplete) {
      onComplete(finalResponses);
    }

    if (onSendToChat) {
      onSendToChat(
        `🎓 Socratic Learning Session Complete!\n\n` +
        `**Topic:** ${session.topic}\n` +
        `**Objective:** ${session.learningObjective}\n\n` +
        `**Key Concepts Explored:** ${conceptsIdentified.join(', ')}\n` +
        `**Questions Answered:** ${finalResponses.length}\n` +
        `**Hints Used:** ${hintsUsed.length}\n\n` +
        `**Summary:** ${summary}\n\n` +
        `Great work exploring this topic through guided questioning! 🌟`
      );
    }
  };

  const generateSessionSummary = (finalResponses: string[]): string => {
    const totalConcepts = session.steps.reduce((acc, step) => acc + step.expectedConcepts.length, 0);
    const conceptsFound = conceptsIdentified.length;
    const completionRate = Math.round((conceptsFound / totalConcepts) * 100);

    return `You explored ${conceptsFound} out of ${totalConcepts} key concepts (${completionRate}% coverage). ` +
           `Your responses showed ${conceptsFound >= totalConcepts * 0.8 ? 'excellent' : 
                                   conceptsFound >= totalConcepts * 0.6 ? 'good' : 'developing'} understanding. ` +
           `${hintsUsed.length === 0 ? 'You worked independently without hints!' : 
             `You used ${hintsUsed.length} hint${hintsUsed.length > 1 ? 's' : ''} to guide your thinking.`}`;
  };

  const handleShowHint = () => {
    if (currentHintIndex < currentStep.hints.length) {
      setShowHint(true);
      if (!hintsUsed.includes(currentStepIndex)) {
        setHintsUsed(prev => [...prev, currentStepIndex]);
      }
    }
  };

  const handleNextHint = () => {
    if (currentHintIndex < currentStep.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-purple-800">Learning Journey Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{conceptsIdentified.length}</div>
              <div className="text-sm text-purple-500">Concepts Explored</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
              <div className="text-sm text-blue-500">Questions Answered</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-green-600">{hintsUsed.length}</div>
              <div className="text-sm text-green-500">Hints Used</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Session Summary</h3>
            <p className="text-gray-700">{sessionSummary}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-purple-800">Concepts You Explored:</h3>
            <div className="flex flex-wrap gap-2">
              {conceptsIdentified.map((concept, index) => (
                <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {concept}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No Socratic session available. Ask the AI to create a guided learning session for you!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Session Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">{session.topic}</h2>
        <p className="text-gray-600">{session.learningObjective}</p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">Step {currentStepIndex + 1} of {session.steps.length}</Badge>
          <Badge className={getDifficultyColor(session.difficulty)}>
            {session.difficulty}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Current Question */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <HelpCircle className="w-5 h-5" />
            Guiding Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-gray-800">{currentStep.question}</p>
          
          {currentStep.category && (
            <Badge variant="outline" className="w-fit">
              <BookOpen className="w-3 h-3 mr-1" />
              {currentStep.category}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Response Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Your Response
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Share your thoughts and reasoning here..."
            className="min-h-32"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {currentStep.hints.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowHint}
                  disabled={showHint && currentHintIndex >= currentStep.hints.length - 1}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? 'Next Hint' : 'Need a Hint?'}
                </Button>
              )}
              
              {conceptsIdentified.length > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Target className="w-3 h-3 mr-1" />
                  {conceptsIdentified.length} concepts found
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={handleSubmitResponse}
              disabled={!userResponse.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              Submit Response
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hint Display */}
      {showHint && currentStep.hints[currentHintIndex] && (
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Lightbulb className="w-5 h-5" />
              Hint {currentHintIndex + 1} of {currentStep.hints.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">{currentStep.hints[currentHintIndex]}</p>
            {currentHintIndex < currentStep.hints.length - 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextHint}
                className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Show Next Hint
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expected Concepts (for reference) */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Eye className="w-5 h-5" />
            Key Concepts to Explore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentStep.expectedConcepts.map((concept, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className={`${
                  conceptsIdentified.includes(concept)
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                {conceptsIdentified.includes(concept) && <CheckCircle className="w-3 h-3 mr-1" />}
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocraticTeaching;