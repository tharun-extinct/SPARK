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

  // Game symbols with icons
  const gameSymbols = [
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
    const selectedSymbols = gameSymbols.slice(0, pairs);
    
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

  // Start timer
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
              description: `You completed the game in ${moves + 1} moves and ${formatTime(timeElapsed)} seconds!`,
            });
          }
        }, 1000);
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

  // Format time display
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
            <Button onClick={initializeGame} className="bg-purple-600 hover:bg-purple-700">
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
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-sm text-blue-500">Moves</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {matches}/{difficultySettings[difficulty].pairs}
              </div>
              <div className="text-sm text-green-500">Pairs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-purple-500">Time</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Board */}
      {gameState !== 'setup' && (
        <div className="flex justify-center">
          <div 
            className={`grid gap-3 max-w-2xl mx-auto`}
            style={{
              gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridCols}, 1fr)`,
            }}
          >
            {cards.map((card) => {
              const IconComponent = card.symbol.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped || flippedCards.length >= 2}
                  className={`
                    aspect-square w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                    rounded-xl border-2 transition-all duration-300
                    flex items-center justify-center
                    ${card.isMatched 
                      ? 'bg-green-100 border-green-300 scale-95 opacity-75' 
                      : card.isFlipped 
                        ? 'bg-white border-gray-300 shadow-lg' 
                        : 'bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200 hover:border-purple-300 hover:shadow-md active:scale-95'
                    }
                    ${!card.isMatched && !card.isFlipped ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {card.isFlipped || card.isMatched ? (
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${card.symbol.color}`} />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Completed */}
      {gameState === 'completed' && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h3>
            <p className="text-green-600 mb-4">
              You completed the {difficulty} level in {moves} moves and {formatTime(timeElapsed)}!
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Screen */}
      {gameState === 'setup' && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-purple-700 mb-2">Memory Mosaic</h3>
            <p className="text-purple-600 mb-6">
              Test your memory by matching pairs of cards. Choose your difficulty level and start playing!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-green-600">Easy</h4>
                <p className="text-sm text-gray-600">6 pairs • 3x4 grid</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-blue-600">Medium</h4>
                <p className="text-sm text-gray-600">8 pairs • 4x4 grid</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-red-600">Hard</h4>
                <p className="text-sm text-gray-600">12 pairs • 4x6 grid</p>
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

  useEffect(() => {
    if (gameState === 'showing') {
      const timer = setTimeout(() => {
        if (showingIndex < sequence.length - 1) {
          setShowingIndex(prev => prev + 1);
        } else {
          setGameState('input');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, showingIndex, sequence.length]);

  const handleNumberClick = (number: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, number];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      const isCorrect = newInput.every((num, index) => num === sequence[index]);
      if (isCorrect) {
        setGameState('correct');
        setScore(prev => prev + currentLevel * 10);
        setCurrentLevel(prev => prev + 1);
        toast({
          title: "Correct! 🎉",
          description: `Level ${currentLevel} completed!`,
        });
        setTimeout(() => setGameState('ready'), 1500);
      } else {
        setGameState('wrong');
        toast({
          title: "Incorrect 😔",
          description: "Try again!",
          variant: "destructive",
        });
        setTimeout(() => setGameState('ready'), 1500);
      }
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('ready');
    setSequence([]);
    setUserInput([]);
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentLevel}</div>
            <div className="text-sm text-blue-500">Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{sequence.length}</div>
            <div className="text-sm text-purple-500">Sequence Length</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Status */}
      <Card className="text-center">
        <CardContent className="p-6">
          {gameState === 'ready' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Ready for Level {currentLevel}?</h4>
              <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Start Level {currentLevel}
              </Button>
            </div>
          )}
          
          {gameState === 'showing' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Remember this sequence:</h4>
              <div className="flex justify-center gap-2 mb-4">
                {sequence.map((num, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                      index <= showingIndex 
                        ? 'bg-blue-500 text-white border-blue-600 scale-110' 
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {index <= showingIndex ? num : '?'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {gameState === 'input' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Enter the sequence:</h4>
              <div className="flex justify-center gap-2 mb-4">
                {sequence.map((_, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
                      userInput[index] !== undefined
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {userInput[index] || '?'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {gameState === 'correct' && (
            <div className="text-green-600">
              <h4 className="text-xl font-semibold mb-2">Correct! 🎉</h4>
              <p>Moving to level {currentLevel + 1}...</p>
            </div>
          )}
          
          {gameState === 'wrong' && (
            <div className="text-red-600">
              <h4 className="text-xl font-semibold mb-2">Incorrect 😔</h4>
              <p>Try level {currentLevel} again...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Number Pad */}
      {gameState === 'input' && (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              onClick={() => handleNumberClick(number)}
              className="aspect-square text-xl font-bold bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
              variant="outline"
            >
              {number}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Pattern Recognition Game Component
const PatternGame = () => {
  const { toast } = useToast();
  const [pattern, setPattern] = useState<string[]>([]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'result'>('ready');
  const [level, setLevel] = useState(1);
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
    const newPattern = generatePattern(level + 2);
    setPattern(newPattern);
    setUserPattern([]);
    setGameState('showing');
    setShowingIndex(0);
  };

  useEffect(() => {
    if (gameState === 'showing') {
      const timer = setTimeout(() => {
        if (showingIndex < pattern.length - 1) {
          setShowingIndex(prev => prev + 1);
        } else {
          setTimeout(() => setGameState('input'), 500);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, showingIndex, pattern.length]);

  const handleColorClick = (color: string) => {
    if (gameState !== 'input') return;

    const newUserPattern = [...userPattern, color];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      const isCorrect = newUserPattern.every((c, index) => c === pattern[index]);
      if (isCorrect) {
        setScore(prev => prev + level * 15);
        setLevel(prev => prev + 1);
        toast({
          title: "Perfect! 🎨",
          description: `Level ${level} completed!`,
        });
        setTimeout(() => setGameState('ready'), 1500);
      } else {
        toast({
          title: "Not quite right 😔",
          description: "Try again!",
          variant: "destructive",
        });
        setTimeout(() => setGameState('ready'), 1500);
      }
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setGameState('ready');
    setPattern([]);
    setUserPattern([]);
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{level}</div>
            <div className="text-sm text-yellow-500">Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{pattern.length}</div>
            <div className="text-sm text-purple-500">Pattern Length</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Status */}
      <Card className="text-center">
        <CardContent className="p-6">
          {gameState === 'ready' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Ready for Level {level}?</h4>
              <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-700">
                <Play className="w-4 h-4 mr-2" />
                Start Level {level}
              </Button>
            </div>
          )}
          
          {gameState === 'showing' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Watch the pattern:</h4>
              <div className="flex justify-center gap-2 mb-4">
                {pattern.map((color, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-lg transition-all duration-300 ${
                      index <= showingIndex 
                        ? `${colorClasses[color as keyof typeof colorClasses]} scale-110 shadow-lg` 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {gameState === 'input' && (
            <div>
              <h4 className="text-xl font-semibold mb-4">Repeat the pattern:</h4>
              <div className="flex justify-center gap-2 mb-4">
                {pattern.map((_, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-lg ${
                      userPattern[index] 
                        ? `${colorClasses[userPattern[index] as keyof typeof colorClasses]}` 
                        : 'bg-gray-200 border-2 border-dashed border-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Buttons */}
      {gameState === 'input' && (
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {colors.map((color) => (
            <Button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`aspect-square h-20 ${colorClasses[color as keyof typeof colorClasses]} text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform`}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main MindGame Component
const MindGame = () => {
  const [activeGame, setActiveGame] = useState('memory');

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
              Mind Games 🧠
            </h1>
            <p className="text-xl text-muted-foreground">
              Challenge your cognitive abilities with these brain training games
            </p>
          </div>

          {/* Game Tabs */}
          <Tabs value={activeGame} onValueChange={setActiveGame} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger 
                value="memory" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Brain className="w-4 h-4" />
                Memory Mosaic
              </TabsTrigger>
              <TabsTrigger 
                value="sequence" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Target className="w-4 h-4" />
                Number Sequence
              </TabsTrigger>
              <TabsTrigger 
                value="pattern" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                Pattern Recognition
              </TabsTrigger>
            </TabsList>

            <TabsContent value="memory" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <MemoryGame />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sequence" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <NumberSequenceGame />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pattern" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <PatternGame />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MindGame;