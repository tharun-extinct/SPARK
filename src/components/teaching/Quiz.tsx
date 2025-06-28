import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Check, 
  X, 
  Star, 
  Brain, 
  ArrowRight,
  Trophy,
  Target,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
}

interface QuizProps {
  questions: QuizQuestion[];
  timeLimit?: number; // total time limit in seconds
  onComplete?: (results: QuizResults) => void;
  onSendToChat?: (message: string) => void;
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean; timeSpent: number }[];
}

const Quiz: React.FC<QuizProps> = ({ questions, timeLimit, onComplete, onSendToChat }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<QuizResults['answers']>([]);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [isComplete, setIsComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isComplete, timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const questionTime = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent: Math.round(questionTime / 1000)
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const totalTimeSpent = Math.round((Date.now() - startTime) / 1000);
    const score = answers.filter(a => a.isCorrect).length;
    
    const results: QuizResults = {
      score,
      totalQuestions: questions.length,
      timeSpent: totalTimeSpent,
      answers
    };

    setQuizResults(results);
    setIsComplete(true);

    if (onComplete) {
      onComplete(results);
    }

    // Send results to chat
    if (onSendToChat) {
      const percentage = Math.round((score / questions.length) * 100);
      onSendToChat(
        `🧠 Quiz Complete!\n\n` +
        `📊 Score: ${score}/${questions.length} (${percentage}%)\n` +
        `⏱️ Time: ${formatTime(totalTimeSpent)}\n` +
        `🎯 Performance: ${percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good!' : 'Keep studying!'}\n\n` +
        `${percentage >= 80 ? '🌟 Outstanding work!' : 
          percentage >= 60 ? '👍 Well done! Review the topics you missed.' : 
          '💪 Don\'t give up! Practice makes perfect.'}`
      );
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuestionStartTime(Date.now());
    setTimeRemaining(timeLimit || 0);
    setIsComplete(false);
    setQuizResults(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isComplete && quizResults) {
    const percentage = Math.round((quizResults.score / quizResults.totalQuestions) * 100);
    
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-blue-800">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{quizResults.score}</div>
              <div className="text-sm text-blue-500">Correct</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-green-500">Score</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-purple-600">{formatTime(quizResults.timeSpent)}</div>
              <div className="text-sm text-purple-500">Time</div>
            </div>
          </div>

          <div className="text-center">
            <Badge className={`text-lg px-4 py-2 ${
              percentage >= 80 ? 'bg-green-500' : 
              percentage >= 60 ? 'bg-blue-500' : 'bg-orange-500'
            }`}>
              {percentage >= 80 ? '🌟 Excellent!' : 
               percentage >= 60 ? '👍 Good Job!' : '💪 Keep Studying!'}
            </Badge>
          </div>

          {/* Question Review */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Question Review</h3>
            {quizResults.answers.map((answer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm">Question {index + 1}</span>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">{answer.timeSpent}s</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleRestart} className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Quiz Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No quiz questions available. Ask the AI to create a quiz for you!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </Badge>
        </div>
        {timeLimit && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`text-sm font-medium ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.category && (
            <Badge variant="outline" className="w-fit">
              {currentQuestion.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const isIncorrect = showExplanation && isSelected && !isCorrect;
              const shouldHighlight = showExplanation && isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    shouldHighlight
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : isIncorrect
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      shouldHighlight
                        ? 'border-green-500 bg-green-500 text-white'
                        : isIncorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showExplanation && shouldHighlight && <Check className="w-5 h-5 text-green-600" />}
                    {showExplanation && isIncorrect && <X className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Explanation</h4>
                  <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="text-sm text-gray-500">
              {answers.filter(a => a.isCorrect).length} correct so far
            </div>
            
            {!showExplanation ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Finish Quiz'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;