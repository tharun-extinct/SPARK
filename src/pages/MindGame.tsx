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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Memory Mosaic Game Component
const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('setup'); // setup, playing, paused, completed
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  // Card symbols with icons
  const cardSymbols = [
    { icon: Heart, color: '#ef4444', name: 'heart' },
    { icon: Star, color: '#f59e0b', name: 'star' },
    { icon: Diamond, color: '#8b5cf6', name: 'diamond' },
    { icon: Circle, color: '#06b6d4', name: 'circle' },
    { icon: Square, color: '#10b981', name: 'square' },
    { icon: Triangle, color: '#f97316', name: 'triangle' },
    { icon: Hexagon, color: '#ec4899', name: 'hexagon' },
    { icon: Sparkles, color: '#6366f1', name: 'sparkles' },
    { icon: Sun, color: '#eab308', name: 'sun' },
    { icon: Moon, color: '#64748b', name: 'moon' },
    { icon: Cloud, color: '#0ea5e9', name: 'cloud' },
    { icon: Flower, color: '#d946ef', name: 'flower' },
    { icon: Leaf, color: '#22c55e', name: 'leaf' },
    { icon: Apple, color: '#dc2626', name: 'apple' },
    { icon: Coffee, color: '#92400e', name: 'coffee' },
    { icon: Music, color: '#7c3aed', name: 'music' },
    { icon: Camera, color: '#374151', name: 'camera' },
    { icon: Gift, color: '#be185d', name: 'gift' }
  ];

  // Difficulty settings
  const difficultySettings = {
    easy: { pairs: 6, gridCols: 3, timeBonus: 10 },
    medium: { pairs: 8, gridCols: 4, timeBonus: 15 },
    hard: { pairs: 12, gridCols: 4, timeBonus: 20 },
    expert: { pairs: 18, gridCols: 6, timeBonus: 25 }
  };

  // Initialize game
  const initializeGame = () => {
    const settings = difficultySettings[difficulty];
    const selectedSymbols = cardSymbols.slice(0, settings.pairs);
    
    // Create pairs of cards
    const gameCards = [];
    selectedSymbols.forEach((symbol, index) => {
      // Add two cards for each symbol
      gameCards.push(
        { id: `${symbol.name}-1`, symbol, isFlipped: false, isMatched: false },
        { id: `${symbol.name}-2`, symbol, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTime(0);
    setScore(0);
    setGameState('playing');
  };

  // Start timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Handle card click
  const handleCardClick = (cardId) => {
    if (gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard.symbol.name === secondCard.symbol.name) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstCardId || c.id === secondCardId) 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedCards(prev => [...prev, firstCardId, secondCardId]);
          setFlippedCards([]);
          
          // Calculate score
          const timeBonus = Math.max(0, difficultySettings[difficulty].timeBonus - Math.floor(time / 10));
          setScore(prev => prev + 100 + timeBonus);
        }, 500);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstCardId || c.id === secondCardId) 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && matchedCards.length === cards.length) {
      setGameState('completed');
      clearInterval(timerRef.current);
    }
  }, [matchedCards, cards]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get grid classes based on difficulty
  const getGridClasses = () => {
    const settings = difficultySettings[difficulty];
    return `grid gap-2 sm:gap-3 md:gap-4 grid-cols-${settings.gridCols} max-w-2xl mx-auto`;
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Memory Mosaic</h3>
          <p className="text-gray-600">Match pairs of cards to test your memory</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={difficulty} onValueChange={setDifficulty} disabled={gameState === 'playing'}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {gameState === 'setup' ? 'Start Game' : 'New Game'}
          </Button>
        </div>
      </div>

      {/* Game Stats */}
      {gameState !== 'setup' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-sm text-blue-500">Moves</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {matchedCards.length / 2}/{difficultySettings[difficulty].pairs}
              </div>
              <div className="text-sm text-green-500">Pairs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(time)}</div>
              <div className="text-sm text-purple-500">Time</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{score}</div>
              <div className="text-sm text-orange-500">Score</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Board */}
      {gameState === 'setup' ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Brain className="w-16 h-16 mx-auto text-purple-500" />
            <h3 className="text-xl font-semibold">Ready to Challenge Your Memory?</h3>
            <p className="text-gray-600">Select your difficulty level and start the game!</p>
            <Button 
              onClick={initializeGame}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Start Memory Game
            </Button>
          </div>
        </Card>
      ) : gameState === 'completed' ? (
        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
            <h3 className="text-2xl font-bold text-green-700">Congratulations!</h3>
            <div className="space-y-2">
              <p className="text-green-600">You completed the {difficulty} level!</p>
              <div className="flex justify-center gap-6 text-sm">
                <span>Time: {formatTime(time)}</span>
                <span>Moves: {moves}</span>
                <span>Score: {score}</span>
              </div>
            </div>
            <Button 
              onClick={initializeGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Play Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className={getGridClasses()}>
          {cards.map((card) => {
            const IconComponent = card.symbol.icon;
            const isFlipped = card.isFlipped || card.isMatched;
            
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isFlipped ? 'bg-white shadow-lg' : 'bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200'}
                  ${card.isMatched ? 'ring-2 ring-green-400 bg-green-50' : ''}
                  border-2 border-white shadow-md
                  flex items-center justify-center
                  select-none
                  min-h-[80px] sm:min-h-[100px] md:min-h-[120px]
                `}
              >
                {isFlipped ? (
                  <IconComponent 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" 
                    style={{ color: card.symbol.color }}
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Bar */}
      {gameState === 'playing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round((matchedCards.length / cards.length) * 100)}%</span>
          </div>
          <Progress value={(matchedCards.length / cards.length) * 100} className="h-2" />
        </div>
      )}
    </div>
  );
};

// Number Sequence Game Component
const NumberSequenceGame = () => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState('ready'); // ready, showing, input, correct, wrong, gameOver
  const [score, setScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);

  const generateSequence = (length) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startGame = () => {
    const newSequence = generateSequence(currentLevel + 2);
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
    setShowingIndex(0);
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('ready');
    setSequence([]);
    setUserSequence([]);
  };

  // Show sequence animation
  useEffect(() => {
    if (gameState === 'showing' && showingIndex < sequence.length) {
      const timer = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex >= sequence.length) {
      setTimeout(() => {
        setGameState('input');
        setShowingIndex(0);
      }, 500);
    }
  }, [gameState, showingIndex, sequence.length]);

  const handleNumberClick = (number) => {
    if (gameState !== 'input') return;

    const newUserSequence = [...userSequence, number];
    setUserSequence(newUserSequence);

    // Check if the number is correct
    if (number !== sequence[newUserSequence.length - 1]) {
      setGameState('wrong');
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      setGameState('correct');
      setScore(prev => prev + currentLevel * 10);
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        startGame();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Number Sequence</h3>
        <p className="text-gray-600">Remember and repeat the number sequence</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{currentLevel}</div>
            <div className="text-sm text-blue-500">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-600">{sequence.length}</div>
            <div className="text-sm text-purple-500">Length</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="p-6">
        {gameState === 'ready' && (
          <div className="text-center space-y-4">
            <Target className="w-16 h-16 mx-auto text-blue-500" />
            <h4 className="text-xl font-semibold">Ready to Start?</h4>
            <p className="text-gray-600">Watch the sequence, then repeat it!</p>
            <Button onClick={startGame} size="lg" className="bg-blue-500 hover:bg-blue-600">
              Start Game
            </Button>
          </div>
        )}

        {gameState === 'showing' && (
          <div className="text-center space-y-4">
            <h4 className="text-lg font-semibold">Watch the sequence:</h4>
            <div className="flex justify-center gap-2 flex-wrap">
              {sequence.map((num, index) => (
                <div
                  key={index}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold
                    transition-all duration-300
                    ${index < showingIndex 
                      ? 'bg-blue-500 text-white scale-110' 
                      : index === showingIndex 
                        ? 'bg-blue-400 text-white scale-125 ring-4 ring-blue-200' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {index < showingIndex || index === showingIndex ? num : '?'}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'input' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-center">Enter the sequence:</h4>
            
            {/* User's input display */}
            <div className="flex justify-center gap-2 flex-wrap mb-6">
              {sequence.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border-2
                    ${index < userSequence.length 
                      ? 'bg-green-100 border-green-300 text-green-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {index < userSequence.length ? userSequence[index] : '?'}
                </div>
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="h-12 text-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                  variant="outline"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'correct' && (
          <div className="text-center space-y-4">
            <div className="text-green-500">
              <Trophy className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-green-700">Correct!</h4>
            <p className="text-green-600">Moving to level {currentLevel + 1}...</p>
          </div>
        )}

        {gameState === 'wrong' && (
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <Target className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-red-700">Game Over!</h4>
            <p className="text-red-600">You reached level {currentLevel}</p>
            <p className="text-gray-600">Final Score: {score}</p>
            <Button onClick={resetGame} className="bg-red-500 hover:bg-red-600">
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// Pattern Recognition Game Component
const PatternGame = () => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);

  const colors = [
    { id: 1, color: 'bg-red-500', name: 'red' },
    { id: 2, color: 'bg-blue-500', name: 'blue' },
    { id: 3, color: 'bg-green-500', name: 'green' },
    { id: 4, color: 'bg-yellow-500', name: 'yellow' },
    { id: 5, color: 'bg-purple-500', name: 'purple' },
    { id: 6, color: 'bg-pink-500', name: 'pink' }
  ];

  const generatePattern = (length) => {
    return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
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

  // Show pattern animation
  useEffect(() => {
    if (gameState === 'showing' && showingIndex < pattern.length) {
      const timer = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex >= pattern.length) {
      setTimeout(() => {
        setGameState('input');
        setShowingIndex(0);
      }, 500);
    }
  }, [gameState, showingIndex, pattern.length]);

  const handleColorClick = (color) => {
    if (gameState !== 'input') return;

    const newUserPattern = [...userPattern, color];
    setUserPattern(newUserPattern);

    // Check if the color is correct
    if (color.id !== pattern[newUserPattern.length - 1].id) {
      setGameState('wrong');
      return;
    }

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      setGameState('correct');
      setScore(prev => prev + currentLevel * 15);
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        startGame();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Pattern Recognition</h3>
        <p className="text-gray-600">Watch the color pattern and repeat it</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{currentLevel}</div>
            <div className="text-sm text-blue-500">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-500">Score</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-600">{pattern.length}</div>
            <div className="text-sm text-purple-500">Length</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="p-6">
        {gameState === 'ready' && (
          <div className="text-center space-y-4">
            <Zap className="w-16 h-16 mx-auto text-purple-500" />
            <h4 className="text-xl font-semibold">Ready for Pattern Challenge?</h4>
            <p className="text-gray-600">Watch the colors light up, then repeat the pattern!</p>
            <Button onClick={startGame} size="lg" className="bg-purple-500 hover:bg-purple-600">
              Start Game
            </Button>
          </div>
        )}

        {gameState === 'showing' && (
          <div className="text-center space-y-6">
            <h4 className="text-lg font-semibold">Watch the pattern:</h4>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {colors.map(color => {
                const isActive = showingIndex > 0 && pattern.slice(0, showingIndex).some(p => p.id === color.id);
                const isCurrent = showingIndex < pattern.length && pattern[showingIndex]?.id === color.id;
                
                return (
                  <div
                    key={color.id}
                    className={`
                      w-20 h-20 rounded-lg transition-all duration-300
                      ${color.color}
                      ${isCurrent ? 'scale-110 ring-4 ring-white shadow-lg brightness-125' : 'opacity-60'}
                    `}
                  />
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'input' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-center">Repeat the pattern:</h4>
            
            {/* User's progress */}
            <div className="flex justify-center gap-2 flex-wrap">
              {pattern.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-8 h-8 rounded border-2
                    ${index < userPattern.length 
                      ? `${userPattern[index].color} border-gray-300` 
                      : 'bg-gray-200 border-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            {/* Color buttons */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {colors.map(color => (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color)}
                  className={`
                    w-20 h-20 rounded-lg transition-all duration-200 transform hover:scale-105
                    ${color.color} hover:brightness-110 active:scale-95
                  `}
                />
              ))}
            </div>
          </div>
        )}

        {gameState === 'correct' && (
          <div className="text-center space-y-4">
            <div className="text-green-500">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-green-700">Perfect!</h4>
            <p className="text-green-600">Moving to level {currentLevel + 1}...</p>
          </div>
        )}

        {gameState === 'wrong' && (
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <Zap className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-red-700">Game Over!</h4>
            <p className="text-red-600">You reached level {currentLevel}</p>
            <p className="text-gray-600">Final Score: {score}</p>
            <Button onClick={resetGame} className="bg-red-500 hover:bg-red-600">
              Try Again
            </Button>
          </div>
        )}
      </Card>
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
              Mind Games
            </h1>
            <p className="text-xl text-muted-foreground">
              Challenge your brain with these cognitive training games
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
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300"
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