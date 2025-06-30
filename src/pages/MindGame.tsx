import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Zap, 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Star,
  Heart,
  Diamond,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  Flower,
  Leaf,
  Apple,
  Coffee,
  Music,
  Camera,
  Gift
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Memory Mosaic Game Component
const MemoryGame = () => {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [cards, setCards] = useState<Array<{id: number, symbol: any, isFlipped: boolean, isMatched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Card symbols with icons
  const symbols = [
    { icon: Heart, color: 'text-red-500' },
    { icon: Star, color: 'text-yellow-500' },
    { icon: Diamond, color: 'text-blue-500' },
    { icon: Circle, color: 'text-green-500' },
    { icon: Square, color: 'text-purple-500' },
    { icon: Triangle, color: 'text-pink-500' },
    { icon: Hexagon, color: 'text-indigo-500' },
    { icon: Sparkles, color: 'text-orange-500' },
    { icon: Sun, color: 'text-amber-500' },
    { icon: Moon, color: 'text-slate-500' },
    { icon: Cloud, color: 'text-sky-500' },
    { icon: Flower, color: 'text-rose-500' },
    { icon: Leaf, color: 'text-emerald-500' },
    { icon: Apple, color: 'text-red-600' },
    { icon: Coffee, color: 'text-amber-700' },
    { icon: Music, color: 'text-violet-500' },
    { icon: Camera, color: 'text-gray-600' },
    { icon: Gift, color: 'text-teal-500' }
  ];

  // Difficulty settings
  const difficultySettings = {
    easy: { pairs: 6, gridCols: 3 },
    medium: { pairs: 8, gridCols: 4 },
    hard: { pairs: 12, gridCols: 4 }
  };

  // Initialize game
  const initializeGame = () => {
    const { pairs } = difficultySettings[difficulty];
    const selectedSymbols = symbols.slice(0, pairs);
    
    // Create pairs of cards
    const gameCards = [];
    selectedSymbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameState('playing');
    setIsGameActive(true);
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!isGameActive || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol.icon === secondCard.symbol.icon) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is completed
          const newMatches = matches + 1;
          if (newMatches === difficultySettings[difficulty].pairs) {
            setGameState('completed');
            setIsGameActive(false);
            toast({
              title: "Congratulations! 🎉",
              description: `You completed the game in ${moves + 1} moves and ${formatTime(timeElapsed)}!`,
            });
          }
        }, 500);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (isGameActive) {
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
  }, [isGameActive]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset game
  const resetGame = () => {
    setGameState('setup');
    setIsGameActive(false);
    setCards([]);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
  };

  const { pairs, gridCols } = difficultySettings[difficulty];

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Memory Mosaic
          </h3>
          <p className="text-muted-foreground">Match pairs of cards to test your memory</p>
        </div>
        
        {gameState === 'setup' && (
          <div className="flex items-center gap-2">
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="easy">Easy (6 pairs)</option>
              <option value="medium">Medium (8 pairs)</option>
              <option value="hard">Hard (12 pairs)</option>
            </select>
            <Button onClick={initializeGame} className="bg-gradient-to-r from-purple-500 to-pink-600">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameState !== 'setup' && (
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        )}
      </div>

      {/* Game Stats */}
      {gameState !== 'setup' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{moves}</div>
                  <div className="text-sm text-blue-500">Moves</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{matches}/{pairs}</div>
                  <div className="text-sm text-green-500">Pairs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-purple-500">Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Board */}
      {gameState !== 'setup' && (
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div 
              className={`grid gap-3 mx-auto max-w-2xl`}
              style={{ 
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                aspectRatio: gridCols === 3 ? '3/4' : '1/1'
              }}
            >
              {cards.map((card) => {
                const IconComponent = card.symbol.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={!isGameActive || card.isMatched}
                    className={`
                      relative aspect-square rounded-xl border-2 transition-all duration-300 
                      hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500
                      ${card.isFlipped || card.isMatched 
                        ? 'bg-white border-gray-300 shadow-lg' 
                        : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 hover:from-purple-200 hover:to-indigo-200'
                      }
                      ${card.isMatched ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Card Back */}
                    <div className={`
                      absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-300
                      ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}
                    `}>
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>

                    {/* Card Front */}
                    <div className={`
                      absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-300
                      ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <IconComponent className={`w-8 h-8 ${card.symbol.color}`} />
                    </div>

                    {/* Matched indicator */}
                    {card.isMatched && (
                      <div className="absolute top-1 right-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Screen */}
      {gameState === 'setup' && (
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Memory Mosaic</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Test your memory by matching pairs of cards. Flip two cards at a time to find matching symbols. 
                  Complete the game in the fewest moves possible!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">Easy</div>
                  <div className="text-sm text-green-500">6 pairs • 3×4 grid</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">Medium</div>
                  <div className="text-sm text-blue-500">8 pairs • 4×4 grid</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600 mb-1">Hard</div>
                  <div className="text-sm text-red-500">12 pairs • 4×6 grid</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Screen */}
      {gameState === 'completed' && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Congratulations! 🎉</h3>
                <p className="text-yellow-700">
                  You completed the {difficulty} level in {moves} moves and {formatTime(timeElapsed)}!
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={initializeGame} className="bg-gradient-to-r from-purple-500 to-pink-600">
                  Play Again
                </Button>
                <Button onClick={resetGame} variant="outline">
                  Change Difficulty
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Number Sequence Game Component
const NumberSequenceGame = () => {
  const { toast } = useToast();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'correct' | 'wrong'>('ready');
  const [score, setScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);

  const generateSequence = (length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 9) + 1);
    }
    return newSequence;
  };

  const startGame = () => {
    const newSequence = generateSequence(currentLevel + 2);
    setSequence(newSequence);
    setUserInput([]);
    setGameState('showing');
    setShowingIndex(0);
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('ready');
    setSequence([]);
    setUserInput([]);
  };

  useEffect(() => {
    if (gameState === 'showing' && showingIndex < sequence.length) {
      const timer = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex >= sequence.length) {
      setTimeout(() => {
        setGameState('input');
      }, 500);
    }
  }, [gameState, showingIndex, sequence.length]);

  const handleNumberClick = (number: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, number];
    setUserInput(newInput);

    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setGameState('wrong');
      toast({
        title: "Game Over!",
        description: `You reached level ${currentLevel} with a score of ${score}`,
        variant: "destructive",
      });
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('correct');
      const newScore = score + (currentLevel * 10);
      setScore(newScore);
      setCurrentLevel(prev => prev + 1);
      
      toast({
        title: "Correct! 🎉",
        description: `Level ${currentLevel} completed! Moving to level ${currentLevel + 1}`,
      });

      setTimeout(() => {
        startGame();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Number Sequence
          </h3>
          <p className="text-muted-foreground">Remember and repeat the number sequence</p>
        </div>
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentLevel}</div>
            <div className="text-sm text-blue-500">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{sequence.length}</div>
            <div className="text-sm text-purple-500">Sequence Length</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-8">
          {gameState === 'ready' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Number Sequence Challenge</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Watch the sequence of numbers, then repeat them in the correct order. 
                  Each level adds more numbers to remember!
                </p>
              </div>
              <Button onClick={startGame} className="bg-gradient-to-r from-blue-500 to-cyan-600">
                <Play className="w-4 h-4 mr-2" />
                Start Level {currentLevel}
              </Button>
            </div>
          )}

          {gameState === 'showing' && (
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold">Watch the sequence:</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                {sequence.map((num, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                      index < showingIndex
                        ? 'bg-blue-500 text-white scale-110'
                        : index === showingIndex
                        ? 'bg-blue-600 text-white scale-125 shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index <= showingIndex ? num : '?'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Enter the sequence:</h3>
                <div className="flex justify-center gap-2 flex-wrap mb-6">
                  {sequence.map((_, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold border-2 ${
                        index < userInput.length
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {index < userInput.length ? userInput[index] : '?'}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="h-16 text-xl font-bold bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'correct' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">Correct! 🎉</h3>
              <p className="text-muted-foreground">Preparing next level...</p>
            </div>
          )}

          {gameState === 'wrong' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">Game Over!</h3>
              <p className="text-muted-foreground">
                You reached level {currentLevel} with a score of {score}
              </p>
              <Button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-cyan-600">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Pattern Recognition Game Component
const PatternGame = () => {
  const { toast } = useToast();
  const [pattern, setPattern] = useState<string[]>([]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'correct' | 'wrong'>('ready');
  const [score, setScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  const generatePattern = (length: number) => {
    const newPattern = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return newPattern;
  };

  const startGame = () => {
    const newPattern = generatePattern(currentLevel + 2);
    setPattern(newPattern);
    setUserPattern([]);
    setGameState('showing');
    setShowingIndex(0);
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('ready');
    setPattern([]);
    setUserPattern([]);
  };

  useEffect(() => {
    if (gameState === 'showing' && showingIndex < pattern.length) {
      const timer = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex >= pattern.length) {
      setTimeout(() => {
        setGameState('input');
      }, 500);
    }
  }, [gameState, showingIndex, pattern.length]);

  const handleColorClick = (color: string) => {
    if (gameState !== 'input') return;

    const newPattern = [...userPattern, color];
    setUserPattern(newPattern);

    if (newPattern[newPattern.length - 1] !== pattern[newPattern.length - 1]) {
      setGameState('wrong');
      toast({
        title: "Game Over!",
        description: `You reached level ${currentLevel} with a score of ${score}`,
        variant: "destructive",
      });
      return;
    }

    if (newPattern.length === pattern.length) {
      setGameState('correct');
      const newScore = score + (currentLevel * 15);
      setScore(newScore);
      setCurrentLevel(prev => prev + 1);
      
      toast({
        title: "Perfect! 🎉",
        description: `Level ${currentLevel} completed! Moving to level ${currentLevel + 1}`,
      });

      setTimeout(() => {
        startGame();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Pattern Recognition
          </h3>
          <p className="text-muted-foreground">Remember and repeat the color pattern</p>
        </div>
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{currentLevel}</div>
            <div className="text-sm text-yellow-500">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{pattern.length}</div>
            <div className="text-sm text-purple-500">Pattern Length</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-8">
          {gameState === 'ready' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Pattern Recognition Challenge</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Watch the sequence of colors light up, then repeat the pattern by clicking the colors in the same order.
                </p>
              </div>
              <Button onClick={startGame} className="bg-gradient-to-r from-yellow-500 to-orange-600">
                <Play className="w-4 h-4 mr-2" />
                Start Level {currentLevel}
              </Button>
            </div>
          )}

          {gameState === 'showing' && (
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold">Watch the pattern:</h3>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-20 h-20 rounded-lg transition-all duration-300 ${
                      pattern[showingIndex - 1] === color && showingIndex > 0
                        ? `${colorClasses[color as keyof typeof colorClasses]} scale-110 shadow-lg`
                        : 'bg-gray-200'
                    }`}
                    disabled
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Step {showingIndex} of {pattern.length}
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Repeat the pattern:</h3>
                <div className="flex justify-center gap-2 flex-wrap mb-6">
                  {pattern.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full border-2 ${
                        index < userPattern.length
                          ? 'bg-green-500 border-green-500'
                          : 'bg-gray-200 border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className={`w-20 h-20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                      colorClasses[color as keyof typeof colorClasses]
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {gameState === 'correct' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">Perfect! 🎉</h3>
              <p className="text-muted-foreground">Preparing next level...</p>
            </div>
          )}

          {gameState === 'wrong' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">Game Over!</h3>
              <p className="text-muted-foreground">
                You reached level {currentLevel} with a score of {score}
              </p>
              <Button onClick={resetGame} className="bg-gradient-to-r from-yellow-500 to-orange-600">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main MindGame Component
const MindGame = () => {
  const [activeTab, setActiveTab] = useState('memory');

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Mind Games
            </h1>
            <p className="text-xl text-muted-foreground">
              Challenge your brain with these cognitive training games
            </p>
          </div>

          {/* Game Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger 
                value="memory" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
              >
                <Brain className="w-4 h-4" />
                Memory Mosaic
              </TabsTrigger>
              <TabsTrigger 
                value="sequence" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
              >
                <Target className="w-4 h-4" />
                Number Sequence
              </TabsTrigger>
              <TabsTrigger 
                value="pattern" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                Pattern Recognition
              </TabsTrigger>
            </TabsList>

            <TabsContent value="memory">
              <MemoryGame />
            </TabsContent>

            <TabsContent value="sequence">
              <NumberSequenceGame />
            </TabsContent>

            <TabsContent value="pattern">
              <PatternGame />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MindGame;