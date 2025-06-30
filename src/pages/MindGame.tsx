import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/services/firebaseAuth";
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Zap, 
  Heart, 
  Trophy, 
  Target, 
  Clock, 
  Lightbulb,
  RefreshCw,
  Check,
  X,
  HelpCircle,
  Info
} from 'lucide-react';

// Memory Card Game
const MemoryGame = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Array<{id: number, value: string, flipped: boolean, matched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Emoji sets for different difficulty levels
  const emojiSets = {
    easy: ['🌟', '🌈', '🌺', '🌻', '🦋', '🐬', '🍎', '🍓'],
    medium: ['🌟', '🌈', '🌺', '🌻', '🦋', '🐬', '🍎', '🍓', '🍕', '🎸', '🚀', '🎮'],
    hard: ['🌟', '🌈', '🌺', '🌻', '🦋', '🐬', '🍎', '🍓', '🍕', '🎸', '🚀', '🎮', '🏀', '🎨', '🎭', '🎯', '🎪', '🎡']
  };

  // Initialize game
  const initializeGame = () => {
    const pairCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 18;
    const emojis = emojiSets[difficulty].slice(0, pairCount);
    
    // Create pairs of cards
    let cardPairs = [...emojis, ...emojis];
    
    // Shuffle cards
    cardPairs = cardPairs.sort(() => Math.random() - 0.5);
    
    // Create card objects
    const newCards = cardPairs.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false
    }));
    
    setCards(newCards);
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
    // Ignore if game is completed or card is already flipped/matched
    if (gameCompleted || cards[id].flipped || cards[id].matched) {
      return;
    }
    
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true);
      startTimer();
    }
    
    // Don't allow more than 2 cards to be flipped at once
    if (flippedCards.length === 2) {
      return;
    }
    
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
      if (cards[firstId].value === cards[secondId].value) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].matched = true;
          matchedCards[secondId].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prev => prev + 1);
          
          // Check if all pairs are matched
          if (matchedPairs + 1 === cards.length / 2) {
            setGameCompleted(true);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            toast({
              title: "Congratulations!",
              description: `You completed the game in ${moves + 1} moves and ${timer} seconds!`,
            });
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
  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    // Reset game with new difficulty
    setTimeout(() => {
      initializeGame();
    }, 0);
  };

  // Initialize game on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  return (
    <div className="space-y-4">
      {/* Game Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Zap className="w-3.5 h-3.5" />
            {moves} Moves
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Target className="w-3.5 h-3.5" />
            {matchedPairs}/{cards.length / 2} Pairs
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => initializeGame()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
          
          <Select value={difficulty} onValueChange={(value) => changeDifficulty(value as 'easy' | 'medium' | 'hard')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (8 pairs)</SelectItem>
              <SelectItem value="medium">Medium (12 pairs)</SelectItem>
              <SelectItem value="hard">Hard (18 pairs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Game Board */}
      <div className={`grid gap-3 mx-auto ${
        difficulty === 'easy' ? 'grid-cols-4' : 
        difficulty === 'medium' ? 'grid-cols-4 sm:grid-cols-6' : 
        'grid-cols-4 sm:grid-cols-6'
      }`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`aspect-square flex items-center justify-center rounded-lg text-3xl sm:text-4xl cursor-pointer transition-all duration-300 transform ${
              card.flipped || card.matched 
                ? 'bg-white shadow-md rotate-0' 
                : 'bg-gradient-to-br from-primary/90 to-purple-600/90 text-transparent rotate-y-180'
            } ${
              card.matched ? 'bg-green-50 border-2 border-green-200' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.flipped || card.matched) ? card.value : ''}
          </div>
        ))}
      </div>
      
      {/* Game Status */}
      {gameCompleted && (
        <Card className="bg-green-50 border-green-200 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Game Completed!</h3>
                <p className="text-sm text-green-700">
                  You matched all pairs in {moves} moves and {timer} seconds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Focus Flow Game
const FocusFlowGame = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [target, setTarget] = useState<string>('');
  const [distractions, setDistractions] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Emoji sets
  const emojiSets = {
    fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🍍', '🥝'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'],
    objects: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱']
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setShowInstructions(false);
    
    // Set initial target
    const randomSet = Object.values(emojiSets)[Math.floor(Math.random() * Object.values(emojiSets).length)];
    const randomTarget = randomSet[Math.floor(Math.random() * randomSet.length)];
    setTarget(randomTarget);
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Game over
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Generate initial distractions
    generateDistractions();
  };

  // Generate distractions
  const generateDistractions = () => {
    const allEmojis = Object.values(emojiSets).flat();
    const distractionCount = Math.min(5 + level * 2, 20); // Increase distractions with level
    
    const newDistractions = [];
    for (let i = 0; i < distractionCount; i++) {
      let distraction;
      do {
        distraction = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      } while (distraction === target);
      
      newDistractions.push(distraction);
    }
    
    // Add the target a random number of times (1-3)
    const targetCount = Math.min(1 + Math.floor(Math.random() * 3), 5);
    for (let i = 0; i < targetCount; i++) {
      const insertPosition = Math.floor(Math.random() * (newDistractions.length + 1));
      newDistractions.splice(insertPosition, 0, target);
    }
    
    setDistractions(newDistractions);
  };

  // Handle clicking on a distraction
  const handleDistractionClick = (emoji: string) => {
    if (!gameStarted || gameOver) return;
    
    if (emoji === target) {
      // Correct click
      setScore(prev => prev + 10 * level);
      
      // Increase level every 5 correct clicks
      if (score > 0 && score % (50 * level) === 0) {
        setLevel(prev => prev + 1);
        toast({
          title: "Level Up!",
          description: `You've reached level ${level + 1}!`,
        });
      }
      
      // Add some time as reward
      setTimeLeft(prev => Math.min(prev + 2, 60));
      
      // Generate new distractions
      generateDistractions();
      
      // Change target occasionally
      if (Math.random() < 0.3) {
        const randomSet = Object.values(emojiSets)[Math.floor(Math.random() * Object.values(emojiSets).length)];
        const randomTarget = randomSet[Math.floor(Math.random() * randomSet.length)];
        setTarget(randomTarget);
      }
    } else {
      // Incorrect click
      setScore(prev => Math.max(0, prev - 5));
      setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
      
      // Shake the game area
      if (gameAreaRef.current) {
        gameAreaRef.current.classList.add('animate-shake');
        setTimeout(() => {
          if (gameAreaRef.current) {
            gameAreaRef.current.classList.remove('animate-shake');
          }
        }, 500);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      {showInstructions && (
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">How to Play</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Focus Flow tests your concentration and attention skills. Click on the target emoji while ignoring distractions.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                  <li>Your target emoji is shown at the top</li>
                  <li>Click ONLY on that emoji when it appears</li>
                  <li>Avoid clicking on other emojis</li>
                  <li>Each correct click earns points and adds time</li>
                  <li>Each wrong click loses points and time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Game Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}s
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Trophy className="w-3.5 h-3.5" />
            {score} Points
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Zap className="w-3.5 h-3.5" />
            Level {level}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {!gameStarted || gameOver ? (
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                setGameOver(true);
              }}
            >
              End Game
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowInstructions(prev => !prev)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Target Display */}
      {gameStarted && !gameOver && (
        <div className="text-center mb-4">
          <div className="inline-block bg-white p-3 rounded-lg shadow-md">
            <div className="text-sm font-medium text-gray-500 mb-1">Find this emoji:</div>
            <div className="text-5xl">{target}</div>
          </div>
        </div>
      )}
      
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className={`relative bg-white rounded-lg p-4 min-h-[300px] ${gameStarted && !gameOver ? 'border-2 border-primary' : 'border'}`}
      >
        {!gameStarted && !gameOver ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Brain className="w-16 h-16 text-primary/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Focus Flow</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Test and improve your concentration by finding target emojis while ignoring distractions.
            </p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
            >
              Start Game
            </Button>
          </div>
        ) : gameOver ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Game Over!</h3>
            <p className="text-lg font-medium mb-1">Your Score: {score}</p>
            <p className="text-muted-foreground mb-6">You reached level {level}</p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
            >
              Play Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {distractions.map((emoji, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-3xl sm:text-4xl bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-transform hover:scale-105 ${
                  emoji === target ? 'hover:bg-green-50' : 'hover:bg-red-50'
                }`}
                onClick={() => handleDistractionClick(emoji)}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {gameStarted && !gameOver && (
        <Progress value={(timeLeft / 60) * 100} className="h-2" />
      )}
    </div>
  );
};

// Gratitude Garden Game
const GratitudeGarden = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeList, setGratitudeList] = useState<Array<{id: string, text: string, date: Date, category: string}>>([]);
  const [gardenLevel, setGardenLevel] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // Categories for gratitude entries
  const categories = [
    { id: 'general', name: 'General', emoji: '🌱' },
    { id: 'relationships', name: 'Relationships', emoji: '❤️' },
    { id: 'health', name: 'Health & Wellness', emoji: '🧘' },
    { id: 'achievements', name: 'Achievements', emoji: '🏆' },
    { id: 'nature', name: 'Nature', emoji: '🌳' },
    { id: 'experiences', name: 'Experiences', emoji: '✨' }
  ];
  
  // Plant emojis for garden visualization
  const plantEmojis = ['🌱', '🌿', '🌵', '🌴', '🌲', '🌳', '🌺', '🌻', '🌹', '🌷', '🌸', '🍀'];
  
  // Load saved gratitude entries
  useEffect(() => {
    // In a real implementation, this would load from Firestore
    // For now, we'll use mock data
    const mockEntries = [
      { id: '1', text: 'I am grateful for my health', date: new Date(Date.now() - 86400000 * 2), category: 'health' },
      { id: '2', text: 'I am grateful for my family', date: new Date(Date.now() - 86400000), category: 'relationships' },
      { id: '3', text: 'I am grateful for this beautiful day', date: new Date(), category: 'nature' }
    ];
    
    setGratitudeList(mockEntries);
    
    // Set garden level based on number of entries
    const level = Math.min(Math.floor(mockEntries.length / 3) + 1, 5);
    setGardenLevel(level);
  }, []);
  
  // Add new gratitude entry
  const addGratitude = () => {
    if (!gratitudeText.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please enter something you're grateful for.",
        variant: "destructive"
      });
      return;
    }
    
    const newEntry = {
      id: Date.now().toString(),
      text: gratitudeText,
      date: new Date(),
      category: selectedCategory
    };
    
    const updatedList = [newEntry, ...gratitudeList];
    setGratitudeList(updatedList);
    setGratitudeText('');
    setShowForm(false);
    
    // Update garden level
    const newLevel = Math.min(Math.floor(updatedList.length / 3) + 1, 5);
    
    if (newLevel > gardenLevel) {
      setGardenLevel(newLevel);
      toast({
        title: "Garden Level Up!",
        description: `Your gratitude garden has grown to level ${newLevel}!`,
      });
    } else {
      toast({
        title: "Gratitude Added",
        description: "Your garden is growing with positivity!",
      });
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get random position for garden elements
  const getRandomPosition = (index: number) => {
    // Create a deterministic but seemingly random position based on the index
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    // Add some randomness within the grid cell
    const xOffset = Math.sin(index * 7919) * 10; // Using prime numbers for pseudo-randomness
    const yOffset = Math.cos(index * 7907) * 10;
    
    return {
      left: `${col * 25 + 5 + xOffset}%`,
      top: `${row * 33 + 10 + yOffset}%`
    };
  };

  return (
    <div className="space-y-6">
      {/* Garden Visualization */}
      <Card className="bg-gradient-to-b from-blue-50 to-green-50 border-green-200 overflow-hidden">
        <CardContent className="p-6">
          <div className="relative h-[300px] rounded-lg bg-gradient-to-b from-sky-100 to-green-100 border border-green-200 overflow-hidden">
            {/* Sun */}
            <div className="absolute top-4 right-4 text-4xl animate-pulse">☀️</div>
            
            {/* Clouds */}
            <div className="absolute top-6 left-[10%] text-3xl animate-bounce" style={{animationDuration: '8s'}}>☁️</div>
            <div className="absolute top-10 left-[60%] text-2xl animate-bounce" style={{animationDuration: '10s'}}>☁️</div>
            
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-200 to-green-100"></div>
            
            {/* Plants based on gratitude entries */}
            {gratitudeList.map((entry, index) => {
              // Only show the most recent entries based on garden level
              if (index >= gardenLevel * 5) return null;
              
              const position = getRandomPosition(index);
              const categoryInfo = categories.find(c => c.id === entry.category) || categories[0];
              
              // Choose plant emoji based on category and index
              const plantIndex = (index + categories.indexOf(categoryInfo)) % plantEmojis.length;
              const plantEmoji = index === 0 ? categoryInfo.emoji : plantEmojis[plantIndex];
              
              return (
                <div 
                  key={entry.id}
                  className="absolute text-3xl sm:text-4xl transform hover:scale-125 transition-transform cursor-help"
                  style={{
                    left: position.left,
                    top: position.top,
                    zIndex: 10 - Math.min(index, 9) // Higher z-index for more recent entries
                  }}
                  title={entry.text}
                >
                  {plantEmoji}
                </div>
              );
            })}
            
            {/* Garden level indicator */}
            <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Garden Level {gardenLevel}
            </div>
            
            {/* Empty state */}
            {gratitudeList.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <Sparkles className="w-12 h-12 text-green-300 mb-2" />
                <h3 className="text-lg font-medium text-green-800">Your Garden Awaits</h3>
                <p className="text-sm text-green-600 max-w-md">
                  Add things you're grateful for to watch your garden grow and flourish.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Gratitude Button */}
      {!showForm ? (
        <Button 
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <Heart className="w-4 h-4 mr-2" />
          Add Something You're Grateful For
        </Button>
      ) : (
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              What are you grateful for today?
            </CardTitle>
            <CardDescription>
              Expressing gratitude has been shown to improve mental wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="I am grateful for..."
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]"
            />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${
                    selectedCategory === category.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="text-xl">{category.emoji}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={addGratitude}>
              Add to Garden
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Gratitude List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Your Gratitude Journal
          </CardTitle>
          <CardDescription>
            Review the things you've been grateful for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gratitudeList.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>Your gratitude journal is empty. Add your first entry to start growing your garden!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gratitudeList.map((entry) => {
                const categoryInfo = categories.find(c => c.id === entry.category) || categories[0];
                
                return (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{categoryInfo.emoji}</div>
                      <div className="flex-1">
                        <p className="text-gray-800">{entry.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {categoryInfo.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Emotion Explorer Game
const EmotionExplorer = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<{
    id: number;
    scenario: string;
    emotion: string;
    options: string[];
    correctIndex: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
  }>({ show: false, correct: false, message: '' });
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Scenarios database
  const scenarios = {
    easy: [
      {
        id: 1,
        scenario: "Your friend just gave you a surprise birthday gift.",
        emotion: "Joy",
        options: ["Joy", "Anger", "Fear", "Sadness"],
        correctIndex: 0
      },
      {
        id: 2,
        scenario: "You lost your favorite possession.",
        emotion: "Sadness",
        options: ["Disgust", "Sadness", "Surprise", "Joy"],
        correctIndex: 1
      },
      {
        id: 3,
        scenario: "Someone jumps out from behind a door to scare you.",
        emotion: "Fear",
        options: ["Anger", "Joy", "Fear", "Disgust"],
        correctIndex: 2
      },
      {
        id: 4,
        scenario: "Someone cuts in front of you in a long line.",
        emotion: "Anger",
        options: ["Sadness", "Anger", "Surprise", "Fear"],
        correctIndex: 1
      },
      {
        id: 5,
        scenario: "You find out you won a contest you entered.",
        emotion: "Surprise",
        options: ["Joy", "Surprise", "Pride", "Hope"],
        correctIndex: 1
      }
    ],
    medium: [
      {
        id: 6,
        scenario: "You worked hard on a project and it turned out well.",
        emotion: "Pride",
        options: ["Joy", "Relief", "Pride", "Contentment"],
        correctIndex: 2
      },
      {
        id: 7,
        scenario: "You're about to give an important presentation to a large audience.",
        emotion: "Anxiety",
        options: ["Fear", "Anxiety", "Shame", "Anticipation"],
        correctIndex: 1
      },
      {
        id: 8,
        scenario: "You made a mistake that affected others negatively.",
        emotion: "Guilt",
        options: ["Shame", "Sadness", "Guilt", "Embarrassment"],
        correctIndex: 2
      },
      {
        id: 9,
        scenario: "You're looking forward to an upcoming vacation.",
        emotion: "Anticipation",
        options: ["Hope", "Joy", "Anticipation", "Contentment"],
        correctIndex: 2
      },
      {
        id: 10,
        scenario: "You narrowly avoided a car accident.",
        emotion: "Relief",
        options: ["Surprise", "Fear", "Gratitude", "Relief"],
        correctIndex: 3
      }
    ],
    hard: [
      {
        id: 11,
        scenario: "You see someone being praised for work that you actually did.",
        emotion: "Resentment",
        options: ["Jealousy", "Anger", "Resentment", "Contempt"],
        correctIndex: 2
      },
      {
        id: 12,
        scenario: "You're experiencing both happiness and sadness about a major life change.",
        emotion: "Bittersweet",
        options: ["Nostalgia", "Bittersweet", "Melancholy", "Ambivalence"],
        correctIndex: 1
      },
      {
        id: 13,
        scenario: "You feel a deep sense of wonder looking at the night sky.",
        emotion: "Awe",
        options: ["Surprise", "Joy", "Awe", "Curiosity"],
        correctIndex: 2
      },
      {
        id: 14,
        scenario: "You feel a warm connection to your ancestors and cultural heritage.",
        emotion: "Nostalgia",
        options: ["Pride", "Nostalgia", "Belonging", "Reverence"],
        correctIndex: 1
      },
      {
        id: 15,
        scenario: "You feel peaceful and satisfied with your current life situation.",
        emotion: "Contentment",
        options: ["Joy", "Serenity", "Contentment", "Satisfaction"],
        correctIndex: 2
      }
    ]
  };
  
  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setRound(0);
    setFeedback({ show: false, correct: false, message: '' });
    
    // Select first scenario
    nextScenario();
  };
  
  // Get next scenario
  const nextScenario = () => {
    // Get scenarios for current difficulty
    const currentScenarios = scenarios[difficulty];
    
    // Check if we've gone through all scenarios
    if (round >= currentScenarios.length) {
      setGameOver(true);
      return;
    }
    
    // Get next scenario
    const scenario = currentScenarios[round];
    setCurrentScenario(scenario);
    setRound(prev => prev + 1);
  };
  
  // Handle answer selection
  const handleAnswer = (selectedIndex: number) => {
    if (!currentScenario) return;
    
    const isCorrect = selectedIndex === currentScenario.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30));
      setFeedback({
        show: true,
        correct: true,
        message: `Correct! ${currentScenario.scenario} would typically evoke ${currentScenario.emotion}.`
      });
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `Not quite. ${currentScenario.scenario} would typically evoke ${currentScenario.emotion}.`
      });
    }
    
    // Show feedback for a moment, then move to next scenario
    setTimeout(() => {
      setFeedback({ show: false, correct: false, message: '' });
      nextScenario();
    }, 2000);
  };
  
  // Change difficulty
  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    if (gameStarted) {
      // Restart game with new difficulty
      setGameStarted(false);
      setGameOver(false);
      setScore(0);
      setRound(0);
      setFeedback({ show: false, correct: false, message: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Trophy className="w-3.5 h-3.5" />
            {score} Points
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Target className="w-3.5 h-3.5" />
            {round}/{scenarios[difficulty].length} Rounds
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {!gameStarted || gameOver ? (
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setGameOver(true)}
            >
              End Game
            </Button>
          )}
          
          <Select value={difficulty} onValueChange={(value) => changeDifficulty(value as 'easy' | 'medium' | 'hard')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Game Area */}
      <Card className="bg-white overflow-hidden">
        <CardContent className="p-6">
          {!gameStarted && !gameOver ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Heart className="w-16 h-16 text-rose-500/20 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Emotion Explorer</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Improve your emotional intelligence by matching emotions to different scenarios.
              </p>
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                Start Game
              </Button>
            </div>
          ) : gameOver ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Game Complete!</h3>
              <p className="text-lg font-medium mb-1">Your Score: {score}</p>
              <p className="text-muted-foreground mb-6">
                {score >= (scenarios[difficulty].length * (difficulty === 'easy' ? 8 : difficulty === 'medium' ? 15 : 25)) 
                  ? "Excellent! You have great emotional intelligence!" 
                  : score >= (scenarios[difficulty].length * (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15)) 
                    ? "Good job! You're developing your emotional awareness." 
                    : "Keep practicing to improve your emotional intelligence."}
              </p>
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                Play Again
              </Button>
            </div>
          ) : currentScenario ? (
            <div className="space-y-6">
              {/* Scenario */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Scenario:</h3>
                <p className="text-gray-800">{currentScenario.scenario}</p>
              </div>
              
              {/* Question */}
              <div>
                <h3 className="text-lg font-medium mb-3">What emotion would someone likely feel?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentScenario.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`h-auto py-3 justify-start text-left ${
                        feedback.show && index === currentScenario.correctIndex
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : ''
                      }`}
                      disabled={feedback.show}
                      onClick={() => handleAnswer(index)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Feedback */}
              {feedback.show && (
                <div className={`p-4 rounded-lg ${
                  feedback.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {feedback.correct ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-amber-600 mt-0.5" />
                    )}
                    <p className={feedback.correct ? 'text-green-700' : 'text-amber-700'}>
                      {feedback.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Mind Game Page
const MindGame = () => {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState('memory');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
                Engage your mind and improve your mental wellbeing
              </p>
            </div>
          </div>
        </div>
        
        {/* Game Selection Tabs */}
        <Tabs value={activeGame} onValueChange={setActiveGame} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger 
              value="memory" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <Brain className="w-4 h-4" />
              Memory Mosaic
            </TabsTrigger>
            <TabsTrigger 
              value="focus" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <Target className="w-4 h-4" />
              Focus Flow
            </TabsTrigger>
            <TabsTrigger 
              value="gratitude" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-4 h-4" />
              Gratitude Garden
            </TabsTrigger>
          </TabsList>
          
          {/* Game Content */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeGame === 'memory' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    Memory Mosaic
                  </>
                )}
                {activeGame === 'focus' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    Focus Flow
                  </>
                )}
                {activeGame === 'gratitude' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    Gratitude Garden
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {activeGame === 'memory' && "Improve your memory by matching pairs of cards"}
                {activeGame === 'focus' && "Enhance your concentration by focusing on specific targets"}
                {activeGame === 'gratitude' && "Cultivate positivity by growing your garden of gratitude"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGame === 'memory' && <MemoryGame />}
              {activeGame === 'focus' && <FocusFlowGame />}
              {activeGame === 'gratitude' && <GratitudeGarden />}
            </CardContent>
          </Card>
          
          {/* Benefits Section */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Mental Wellness Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeGame === 'memory' && (
                  <>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h3 className="font-medium text-purple-800 mb-1 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Cognitive Enhancement
                      </h3>
                      <p className="text-sm text-purple-700">
                        Improves working memory, pattern recognition, and visual-spatial awareness.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Stress Reduction
                      </h3>
                      <p className="text-sm text-blue-700">
                        Provides a mindful activity that can help reduce stress and anxiety.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h3 className="font-medium text-green-800 mb-1 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Brain Health
                      </h3>
                      <p className="text-sm text-green-700">
                        Regular memory exercises may help maintain cognitive function as you age.
                      </p>
                    </div>
                  </>
                )}
                
                {activeGame === 'focus' && (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Improved Concentration
                      </h3>
                      <p className="text-sm text-blue-700">
                        Enhances your ability to focus on specific tasks while filtering out distractions.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h3 className="font-medium text-purple-800 mb-1 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Cognitive Flexibility
                      </h3>
                      <p className="text-sm text-purple-700">
                        Trains your brain to switch between tasks and adapt to changing requirements.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h3 className="font-medium text-green-800 mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Reaction Time
                      </h3>
                      <p className="text-sm text-green-700">
                        Improves processing speed and reaction time through regular practice.
                      </p>
                    </div>
                  </>
                )}
                
                {activeGame === 'gratitude' && (
                  <>
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                      <h3 className="font-medium text-rose-800 mb-1 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Positive Mindset
                      </h3>
                      <p className="text-sm text-rose-700">
                        Regular gratitude practice helps shift focus to positive aspects of life.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <h3 className="font-medium text-amber-800 mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Stress Reduction
                      </h3>
                      <p className="text-sm text-amber-700">
                        Gratitude has been shown to lower stress hormones and increase wellbeing.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h3 className="font-medium text-green-800 mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Improved Relationships
                      </h3>
                      <p className="text-sm text-green-700">
                        Recognizing things to be thankful for strengthens social connections.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default MindGame;