import { useState, useCallback } from 'react';

interface FlashCardData {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

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

interface TeachingSession {
  id: string;
  type: 'flashcards' | 'quiz' | 'socratic';
  topic: string;
  data: FlashCardData[] | QuizQuestion[] | SocraticSession;
  createdAt: Date;
  completed: boolean;
}

export const useTeachingSession = () => {
  const [currentSession, setCurrentSession] = useState<TeachingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<TeachingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate flash cards based on topic
  const generateFlashCards = useCallback(async (topic: string, count: number = 10): Promise<FlashCardData[]> => {
    // This would typically call an AI service to generate cards
    // For now, we'll return sample data based on common topics
    const sampleCards: { [key: string]: FlashCardData[] } = {
      'javascript': [
        {
          id: '1',
          front: 'What is a closure in JavaScript?',
          back: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.',
          category: 'JavaScript Fundamentals',
          difficulty: 'medium',
          tags: ['functions', 'scope', 'closures']
        },
        {
          id: '2',
          front: 'What is the difference between let, const, and var?',
          back: 'var is function-scoped and can be redeclared; let is block-scoped and can be reassigned; const is block-scoped and cannot be reassigned.',
          category: 'JavaScript Fundamentals',
          difficulty: 'easy',
          tags: ['variables', 'scope', 'declarations']
        },
        {
          id: '3',
          front: 'What is event bubbling?',
          back: 'Event bubbling is when an event starts from the target element and bubbles up through its parent elements in the DOM tree.',
          category: 'DOM Events',
          difficulty: 'medium',
          tags: ['events', 'DOM', 'bubbling']
        }
      ],
      'react': [
        {
          id: '1',
          front: 'What is JSX?',
          back: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
          category: 'React Basics',
          difficulty: 'easy',
          tags: ['JSX', 'syntax', 'components']
        },
        {
          id: '2',
          front: 'What is the difference between state and props?',
          back: 'State is internal component data that can change, while props are external data passed from parent components that are read-only.',
          category: 'React Concepts',
          difficulty: 'medium',
          tags: ['state', 'props', 'data-flow']
        }
      ],
      'physics': [
        {
          id: '1',
          front: 'What is Newton\'s First Law of Motion?',
          back: 'An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.',
          category: 'Classical Mechanics',
          difficulty: 'easy',
          tags: ['newton', 'motion', 'inertia']
        },
        {
          id: '2',
          front: 'What is the formula for kinetic energy?',
          back: 'KE = ½mv², where m is mass and v is velocity.',
          category: 'Energy',
          difficulty: 'medium',
          tags: ['energy', 'kinetic', 'formula']
        }
      ]
    };

    const topicKey = topic.toLowerCase();
    return sampleCards[topicKey] || sampleCards['javascript'];
  }, []);

  // Generate quiz questions based on topic
  const generateQuiz = useCallback(async (topic: string, count: number = 5): Promise<QuizQuestion[]> => {
    const sampleQuizzes: { [key: string]: QuizQuestion[] } = {
      'javascript': [
        {
          id: '1',
          question: 'Which of the following is NOT a JavaScript data type?',
          options: ['String', 'Boolean', 'Integer', 'Undefined'],
          correctAnswer: 2,
          explanation: 'JavaScript has Number type, not Integer. JavaScript numbers are always floating-point.',
          category: 'Data Types',
          difficulty: 'easy'
        },
        {
          id: '2',
          question: 'What will console.log(typeof null) output?',
          options: ['null', 'undefined', 'object', 'boolean'],
          correctAnswer: 2,
          explanation: 'This is a well-known JavaScript quirk. typeof null returns "object" due to a bug in the original JavaScript implementation.',
          category: 'Type System',
          difficulty: 'medium'
        }
      ],
      'react': [
        {
          id: '1',
          question: 'Which hook is used to manage state in functional components?',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correctAnswer: 1,
          explanation: 'useState is the primary hook for managing local state in functional components.',
          category: 'React Hooks',
          difficulty: 'easy'
        }
      ],
      'physics': [
        {
          id: '1',
          question: 'What is the acceleration due to gravity on Earth?',
          options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11.2 m/s²'],
          correctAnswer: 0,
          explanation: 'The standard acceleration due to gravity on Earth is approximately 9.8 m/s².',
          category: 'Gravity',
          difficulty: 'easy'
        }
      ]
    };

    const topicKey = topic.toLowerCase();
    return sampleQuizzes[topicKey] || sampleQuizzes['javascript'];
  }, []);

  // Generate Socratic teaching session
  const generateSocraticSession = useCallback(async (topic: string): Promise<SocraticSession> => {
    const sampleSessions: { [key: string]: SocraticSession } = {
      'javascript-functions': {
        topic: 'JavaScript Functions',
        learningObjective: 'Understand how functions work in JavaScript and their different forms',
        difficulty: 'intermediate',
        steps: [
          {
            id: '1',
            question: 'What do you think happens when you call a function in JavaScript?',
            hints: [
              'Think about what a function is designed to do',
              'Consider the relationship between calling a function and executing code',
              'Functions are like reusable blocks of code'
            ],
            expectedConcepts: ['execution', 'code block', 'reusable', 'call'],
            followUpQuestions: [
              'How do you think parameters work?',
              'What happens to variables inside a function?'
            ],
            category: 'Function Basics'
          },
          {
            id: '2',
            question: 'If you create a variable inside a function, where can you use that variable?',
            hints: [
              'Think about the concept of scope',
              'Consider what happens when the function finishes executing',
              'Variables have different levels of visibility'
            ],
            expectedConcepts: ['scope', 'local variables', 'function scope', 'visibility'],
            followUpQuestions: [
              'What about variables created outside functions?',
              'How does this relate to the concept of closure?'
            ],
            category: 'Scope'
          }
        ]
      },
      'physics-motion': {
        topic: 'Motion and Forces',
        learningObjective: 'Understand the fundamental principles of motion and how forces affect objects',
        difficulty: 'beginner',
        steps: [
          {
            id: '1',
            question: 'What do you observe when you push a book across a table?',
            hints: [
              'Think about what happens when you apply force',
              'Consider what happens when you stop pushing',
              'Notice the relationship between force and motion'
            ],
            expectedConcepts: ['force', 'motion', 'acceleration', 'friction'],
            followUpQuestions: [
              'Why does the book eventually stop?',
              'What would happen in space with no friction?'
            ],
            category: 'Forces and Motion'
          }
        ]
      }
    };

    const topicKey = topic.toLowerCase().replace(/\s+/g, '-');
    return sampleSessions[topicKey] || sampleSessions['javascript-functions'];
  }, []);

  // Create a new teaching session
  const createSession = useCallback(async (
    type: 'flashcards' | 'quiz' | 'socratic',
    topic: string,
    options?: { count?: number }
  ) => {
    setIsLoading(true);
    
    try {
      let data;
      
      switch (type) {
        case 'flashcards':
          data = await generateFlashCards(topic, options?.count || 10);
          break;
        case 'quiz':
          data = await generateQuiz(topic, options?.count || 5);
          break;
        case 'socratic':
          data = await generateSocraticSession(topic);
          break;
      }
      
      const newSession: TeachingSession = {
        id: `session-${Date.now()}`,
        type,
        topic,
        data,
        createdAt: new Date(),
        completed: false
      };
      
      setCurrentSession(newSession);
      setSessionHistory(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (error) {
      console.error('Error creating teaching session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateFlashCards, generateQuiz, generateSocraticSession]);

  // Complete a session
  const completeSession = useCallback((sessionId: string) => {
    setSessionHistory(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, completed: true } 
          : session
      )
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, completed: true } : null);
    }
  }, [currentSession]);

  // Get session by ID
  const getSession = useCallback((sessionId: string) => {
    return sessionHistory.find(session => session.id === sessionId) || null;
  }, [sessionHistory]);

  return {
    currentSession,
    sessionHistory,
    isLoading,
    createSession,
    completeSession,
    getSession,
    setCurrentSession
  };
};

export default useTeachingSession;