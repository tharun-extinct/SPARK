import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, 
  Check, 
  X, 
  Star, 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  Shuffle,
  Target,
  Trophy
} from 'lucide-react';

interface FlashCardData {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface FlashCardProps {
  cards: FlashCardData[];
  onComplete?: (results: { correct: number; total: number; timeSpent: number }) => void;
  onSendToChat?: (message: string) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ cards, onComplete, onSendToChat }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ [key: string]: 'correct' | 'incorrect' | null }>({});
  const [startTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [isComplete, setIsComplete] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashCardData[]>([]);

  useEffect(() => {
    setShuffledCards([...cards]);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentCard) return;

    const newResults = { ...results, [currentCard.id]: isCorrect ? 'correct' : 'incorrect' };
    setResults(newResults);

    const newStats = {
      ...sessionStats,
      [isCorrect ? 'correct' : 'incorrect']: sessionStats[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: sessionStats.total + 1
    };
    setSessionStats(newStats);

    // Move to next card or complete session
    if (currentIndex < shuffledCards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }, 1000);
    } else {
      // Session complete
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({
          correct: newStats.correct,
          total: newStats.total,
          timeSpent
        });
      }

      // Send results to chat
      if (onSendToChat) {
        const accuracy = Math.round((newStats.correct / newStats.total) * 100);
        onSendToChat(
          `📚 Flash Card Session Complete!\n\n` +
          `✅ Correct: ${newStats.correct}/${newStats.total} (${accuracy}%)\n` +
          `⏱️ Time: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}\n` +
          `🎯 Performance: ${accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good!' : 'Keep practicing!'}`
        );
      }
    }
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setIsComplete(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isComplete) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-800">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-green-500">Correct</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-blue-500">Accuracy</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-purple-500">Time</div>
            </div>
          </div>

          <div className="text-center">
            <Badge className={`text-lg px-4 py-2 ${
              accuracy >= 80 ? 'bg-green-500' : 
              accuracy >= 60 ? 'bg-blue-500' : 'bg-orange-500'
            }`}>
              {accuracy >= 80 ? '🌟 Excellent!' : 
               accuracy >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
            </Badge>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} className="bg-gradient-to-r from-blue-500 to-cyan-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleShuffle} variant="outline">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle & Restart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No flash cards available. Ask the AI to create some for you!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Progress</span>
          <Badge variant="outline">{currentIndex + 1} of {shuffledCards.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(currentCard.difficulty)}>
            {currentCard.difficulty}
          </Badge>
          <Button size="sm" variant="outline" onClick={handleShuffle}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Flash Card */}
      <div className="relative h-80 perspective-1000">
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <Card className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-blue-800">Question</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <p className="text-xl font-medium text-gray-800">{currentCard.front}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentCard.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Click to reveal answer</p>
              </div>
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-green-800">Answer</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-6">
                <p className="text-xl font-medium text-gray-800">{currentCard.back}</p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Did you get it right?</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(false);
                      }}
                      variant="outline"
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Incorrect
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Correct
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center">
          <div className="text-sm text-gray-600">Session Stats</div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {sessionStats.correct}</span>
            <span className="text-red-600">✗ {sessionStats.incorrect}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            if (currentIndex < shuffledCards.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex === shuffledCards.length - 1}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashCard;