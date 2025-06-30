import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Brain, 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Zap, 
  Heart, 
  Sparkles,
  RefreshCw,
  Check,
  X,
  Gamepad2,
  Flower,
  Leaf,
  Sun
} from 'lucide-react';
import { useAuth } from '@/services/firebaseAuth';
import { useToast } from '@/components/ui/use-toast';

// Memory Game Component
const MemoryGame = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Array<{id: number, emoji: string, flipped: boolean, matched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [bestScore, setBestScore] = useState<{easy: number, medium: number, hard: number}>({
    easy: Infinity,
    medium: Infinity,
    hard: Infinity
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Emoji sets for different difficulties
  const emojiSets = {
    easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
    medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮']
  };

  // Initialize game
  const initializeGame = () => {
    const emojis = emojiSets[difficulty as keyof typeof emojiSets];
    let gameCards = [...emojis, ...emojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start game timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true);
      startTimer();
    }
    
    // Ignore click if card is already flipped or matched
    if (cards[id].flipped || cards[id].matched) return;
    
    // Ignore if two cards are already flipped
    if (flippedCards.length === 2) return;
    
    // Flip the card
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].matched = true;
          matchedCards[secondId].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prev => prev + 1);
          
          // Check if game is completed
          const totalPairs = matchedCards.length / 2;
          if (matchedPairs + 1 === totalPairs) {
            setGameCompleted(true);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Update best score
            if (moves + 1 < bestScore[difficulty as keyof typeof bestScore]) {
              const newBestScore = {...bestScore};
              newBestScore[difficulty as keyof typeof bestScore] = moves + 1;
              setBestScore(newBestScore);
              
              toast({
                title: "New Best Score!",
                description: `You've set a new record for ${difficulty} difficulty: ${moves + 1} moves.`,
              });
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const unflippedCards = [...cards];
          unflippedCards[firstId].flipped = false;
          unflippedCards[secondId].flipped = false;
          setCards(unflippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    initializeGame();
  };

  // Initialize game on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
    
    // Load best scores from localStorage
    const savedScores = localStorage.getItem('memoryGameBestScores');
    if (savedScores) {
      setBestScore(JSON.parse(savedScores));
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  // Save best scores to localStorage when they change
  useEffect(() => {
    localStorage.setItem('memoryGameBestScores', JSON.stringify(bestScore));
  }, [bestScore]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Memory Mosaic</h2>
          <p className="text-muted-foreground">Match pairs of cards to test your memory</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={difficulty} onValueChange={changeDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={initializeGame}
            title="Restart Game"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-blue-600 font-medium">Moves</div>
            <div className="text-2xl font-bold text-blue-700">{moves}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-green-600 font-medium">Pairs</div>
            <div className="text-2xl font-bold text-green-700">{matchedPairs}/{cards.length / 2}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-purple-600 font-medium">Time</div>
            <div className="text-2xl font-bold text-purple-700">{formatTime(timer)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Board */}
      <div className={`grid gap-2 ${
        difficulty === 'easy' ? 'grid-cols-3 sm:grid-cols-4' : 
        difficulty === 'medium' ? 'grid-cols-4' : 
        'grid-cols-4 sm:grid-cols-6'
      }`}>
        {cards.map((card) => (
          <div 
            key={card.id}
            className={`aspect-square bg-white rounded-lg border-2 cursor-pointer transition-all duration-300 transform ${
              card.flipped || card.matched ? 'rotate-y-180' : ''
            } ${
              card.matched ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="h-full w-full flex items-center justify-center text-3xl sm:text-4xl">
              {(card.flipped || card.matched) ? (
                <div className="rotate-y-180">{card.emoji}</div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Game Completion */}
      {gameCompleted && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-1">Congratulations!</h3>
            <p className="text-green-700 mb-3">You completed the game in {moves} moves and {formatTime(timer)}.</p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={initializeGame}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Play Again
              </Button>
              <Button 
                onClick={() => changeDifficulty(
                  difficulty === 'easy' ? 'medium' : 
                  difficulty === 'medium' ? 'hard' : 'easy'
                )}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                {difficulty === 'easy' ? 'Try Medium' : 
                 difficulty === 'medium' ? 'Try Hard' : 'Try Easy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Game Info */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">Benefits of Memory Games:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Improves concentration and attention to detail</li>
            <li>Enhances short-term memory and recall</li>
            <li>Reduces stress and provides mental relaxation</li>
            <li>Helps maintain cognitive function as we age</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Focus Flow Game Component
const FocusFlowGame = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetEmoji, setTargetEmoji] = useState('');
  const [found, setFound] = useState(0);
  const [total, setTotal] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [shake, setShake] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Emoji sets
  const emojiSets = [
    // Level 1-3
    ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    // Level 4-6
    ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑'],
    // Level 7-9
    ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃'],
    // Level 10+
    ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲']
  ];

  // Initialize game
  const initializeGame = () => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('focusFlowHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    setGameStarted(false);
    setGameCompleted(false);
    setLevel(1);
    setScore(0);
    setTimeLeft(getDifficultyTime());
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Get time based on difficulty
  const getDifficultyTime = () => {
    switch (difficulty) {
      case 'easy': return 45;
      case 'hard': return 20;
      default: return 30; // medium
    }
  };

  // Get grid size based on level
  const getGridSize = () => {
    if (level <= 3) return 4;
    if (level <= 6) return 5;
    if (level <= 9) return 6;
    return 7;
  };

  // Get number of targets based on level
  const getTargetCount = () => {
    return Math.min(5, Math.max(1, Math.floor(level / 2)));
  };

  // Generate game grid
  const generateGrid = () => {
    const gridSize = getGridSize();
    const targetCount = getTargetCount();
    
    // Select emoji set based on level
    const emojiSetIndex = Math.min(Math.floor(level / 4), emojiSets.length - 1);
    const currentEmojiSet = emojiSets[emojiSetIndex];
    
    // Select target emoji
    const newTargetEmoji = currentEmojiSet[Math.floor(Math.random() * currentEmojiSet.length)];
    setTargetEmoji(newTargetEmoji);
    
    // Generate grid
    const newGrid: string[][] = [];
    let targetPositions: number[] = [];
    
    // Place targets
    for (let i = 0; i < targetCount; i++) {
      let position;
      do {
        position = Math.floor(Math.random() * (gridSize * gridSize));
      } while (targetPositions.includes(position));
      targetPositions.push(position);
    }
    
    setTotal(targetCount);
    setFound(0);
    
    // Fill grid
    let cellIndex = 0;
    for (let i = 0; i < gridSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < gridSize; j++) {
        if (targetPositions.includes(cellIndex)) {
          row.push(newTargetEmoji);
        } else {
          // Select a different emoji for distractors
          let distractorEmoji;
          do {
            distractorEmoji = currentEmojiSet[Math.floor(Math.random() * currentEmojiSet.length)];
          } while (distractorEmoji === newTargetEmoji);
          row.push(distractorEmoji);
        }
        cellIndex++;
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
  };

  // Start game
  const startGame = () => {
    generateGrid();
    setGameStarted(true);
    setTimeLeft(getDifficultyTime());
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // End game
  const endGame = () => {
    setGameCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('focusFlowHighScore', score.toString());
      
      toast({
        title: "New High Score!",
        description: `You've set a new record: ${score} points.`,
      });
    }
  };

  // Handle cell click
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!gameStarted || gameCompleted) return;
    
    const clickedEmoji = grid[rowIndex][colIndex];
    
    if (clickedEmoji === targetEmoji) {
      // Correct click
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = '✓';
      setGrid(newGrid);
      
      setFound(prev => {
        const newFound = prev + 1;
        
        // Add points
        setScore(prevScore => prevScore + (10 * level));
        
        // Check if all targets found
        if (newFound >= total) {
          // Level completed
          setTimeout(() => {
            setLevel(prevLevel => prevLevel + 1);
            generateGrid();
            
            // Add time bonus
            setTimeLeft(prev => prev + 5);
            
            toast({
              title: "Level Up!",
              description: `Level ${level} completed! +5 seconds bonus.`,
            });
          }, 500);
        }
        
        return newFound;
      });
    } else {
      // Wrong click
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // Penalty
      setTimeLeft(prev => Math.max(1, prev - 2));
      
      toast({
        title: "Wrong!",
        description: "That's not the target emoji. -2 seconds penalty.",
        variant: "destructive",
      });
    }
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    initializeGame();
  };

  // Initialize on mount
  useEffect(() => {
    initializeGame();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Focus Flow</h2>
          <p className="text-muted-foreground">Find all the target emojis before time runs out</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={difficulty} onValueChange={changeDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={initializeGame}
            title="Restart Game"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-blue-600 font-medium">Level</div>
            <div className="text-2xl font-bold text-blue-700">{level}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-green-600 font-medium">Score</div>
            <div className="text-2xl font-bold text-green-700">{score}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-purple-600 font-medium">Found</div>
            <div className="text-2xl font-bold text-purple-700">{found}/{total}</div>
          </CardContent>
        </Card>
        
        <Card className={`${timeLeft <= 5 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
          <CardContent className="p-3 text-center">
            <div className={`text-sm ${timeLeft <= 5 ? 'text-red-600' : 'text-orange-600'} font-medium`}>Time</div>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-700' : 'text-orange-700'}`}>{timeLeft}s</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Board */}
      {!gameStarted && !gameCompleted ? (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-indigo-800 mb-2">Ready to Focus?</h3>
            <p className="text-indigo-700 mb-6">Find all instances of the target emoji as quickly as possible!</p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      ) : gameCompleted ? (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Game Over!</h3>
            <p className="text-green-700 mb-2">You reached level {level} and scored {score} points.</p>
            <p className="text-green-600 mb-6">High Score: {highScore}</p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={initializeGame}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Play Again
              </Button>
              <Button 
                onClick={() => changeDifficulty(
                  difficulty === 'easy' ? 'medium' : 
                  difficulty === 'medium' ? 'hard' : 'easy'
                )}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                {difficulty === 'easy' ? 'Try Medium' : 
                 difficulty === 'medium' ? 'Try Hard' : 'Try Easy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`space-y-4 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex justify-center items-center gap-2 p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-800">Find all</p>
              <div className="text-4xl">{targetEmoji}</div>
            </div>
          </div>
          
          <div className={`grid gap-2 grid-cols-${getGridSize()}`}>
            {grid.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square bg-white rounded-lg border-2 cursor-pointer flex items-center justify-center text-2xl sm:text-3xl ${
                      cell === '✓' ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      {/* Game Info */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">Benefits of Focus Games:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Improves attention span and concentration</li>
            <li>Enhances visual processing and search skills</li>
            <li>Reduces distractibility in everyday tasks</li>
            <li>Helps with ADHD symptoms and cognitive training</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Gratitude Garden Component
const GratitudeGarden = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeEntries, setGratitudeEntries] = useState<Array<{id: string, text: string, date: Date}>>([]);
  const [gardenLevel, setGardenLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null);
  
  // Load saved entries on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('gratitudeEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      // Convert string dates back to Date objects
      const entriesWithDates = parsedEntries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setGratitudeEntries(entriesWithDates);
      
      // Calculate garden level based on number of entries
      setGardenLevel(Math.min(5, Math.max(1, Math.floor(entriesWithDates.length / 5) + 1)));
    }
    
    // Load streak data
    const savedStreak = localStorage.getItem('gratitudeStreak');
    const savedLastEntry = localStorage.getItem('gratitudeLastEntry');
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    
    if (savedLastEntry) {
      setLastEntryDate(savedLastEntry);
      
      // Check if streak is still valid
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (savedLastEntry !== today && savedLastEntry !== yesterdayStr) {
        // Streak broken
        setStreak(0);
        localStorage.setItem('gratitudeStreak', '0');
      }
    }
  }, []);

  // Add new gratitude entry
  const addGratitudeEntry = () => {
    if (!gratitudeText.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please enter something you're grateful for.",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if already added entry today
    if (lastEntryDate === todayStr) {
      toast({
        title: "Entry Already Added",
        description: "You've already added a gratitude entry today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }
    
    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      text: gratitudeText,
      date: today
    };
    
    // Update entries
    const updatedEntries = [newEntry, ...gratitudeEntries];
    setGratitudeEntries(updatedEntries);
    localStorage.setItem('gratitudeEntries', JSON.stringify(updatedEntries));
    
    // Update garden level
    const newLevel = Math.min(5, Math.max(1, Math.floor(updatedEntries.length / 5) + 1));
    setGardenLevel(newLevel);
    
    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = streak;
    if (lastEntryDate === yesterdayStr || lastEntryDate === null) {
      // Continuing streak or first entry
      newStreak = streak + 1;
    } else if (lastEntryDate !== todayStr) {
      // Broken streak, starting new
      newStreak = 1;
    }
    
    setStreak(newStreak);
    setLastEntryDate(todayStr);
    localStorage.setItem('gratitudeStreak', newStreak.toString());
    localStorage.setItem('gratitudeLastEntry', todayStr);
    
    // Clear input
    setGratitudeText('');
    
    // Show success message
    toast({
      title: "Gratitude Added",
      description: "Your garden is growing with positivity!",
    });
    
    // Show level up message if applicable
    if (newLevel > gardenLevel) {
      toast({
        title: "Garden Level Up!",
        description: `Your garden has reached level ${newLevel}. Keep nurturing it!`,
      });
    }
  };

  // Delete entry
  const deleteEntry = (id: string) => {
    const updatedEntries = gratitudeEntries.filter(entry => entry.id !== id);
    setGratitudeEntries(updatedEntries);
    localStorage.setItem('gratitudeEntries', JSON.stringify(updatedEntries));
    
    // Update garden level
    setGardenLevel(Math.min(5, Math.max(1, Math.floor(updatedEntries.length / 5) + 1)));
    
    toast({
      title: "Entry Removed",
      description: "Your gratitude entry has been removed.",
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get garden elements based on level
  const getGardenElements = () => {
    const elements = [];
    
    // Add flowers based on level
    for (let i = 0; i < Math.min(gardenLevel * 2, 10); i++) {
      elements.push(
        <div 
          key={`flower-${i}`}
          className="absolute transform transition-all duration-500"
          style={{
            left: `${10 + (i * 8)}%`,
            bottom: `${10 + Math.sin(i) * 5}%`,
            transform: `scale(${0.8 + (i % 3) * 0.2}) rotate(${(i % 2) * 5}deg)`
          }}
        >
          <Flower className={`h-8 w-8 ${
            i % 3 === 0 ? 'text-pink-500' : 
            i % 3 === 1 ? 'text-purple-500' : 
            'text-yellow-500'
          }`} />
        </div>
      );
    }
    
    // Add leaves based on level
    for (let i = 0; i < Math.min(gardenLevel * 3, 15); i++) {
      elements.push(
        <div 
          key={`leaf-${i}`}
          className="absolute transform transition-all duration-500"
          style={{
            left: `${5 + (i * 6)}%`,
            bottom: `${5 + Math.cos(i) * 3}%`,
            transform: `scale(${0.7 + (i % 3) * 0.1}) rotate(${(i % 4) * 90}deg)`
          }}
        >
          <Leaf className="h-6 w-6 text-green-500" />
        </div>
      );
    }
    
    // Add sun if level is high enough
    if (gardenLevel >= 3) {
      elements.push(
        <div 
          key="sun"
          className="absolute top-4 right-4 transform transition-all duration-500 animate-pulse"
        >
          <Sun className="h-10 w-10 text-yellow-500" />
        </div>
      );
    }
    
    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Garden Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Gratitude Garden</h2>
          <p className="text-muted-foreground">Grow your garden by practicing daily gratitude</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {streak} Day Streak
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            Level {gardenLevel}
          </Badge>
        </div>
      </div>
      
      {/* Garden Visualization */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-b from-blue-100 to-green-100 relative">
          {getGardenElements()}
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-200 to-amber-100"></div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="gratitude" className="block text-sm font-medium mb-1">
                What are you grateful for today?
              </label>
              <div className="flex gap-2">
                <Textarea
                  id="gratitude"
                  placeholder="I'm grateful for..."
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  className="flex-1 min-h-[80px]"
                />
                <Button 
                  onClick={addGratitudeEntry}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white self-end"
                >
                  Add
                </Button>
              </div>
              
              {lastEntryDate === new Date().toISOString().split('T')[0] && (
                <p className="text-xs text-muted-foreground mt-1">
                  You've already added an entry today. You can add another one tomorrow!
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Recent Entries</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {gratitudeEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No entries yet. Start growing your garden by adding what you're grateful for!
                  </p>
                ) : (
                  gratitudeEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 relative group"
                    >
                      <p className="text-sm text-green-800">{entry.text}</p>
                      <p className="text-xs text-green-600 mt-1">{formatDate(entry.date)}</p>
                      
                      <button 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Garden Info */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">Benefits of Gratitude Practice:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Increases positive emotions and life satisfaction</li>
            <li>Reduces stress and improves mental resilience</li>
            <li>Enhances empathy and reduces aggression</li>
            <li>Improves sleep quality and physical health</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Mind Games Component
const MindGame = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeGame, setActiveGame] = useState('memory');
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mind Games</CardTitle>
            <CardDescription>Please sign in to access mind games</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Mind Wellness Games
              </h1>
              <p className="text-muted-foreground">
                Engage your mind with games designed for mental wellness
              </p>
            </div>
          </div>
        </div>
        
        {/* Game Selection Tabs */}
        <Tabs value={activeGame} onValueChange={setActiveGame} className="space-y-6">
          <TabsList className="grid grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger 
              value="memory" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              <Brain className="h-4 w-4" />
              Memory Mosaic
            </TabsTrigger>
            <TabsTrigger 
              value="focus" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Target className="h-4 w-4" />
              Focus Flow
            </TabsTrigger>
            <TabsTrigger 
              value="gratitude" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Heart className="h-4 w-4" />
              Gratitude Garden
            </TabsTrigger>
          </TabsList>
          
          {/* Game Content */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardContent className="p-6">
              <TabsContent value="memory" className="mt-0">
                <MemoryGame />
              </TabsContent>
              
              <TabsContent value="focus" className="mt-0">
                <FocusFlowGame />
              </TabsContent>
              
              <TabsContent value="gratitude" className="mt-0">
                <GratitudeGarden />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        
        {/* Benefits Section */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Benefits of Mind Wellness Games
            </CardTitle>
            <CardDescription>
              How these games contribute to your mental wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-lg">Cognitive Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Regular mental exercise helps maintain cognitive function, improves memory, and enhances problem-solving abilities. These games are designed to stimulate different areas of your brain.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-lg">Emotional Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Mindfulness and gratitude practices have been shown to reduce stress, anxiety, and depression while increasing overall life satisfaction and emotional resilience.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-lg">Habit Formation</h3>
                <p className="text-sm text-muted-foreground">
                  Building a routine of mental wellness activities creates positive habits that contribute to long-term mental health. Just a few minutes each day can make a significant difference.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MindGame;