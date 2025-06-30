import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Brain, 
  Target, 
  Zap, 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  RefreshCw,
  Star,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  Heart,
  Smile,
  Frown,
  Meh,
  Eye,
  EyeOff,
  Shuffle,
  Timer,
  GamepadIcon
} from 'lucide-react';

const MindGame = () => {
  const [activeTab, setActiveTab] = useState('memory');
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const isVisible = (id: string) => visibleElements.has(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" 
             style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-2xl animate-pulse" 
             style={{ bottom: '10%', right: '10%' }} />
      </div>

      <div className="container mx-auto py-6 px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div 
            id="games-header"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible('games-header') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <Card className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Mind Games
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Exercise your brain with fun and engaging wellness games
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Games Tabs */}
          <div 
            id="games-tabs"
            data-animate
            className="opacity-100 translate-y-0"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
                <TabsTrigger 
                  value="memory" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Brain className="w-4 h-4" />
                  Memory
                </TabsTrigger>
                <TabsTrigger 
                  value="focus" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Target className="w-4 h-4" />
                  Focus
                </TabsTrigger>
                <TabsTrigger 
                  value="reaction" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Zap className="w-4 h-4" />
                  Reaction
                </TabsTrigger>
                <TabsTrigger 
                  value="mindfulness" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Heart className="w-4 h-4" />
                  Mindfulness
                </TabsTrigger>
              </TabsList>

              <TabsContent value="memory" className="space-y-6">
                <MemoryGame />
              </TabsContent>

              <TabsContent value="focus" className="space-y-6">
                <FocusGame />
              </TabsContent>

              <TabsContent value="reaction" className="space-y-6">
                <ReactionGame />
              </TabsContent>

              <TabsContent value="mindfulness" className="space-y-6">
                <MindfulnessGame />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Improved Memory Mosaic Game
const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('setup'); // setup, playing, completed
  const [cards, setCards] = useState<Array<{id: number, symbol: string, isFlipped: boolean, isMatched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const difficulties = {
    easy: { pairs: 6, gridCols: 3, name: 'Easy (3x4)' },
    medium: { pairs: 8, gridCols: 4, name: 'Medium (4x4)' },
    hard: { pairs: 12, gridCols: 4, name: 'Hard (4x6)' }
  };

  const symbols = ['🌟', '🎯', '🚀', '💎', '🔥', '⚡', '🌈', '🎨', '🎵', '🏆', '💫', '🎪'];

  const currentDifficulty = difficulties[difficulty as keyof typeof difficulties];

  useEffect(() => {
    if (isGameActive && gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, gameState]);

  const initializeGame = () => {
    const selectedSymbols = symbols.slice(0, currentDifficulty.pairs);
    const gameCards = [...selectedSymbols, ...selectedSymbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameState('playing');
    setIsGameActive(true);
  };

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing' || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state to show it's flipped
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is completed
          if (matches + 1 === currentDifficulty.pairs) {
            setGameState('completed');
            setIsGameActive(false);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setIsGameActive(false);
    setCards([]);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Memory Mosaic
            </CardTitle>
            <CardDescription className="text-base">
              Match pairs of cards to test your memory
            </CardDescription>
          </div>
          
          {gameState === 'setup' && (
            <div className="flex items-center gap-4">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (3x4)</SelectItem>
                  <SelectItem value="medium">Medium (4x4)</SelectItem>
                  <SelectItem value="hard">Hard (4x6)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={initializeGame}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {gameState !== 'setup' && (
            <Button 
              onClick={resetGame}
              variant="outline"
              className="hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {gameState === 'setup' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <GamepadIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Ready to Play?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Choose your difficulty level and start matching pairs of cards. 
              Test your memory and try to complete the game in the fewest moves!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {Object.entries(difficulties).map(([key, diff]) => (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    difficulty === key 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setDifficulty(key)}
                >
                  <h4 className="font-semibold">{diff.name}</h4>
                  <p className="text-sm text-muted-foreground">{diff.pairs} pairs</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState !== 'setup' && (
          <>
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{moves}</div>
                  <div className="text-sm text-blue-500">Moves</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{matches}/{currentDifficulty.pairs}</div>
                  <div className="text-sm text-green-500">Pairs</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-purple-500">Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Game Board */}
            <div 
              className={`grid gap-3 mx-auto max-w-2xl`}
              style={{ 
                gridTemplateColumns: `repeat(${currentDifficulty.gridCols}, 1fr)`,
                aspectRatio: difficulty === 'hard' ? '2/3' : '1/1'
              }}
            >
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`
                    aspect-square bg-gradient-to-br from-slate-200 to-slate-300 
                    rounded-xl border-2 border-slate-300 cursor-pointer 
                    transition-all duration-300 hover:scale-105 hover:shadow-lg
                    flex items-center justify-center text-3xl font-bold
                    ${card.isFlipped || card.isMatched 
                      ? 'bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-lg' 
                      : 'hover:from-slate-300 hover:to-slate-400'
                    }
                    ${card.isMatched ? 'ring-4 ring-green-400 bg-gradient-to-br from-green-50 to-emerald-100' : ''}
                  `}
                  onClick={() => handleCardClick(card.id)}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-4xl animate-bounce">{card.symbol}</span>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Game Completed */}
            {gameState === 'completed' && (
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h3>
                  <p className="text-green-700 mb-4">
                    You completed the game in {moves} moves and {formatTime(timeElapsed)}!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={initializeGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button 
                      onClick={resetGame}
                      variant="outline"
                    >
                      Change Difficulty
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Focus Game - Stroop Test
const FocusGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = [
    { name: 'red', class: 'text-red-500', bg: 'bg-red-100' },
    { name: 'blue', class: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'green', class: 'text-green-500', bg: 'bg-green-100' },
    { name: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-100' },
    { name: 'purple', class: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'orange', class: 'text-orange-500', bg: 'bg-orange-100' }
  ];

  const generateNewChallenge = () => {
    const wordColor = colors[Math.floor(Math.random() * colors.length)];
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(wordColor.name);
    setCurrentColor(displayColor.class);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setIsGameActive(true);
    generateNewChallenge();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('completed');
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer: 'match' | 'different') => {
    if (!isGameActive) return;

    const wordColorObj = colors.find(c => c.name === currentWord);
    const isMatch = wordColorObj?.class === currentColor;
    const correct = (isMatch && answer === 'match') || (!isMatch && answer === 'different');

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    generateNewChallenge();
  };

  const resetGame = () => {
    setGameState('setup');
    setIsGameActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-6 h-6 text-blue-500" />
          Color Focus Challenge
        </CardTitle>
        <CardDescription className="text-base">
          Test your focus by identifying if the word matches its color
        </CardDescription>
      </CardHeader>

      <CardContent>
        {gameState === 'setup' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Focus Challenge</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You'll see color words displayed in different colors. 
              Quickly decide if the word matches its display color!
            </p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-blue-500">Score</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{streak}</div>
                  <div className="text-sm text-green-500">Streak</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{timeLeft}</div>
                  <div className="text-sm text-orange-500">Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Challenge Display */}
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border">
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Does the word match its color?</h3>
                <div className={`text-6xl font-bold ${currentColor} mb-8`}>
                  {currentWord.toUpperCase()}
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <Button 
                  onClick={() => handleAnswer('match')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-4"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  MATCH
                </Button>
                <Button 
                  onClick={() => handleAnswer('different')}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-lg px-8 py-4"
                >
                  <X className="w-5 h-5 mr-2" />
                  DIFFERENT
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'completed' && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-100 border border-blue-200 rounded-xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Time's Up!</h3>
              <p className="text-blue-700 mb-4">
                Final Score: {score} points with a best streak of {streak}
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button 
                  onClick={resetGame}
                  variant="outline"
                >
                  Back to Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Reaction Time Game
const ReactionGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [isWaiting, setIsWaiting] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = 5;

  const startGame = () => {
    setGameState('playing');
    setReactionTimes([]);
    setCurrentRound(0);
    startRound();
  };

  const startRound = () => {
    setIsWaiting(true);
    setTooEarly(false);
    
    const delay = Math.random() * 4000 + 1000; // 1-5 seconds
    
    timeoutRef.current = setTimeout(() => {
      setIsWaiting(false);
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (isWaiting) {
      setTooEarly(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound(prev => prev + 1);
          startRound();
        } else {
          setGameState('completed');
        }
      }, 1500);
      return;
    }

    if (startTime > 0) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes(prev => [...prev, reactionTime]);
      setStartTime(0);
      
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound(prev => prev + 1);
          startRound();
        } else {
          setGameState('completed');
        }
      }, 1500);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setReactionTimes([]);
    setCurrentRound(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const averageTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="w-6 h-6 text-yellow-500" />
          Reaction Time Test
        </CardTitle>
        <CardDescription className="text-base">
          Test your reflexes by clicking as fast as possible when the screen changes
        </CardDescription>
      </CardHeader>

      <CardContent>
        {gameState === 'setup' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Reaction Speed Test</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Wait for the screen to turn green, then click as fast as you can! 
              Don't click too early or you'll have to start over.
            </p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">
                Round {currentRound + 1} of {totalRounds}
              </div>
              <Progress value={(currentRound / totalRounds) * 100} className="w-full max-w-md mx-auto" />
            </div>

            <div 
              className={`
                h-64 rounded-xl border-4 cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl font-bold
                ${isWaiting 
                  ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-500 text-white' 
                  : startTime > 0 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white hover:scale-105' 
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 text-gray-600'
                }
                ${tooEarly ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-500' : ''}
              `}
              onClick={handleClick}
            >
              {tooEarly ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <div>Too Early!</div>
                  <div className="text-lg">Wait for green...</div>
                </div>
              ) : isWaiting ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <div>Wait for it...</div>
                </div>
              ) : startTime > 0 ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div>CLICK NOW!</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div>Get Ready...</div>
                </div>
              )}
            </div>

            {reactionTimes.length > 0 && (
              <div className="text-center">
                <div className="text-lg font-medium">
                  Last reaction: {reactionTimes[reactionTimes.length - 1]}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Average: {averageTime}ms
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'completed' && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200 rounded-xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">Test Complete!</h3>
              <p className="text-yellow-700 mb-4">
                Average reaction time: {averageTime}ms
              </p>
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
                {reactionTimes.map((time, index) => (
                  <div key={index} className="bg-white rounded p-2 text-sm font-medium">
                    {time}ms
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Again
                </Button>
                <Button 
                  onClick={resetGame}
                  variant="outline"
                >
                  Back to Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Mindfulness Breathing Game
const MindfulnessGame = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(5); // minutes
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 4
  };

  const startSession = () => {
    setIsActive(true);
    setCycleCount(0);
    setTotalTime(sessionDuration * 60);
    setPhase('inhale');
    setTimeRemaining(breathingPattern.inhale);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase(currentPhase => {
            if (currentPhase === 'inhale') {
              return 'hold';
            } else if (currentPhase === 'hold') {
              return 'exhale';
            } else {
              setCycleCount(count => count + 1);
              return 'inhale';
            }
          });
          
          setTotalTime(time => {
            if (time <= 1) {
              setIsActive(false);
              return 0;
            }
            return time - 1;
          });
          
          return breathingPattern.inhale;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSession = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetSession = () => {
    stopSession();
    setCycleCount(0);
    setTotalTime(0);
    setPhase('inhale');
    setTimeRemaining(4);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-cyan-500';
      case 'hold': return 'from-purple-400 to-indigo-500';
      case 'exhale': return 'from-green-400 to-emerald-500';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Heart className="w-6 h-6 text-pink-500" />
          Mindful Breathing
        </CardTitle>
        <CardDescription className="text-base">
          Practice deep breathing exercises to reduce stress and improve focus
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!isActive && totalTime === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Mindful Breathing</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Follow the guided breathing pattern to relax your mind and body. 
              Choose your session duration and let's begin.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Session Duration</label>
              <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(parseInt(value))}>
                <SelectTrigger className="w-40 mx-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={startSession}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </div>
        )}

        {isActive && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="text-sm text-muted-foreground mb-2">
                Time Remaining: {formatTime(totalTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                Cycles Completed: {cycleCount}
              </div>
            </div>

            <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center mb-8 transition-all duration-1000 ${
              phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-90' : 'scale-100'
            }`}>
              <div className="text-white text-center">
                <div className="text-2xl font-bold mb-2">{getPhaseInstruction()}</div>
                <div className="text-4xl font-bold">{timeRemaining}</div>
              </div>
            </div>

            <div className="text-lg text-muted-foreground mb-8">
              {phase === 'inhale' && "Slowly breathe in through your nose..."}
              {phase === 'hold' && "Hold your breath gently..."}
              {phase === 'exhale' && "Slowly breathe out through your mouth..."}
            </div>

            <Button 
              onClick={stopSession}
              variant="outline"
              className="hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600 hover:text-white"
            >
              <Pause className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        )}

        {!isActive && totalTime === 0 && cycleCount > 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-pink-50 to-rose-100 border border-pink-200 rounded-xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-pink-800 mb-2">Session Complete!</h3>
              <p className="text-pink-700 mb-4">
                You completed {cycleCount} breathing cycles. Well done!
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={startSession}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Another Session
                </Button>
                <Button 
                  onClick={resetSession}
                  variant="outline"
                >
                  Back to Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MindGame;