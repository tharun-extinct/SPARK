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
  Timer,
  Star,
  Award,
  CheckCircle,
  Lightbulb,
  Gamepad2,
  Sparkles,
  Heart,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MindGame = () => {
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState('memory');
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

  // Memory Game Component
  const MemoryGame = () => {
    const [cards, setCards] = useState<Array<{id: number, value: string, isFlipped: boolean, isMatched: boolean}>>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [time, setTime] = useState(0);
    const [difficulty, setDifficulty] = useState('medium');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const difficulties = {
      easy: { pairs: 6, gridCols: 3 },
      medium: { pairs: 8, gridCols: 4 },
      hard: { pairs: 12, gridCols: 4 }
    };

    const emojis = ['🌟', '🎯', '🚀', '💎', '🔥', '⚡', '🌈', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧'];

    const initializeGame = () => {
      const { pairs } = difficulties[difficulty as keyof typeof difficulties];
      const gameEmojis = emojis.slice(0, pairs);
      const cardPairs = [...gameEmojis, ...gameEmojis];
      
      // Shuffle cards
      const shuffledCards = cardPairs
        .map((value, index) => ({ id: index, value, isFlipped: false, isMatched: false }))
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setFlippedCards([]);
      setMoves(0);
      setMatches(0);
      setTime(0);
      setGameStarted(false);
      setGameCompleted(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    const startGame = () => {
      setGameStarted(true);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    };

    const handleCardClick = (cardId: number) => {
      if (!gameStarted) {
        startGame();
      }

      if (flippedCards.length === 2) return;
      if (flippedCards.includes(cardId)) return;
      if (cards[cardId].isMatched) return;

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      // Update card state to show it's flipped
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      ));

      if (newFlippedCards.length === 2) {
        setMoves(prev => prev + 1);
        
        const [firstCard, secondCard] = newFlippedCards;
        if (cards[firstCard].value === cards[secondCard].value) {
          // Match found
          setTimeout(() => {
            setCards(prev => prev.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            ));
            setMatches(prev => prev + 1);
            setFlippedCards([]);
            
            // Check if game is completed
            if (matches + 1 === difficulties[difficulty as keyof typeof difficulties].pairs) {
              setGameCompleted(true);
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              toast({
                title: "Congratulations! 🎉",
                description: `You completed the game in ${moves + 1} moves and ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}!`,
              });
            }
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setCards(prev => prev.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isFlipped: false }
                : card
            ));
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
      initializeGame();
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [difficulty]);

    const { gridCols } = difficulties[difficulty as keyof typeof difficulties];

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Memory Mosaic</h3>
            <p className="text-muted-foreground">Match pairs of cards to test your memory</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={initializeGame} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-sm text-blue-500">Moves</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {matches}/{difficulties[difficulty as keyof typeof difficulties].pairs}
              </div>
              <div className="text-sm text-green-500">Pairs</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(time)}</div>
              <div className="text-sm text-purple-500">Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div 
          className={`grid gap-3 mx-auto max-w-2xl`}
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            aspectRatio: gridCols === 3 ? '3/4' : '1/1'
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                relative aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105
                ${card.isMatched ? 'opacity-75' : ''}
                ${flippedCards.includes(card.id) ? 'pointer-events-none' : ''}
              `}
            >
              <div className={`
                w-full h-full rounded-xl border-2 transition-all duration-500 transform-style-preserve-3d
                ${card.isFlipped || card.isMatched 
                  ? 'rotate-y-180 bg-gradient-to-br from-green-400 to-blue-500 border-green-300' 
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-300 hover:from-slate-300 hover:to-slate-400'
                }
                ${card.isMatched ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
              `}>
                {/* Card Back */}
                <div className={`
                  absolute inset-0 w-full h-full rounded-xl flex items-center justify-center backface-hidden
                  ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}
                `}>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* Card Front */}
                <div className={`
                  absolute inset-0 w-full h-full rounded-xl flex items-center justify-center backface-hidden rotate-y-180
                  ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}
                `}>
                  <span className="text-3xl sm:text-4xl">{card.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Completion */}
        {gameCompleted && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
              <p className="text-green-700 mb-4">
                You completed the {difficulty} level in {moves} moves and {formatTime(time)}!
              </p>
              <Button onClick={initializeGame} className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Focus Training Game Component
  const FocusGame = () => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isUserTurn, setIsUserTurn] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [activeButton, setActiveButton] = useState<number | null>(null);

    const colors = [
      { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', sound: 'C' },
      { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', sound: 'D' },
      { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', sound: 'E' },
      { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', sound: 'F' },
    ];

    const startGame = () => {
      setSequence([]);
      setUserSequence([]);
      setScore(0);
      setGameOver(false);
      setIsPlaying(true);
      addToSequence();
    };

    const addToSequence = () => {
      const newNumber = Math.floor(Math.random() * 4);
      const newSequence = [...sequence, newNumber];
      setSequence(newSequence);
      playSequence(newSequence);
    };

    const playSequence = async (seq: number[]) => {
      setIsUserTurn(false);
      for (let i = 0; i < seq.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setActiveButton(seq[i]);
        await new Promise(resolve => setTimeout(resolve, 400));
        setActiveButton(null);
      }
      setIsUserTurn(true);
    };

    const handleButtonClick = (buttonId: number) => {
      if (!isUserTurn || gameOver) return;

      const newUserSequence = [...userSequence, buttonId];
      setUserSequence(newUserSequence);

      // Check if the user's input is correct
      if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
        setGameOver(true);
        setIsPlaying(false);
        toast({
          title: "Game Over!",
          description: `Your final score: ${score}`,
          variant: "destructive",
        });
        return;
      }

      // Check if the user completed the sequence
      if (newUserSequence.length === sequence.length) {
        setScore(score + 1);
        setUserSequence([]);
        setTimeout(() => {
          addToSequence();
        }, 1000);
        toast({
          title: "Great job!",
          description: `Level ${score + 1} completed!`,
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Focus Training</h3>
          <p className="text-muted-foreground mb-4">Remember and repeat the sequence</p>
          
          <div className="flex justify-center items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-500">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sequence.length}</div>
              <div className="text-sm text-green-500">Sequence</div>
            </div>
          </div>

          {!isPlaying && !gameOver && (
            <Button onClick={startGame} className="mb-6">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          )}

          {gameOver && (
            <div className="mb-6">
              <p className="text-red-600 mb-4">Game Over! Final Score: {score}</p>
              <Button onClick={startGame}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {isPlaying && (
            <div className="mb-6">
              <p className="text-lg font-medium">
                {isUserTurn ? "Your turn!" : "Watch the sequence..."}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleButtonClick(color.id)}
              disabled={!isUserTurn}
              className={`
                aspect-square rounded-xl transition-all duration-200 transform hover:scale-105
                ${activeButton === color.id ? color.activeColor : color.color}
                ${isUserTurn ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}
                disabled:hover:scale-100
              `}
            />
          ))}
        </div>
      </div>
    );
  };

  // Breathing Exercise Component
  const BreathingExercise = () => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timeLeft, setTimeLeft] = useState(4);
    const [cycles, setCycles] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    const phases = {
      inhale: { duration: 4, next: 'hold' as const, text: 'Breathe In' },
      hold: { duration: 4, next: 'exhale' as const, text: 'Hold' },
      exhale: { duration: 6, next: 'inhale' as const, text: 'Breathe Out' },
    };

    useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (isActive) {
        interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              const currentPhase = phases[phase];
              const nextPhase = currentPhase.next;
              setPhase(nextPhase);
              
              if (nextPhase === 'inhale') {
                setCycles(c => c + 1);
              }
              
              return phases[nextPhase].duration;
            }
            return prev - 1;
          });
          
          setTotalTime(t => t + 1);
        }, 1000);
      }

      return () => clearInterval(interval);
    }, [isActive, phase]);

    const startExercise = () => {
      setIsActive(true);
      setPhase('inhale');
      setTimeLeft(4);
      setCycles(0);
      setTotalTime(0);
    };

    const stopExercise = () => {
      setIsActive(false);
      toast({
        title: "Great job!",
        description: `You completed ${cycles} breathing cycles in ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`,
      });
    };

    const getCircleScale = () => {
      const progress = (phases[phase].duration - timeLeft) / phases[phase].duration;
      switch (phase) {
        case 'inhale':
          return 0.5 + (progress * 0.5); // Scale from 0.5 to 1
        case 'hold':
          return 1; // Stay at full size
        case 'exhale':
          return 1 - (progress * 0.5); // Scale from 1 to 0.5
        default:
          return 0.5;
      }
    };

    return (
      <div className="space-y-6 text-center">
        <div>
          <h3 className="text-2xl font-bold mb-2">Breathing Exercise</h3>
          <p className="text-muted-foreground">4-4-6 breathing pattern for relaxation</p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{cycles}</div>
              <div className="text-sm text-blue-500">Cycles</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{timeLeft}</div>
              <div className="text-sm text-green-500">Seconds</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-purple-500">Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-64 h-64 mx-auto">
          <div 
            className={`
              absolute inset-0 rounded-full transition-all duration-1000 ease-in-out
              ${phase === 'inhale' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                phase === 'hold' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                'bg-gradient-to-br from-purple-400 to-indigo-500'}
            `}
            style={{
              transform: `scale(${getCircleScale()})`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-2xl font-bold mb-2">{phases[phase].text}</div>
            <div className="text-4xl font-bold">{timeLeft}</div>
          </div>
        </div>

        <div className="space-y-4">
          {!isActive ? (
            <Button onClick={startExercise} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start Breathing
            </Button>
          ) : (
            <Button onClick={stopExercise} variant="outline" size="lg">
              <Pause className="w-5 h-5 mr-2" />
              Stop Exercise
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds</p>
          </div>
        </div>
      </div>
    );
  };

  // Word Association Game Component
  const WordAssociationGame = () => {
    const [currentWord, setCurrentWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [wordChain, setWordChain] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const startWords = [
      'Ocean', 'Mountain', 'Forest', 'River', 'Sunset', 'Garden', 'Music', 'Dance',
      'Book', 'Journey', 'Dream', 'Star', 'Rainbow', 'Butterfly', 'Flower', 'Peace'
    ];

    const startGame = () => {
      const randomWord = startWords[Math.floor(Math.random() * startWords.length)];
      setCurrentWord(randomWord);
      setWordChain([randomWord]);
      setScore(0);
      setTimeLeft(60);
      setIsPlaying(true);
      setGameOver(false);
      setUserInput('');
    };

    const submitWord = () => {
      if (!userInput.trim() || !isPlaying) return;

      const newChain = [...wordChain, userInput.trim()];
      setWordChain(newChain);
      setCurrentWord(userInput.trim());
      setScore(score + 1);
      setUserInput('');

      toast({
        title: "Great association!",
        description: `${currentWord} → ${userInput.trim()}`,
      });
    };

    useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (isPlaying && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setIsPlaying(false);
              setGameOver(true);
              toast({
                title: "Time's up!",
                description: `You created ${score} word associations!`,
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => clearInterval(interval);
    }, [isPlaying, timeLeft, score]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Word Association</h3>
          <p className="text-muted-foreground">Create word associations as quickly as possible</p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-500">Words</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{timeLeft}</div>
              <div className="text-sm text-green-500">Seconds</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{wordChain.length}</div>
              <div className="text-sm text-purple-500">Chain</div>
            </CardContent>
          </Card>
        </div>

        {!isPlaying && !gameOver && (
          <div className="text-center">
            <Button onClick={startGame} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameOver && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Game Complete!</h3>
              <p className="text-green-700 mb-4">You created {score} word associations!</p>
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        {isPlaying && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-indigo-600 mb-2">Current word:</p>
                <p className="text-3xl font-bold text-indigo-800">{currentWord}</p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitWord()}
                placeholder="Enter associated word..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!isPlaying}
              />
              <Button onClick={submitWord} disabled={!userInput.trim() || !isPlaying}>
                Submit
              </Button>
            </div>

            {wordChain.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Word chain:</p>
                  <div className="flex flex-wrap gap-2">
                    {wordChain.map((word, index) => (
                      <Badge key={index} variant="outline">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Mosaic',
      description: 'Test your memory with card matching',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      component: MemoryGame
    },
    {
      id: 'focus',
      title: 'Focus Training',
      description: 'Improve concentration with sequence games',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      component: FocusGame
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: 'Relax with guided breathing patterns',
      icon: Heart,
      color: 'from-purple-500 to-indigo-500',
      component: BreathingExercise
    },
    {
      id: 'words',
      title: 'Word Association',
      description: 'Enhance creativity with word games',
      icon: Lightbulb,
      color: 'from-orange-500 to-red-500',
      component: WordAssociationGame
    }
  ];

  const ActiveGameComponent = games.find(game => game.id === activeGame)?.component || MemoryGame;

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
                    <Gamepad2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Mind Games
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Enhance your cognitive abilities with fun brain training exercises
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Game Selection */}
          <div 
            id="game-selection"
            data-animate
            className={`transition-all duration-1000 delay-200 ${
              isVisible('game-selection') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {games.map((game, index) => {
                const IconComponent = game.icon;
                return (
                  <Card 
                    key={game.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                      activeGame === game.id 
                        ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-primary/5 to-purple-600/5' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setActiveGame(game.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{game.title}</h3>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Active Game */}
          <div 
            id="active-game"
            data-animate
            className={`transition-all duration-1000 delay-400 ${
              isVisible('active-game') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardContent className="p-8">
                <ActiveGameComponent />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindGame;