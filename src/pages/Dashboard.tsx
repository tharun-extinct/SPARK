import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Brain, 
  Activity, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  Clock,
  Target,
  Home,
  Settings,
  User,
  BarChart3,
  Sparkles,
  Zap,
  Star,
  X,
  LineChart,
  PieChart
} from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { 
  ensureFirestoreConnection, 
  validateFirestoreConnection, 
  updateUserOnboardingStatus 
} from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for scroll animations
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

    // Observe all animated elements
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
  }, [isLoading]);

  // Welcome popup logic
  useEffect(() => {
    // Show welcome popup after dashboard loads
    if (!isLoading && currentUser) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000); // Show popup 1 second after dashboard loads

      return () => clearTimeout(timer);
    }
  }, [isLoading, currentUser]);

  // Auto-hide welcome popup
  useEffect(() => {
    if (showWelcomePopup) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(false);
      }, 5000); // Hide popup after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showWelcomePopup]);

  // Check if we're coming directly from onboarding and ensure Firestore connection
  useEffect(() => {
    const fromOnboarding = location.state?.fromOnboarding === true;
    const offlineCompletion = location.state?.offlineCompletion === true;
    console.log("Dashboard loaded, from onboarding:", fromOnboarding);
    console.log("Current user:", currentUser?.uid);
    
    const initializeDashboard = async () => {
      try {
        // Check if we have a fallback completion status in sessionStorage
        let fallbackOnboardingStatus = false;
        if (currentUser) {
          try {
            fallbackOnboardingStatus = sessionStorage.getItem(`onboarding_complete_${currentUser.uid}`) === 'true';
          } catch (storageError) {
            console.error("Failed to read from sessionStorage:", storageError);
          }
        }
        
        // If we have offline completion or fallback status, handle specially
        if (offlineCompletion || fallbackOnboardingStatus) {
          console.log("Using offline/fallback onboarding completion status");
          
          // Attempt to update the status in the background
          updateUserOnboardingStatus(currentUser?.uid || '', true)
            .then(success => {
              if (success) {
                console.log("Successfully synchronized offline onboarding status");
                try {
                  sessionStorage.removeItem(`onboarding_complete_${currentUser?.uid}`);
                } catch (e) {}
              } else {
                console.error("Failed to synchronize offline onboarding status");
                // We'll keep the sessionStorage entry to try again later
              }
            })
            .catch(err => console.error("Error syncing onboarding status:", err));
          
          // Continue loading the dashboard regardless of synchronization status
          setIsLoading(false);
          return;
        }
        
        // Standard initialization - try to establish Firestore connection with shorter timeout
        const connectionPromise = ensureFirestoreConnection(2);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 5000));
        
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (!isConnected) {
          console.warn("Could not establish reliable Firestore connection");
          
          // Check if there's a cached onboarding status
          try {
            const cachedStatus = sessionStorage.getItem(`onboarding_complete_${currentUser?.uid}`);
            if (cachedStatus === 'true') {
              console.log("Using cached onboarding status due to connection issues");
              setConnectionError(true);
              
              // Show toast to inform the user
              toast({
                title: "Limited Connectivity",
                description: "Using cached data while we try to restore connection. Some features may be unavailable.",
                variant: "destructive",
              });
            } else {
              setConnectionError(true);
              
              // Only show a toast if connection completely failed
              if (await validateFirestoreConnection() === false) {
                toast({
                  title: "Connection Issues",
                  description: "Having trouble connecting to our servers. Some features may be limited.",
                  variant: "destructive",
                });
              }
            }
          } catch (e) {
            setConnectionError(true);
          }
        }
        
        if (fromOnboarding) {
          toast({
            title: "Welcome to SPARK",
            description: "Your onboarding is complete. Start your wellness journey!",
          });
        }
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        setConnectionError(true);
        
        toast({
          title: "Connection Error",
          description: "We're having trouble connecting to our servers. Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        // Show dashboard regardless of connection state
        setIsLoading(false);
        
        // Set up a background reconnection attempt
        if (connectionError) {
          setTimeout(() => {
            validateFirestoreConnection()
              .then(connected => {
                if (connected) {
                  console.log("Background connection attempt succeeded");
                  setConnectionError(false);
                  // Attempt to sync any pending onboarding status
                  if (currentUser && sessionStorage.getItem(`onboarding_complete_${currentUser.uid}`) === 'true') {
                    updateUserOnboardingStatus(currentUser.uid, true)
                      .then(success => {
                        if (success) {
                          try {
                            sessionStorage.removeItem(`onboarding_complete_${currentUser.uid}`);
                          } catch (e) {}
                        }
                      });
                  }
                }
              })
              .catch(() => {}); // Ignore errors in background reconnection
          }, 10000); // Try to reconnect after 10 seconds
        }
      }
    };
    
    // Short loading delay for better UX, then initialize
    const timer = setTimeout(() => {
      initializeDashboard();
    }, 1000);
      return () => clearTimeout(timer);
  }, [location, currentUser, toast, connectionError]);

  const isVisible = (id: string) => visibleElements.has(id);

  const metrics = {
    moodScore: 7.2,
    sessionsThisWeek: 4,
    totalMinutes: 180,
    streakDays: 12,
    wellnessGoals: 3,
    completedGoals: 2
  };

  const recentSessions = [
    { id: 1, agent: "Dr. Sarah", type: "Mental Health", duration: "45 min", mood: "Good", date: "Today", color: "from-pink-500 to-rose-500" },
    { id: 2, agent: "Alex", type: "Learning", duration: "30 min", mood: "Focused", date: "Yesterday", color: "from-blue-500 to-cyan-500" },
    { id: 3, agent: "Dr. James", type: "Wellness", duration: "25 min", mood: "Calm", date: "2 days ago", color: "from-green-500 to-emerald-500" },
  ];
  
  const upcomingGoals = [
    { id: 1, title: "Daily check-in", progress: 80, target: "7 days", color: "from-purple-500 to-pink-500" },
    { id: 2, title: "Anxiety management", progress: 60, target: "Practice breathing", color: "from-blue-500 to-indigo-500" },
    { id: 3, title: "Sleep hygiene", progress: 40, target: "8 hours sleep", color: "from-green-500 to-teal-500" },
  ];

  // Sample data for quick insights
  const moodData = [
    { date: '2024-01-01', mood: 6.5 },
    { date: '2024-01-02', mood: 7.1 },
    { date: '2024-01-03', mood: 6.8 },
    { date: '2024-01-04', mood: 8.2 },
    { date: '2024-01-05', mood: 7.9 },
    { date: '2024-01-06', mood: 8.5 },
    { date: '2024-01-07', mood: 8.1 },
  ];

  const agentUsageData = [
    { name: 'Mental Health', value: 45, color: '#ef4444' },
    { name: 'Learning', value: 28, color: '#3b82f6' },
    { name: 'Wellness', value: 14, color: '#10b981' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" 
             style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-2xl animate-pulse" 
             style={{ bottom: '10%', right: '10%' }} />
        <div className="absolute w-48 h-48 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse" 
             style={{ top: '50%', right: '20%' }} />
      </div>

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="relative p-8 text-center">
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Welcome to SPARK! 🎉
              </h2>
              
              <p className="text-gray-600 mb-6">
                Hello {currentUser?.displayName?.split(' ')[0] || 'there'}! Your wellness journey starts here. 
                Explore AI conversations, track your progress, and discover new insights about yourself.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => {
                    setShowWelcomePopup(false);
                    navigate("/conversation/psychiatrist");
                  }}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300"
                >
                  Start First Chat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowWelcomePopup(false)}
                >
                  Explore Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-gray-600 animate-pulse">Preparing your dashboard...</p>
          </div>
        </div>
      ) : connectionError ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-xl p-6 max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-red-700 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">
              We're having trouble connecting to our servers. This might be due to your internet connection or a temporary server issue.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-6 space-y-6">
          <div className="max-w-7xl mx-auto">
            {/* Simplified Header */}
            <div 
              id="welcome-header"
              data-animate
              className="text-center mb-8 opacity-100 translate-y-0"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Welcome back, {currentUser?.displayName?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-xl text-muted-foreground">
                Here's your wellness overview for today
              </p>
            </div>

            {/* Quick Stats - Always Visible */}
            <div 
              id="stats-grid"
              data-animate
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 opacity-100 translate-y-0"
            >
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-rose-700">Mood Score</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">{metrics.moodScore}/10</div>
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +0.5 from last week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Sessions</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metrics.sessionsThisWeek}</div>
                  <p className="text-xs text-blue-500">
                    This week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Time Spent</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics.totalMinutes}min</div>
                  <p className="text-xs text-green-500">
                    Total this week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Streak</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{metrics.streakDays}</div>
                  <p className="text-xs text-orange-500 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Days active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Simplified Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Sessions */}
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        Recent Sessions
                      </CardTitle>
                      <CardDescription>
                        Your latest AI companion interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentSessions.map((session, index) => (
                          <div 
                            key={session.id} 
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-102 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 bg-gradient-to-r ${session.color} rounded-full animate-pulse`}></div>
                              <div>
                                <p className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{session.agent}</p>
                                <p className="text-sm text-gray-600">{session.type} • {session.duration}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">{session.mood}</p>
                              <p className="text-xs text-gray-500">{session.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4 hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white transition-all duration-300">
                        View All Sessions
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Wellness Goals */}
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mr-3">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        Wellness Goals
                      </CardTitle>
                      <CardDescription>
                        Track your progress towards better mental health
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingGoals.map((goal, index) => (
                          <div key={goal.id} className="space-y-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-slate-700">{goal.title}</p>
                              <span className="text-sm text-gray-600 font-semibold">{goal.progress}%</span>
                            </div>
                            <div className="relative">
                              <Progress value={goal.progress} className="h-3" />
                              <div 
                                className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${goal.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">{goal.target}</p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4 hover:bg-gradient-to-r hover:from-green-500 hover:to-teal-600 hover:text-white transition-all duration-300">
                        Set New Goal
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Start a new session or explore your wellness tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        onClick={() => navigate("/conversation/psychiatrist")}
                        className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Heart className="w-6 h-6" />
                        <span>Mental Health Chat</span>
                      </Button>
                      <Button 
                        onClick={() => navigate("/conversation/tutor")}
                        className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white"
                      >
                        <Brain className="w-6 h-6" />
                        <span>Learning Session</span>
                      </Button>
                      <Button 
                        onClick={() => navigate("/conversation/doctor")}
                        className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white"
                      >
                        <Activity className="w-6 h-6" />
                        <span>Wellness Check</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {/* Quick Insights Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Your Wellness Insights
                  </h2>
                  <p className="text-muted-foreground">
                    Key patterns and trends from your SPARK journey
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Mood Trend - Simplified */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <LineChart className="w-6 h-6 text-rose-500" />
                        Mood Trend
                      </CardTitle>
                      <CardDescription className="text-base">
                        Your mood pattern over the past week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                            />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                      <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                                      <p style={{ color: payload[0].color }}>
                                        Mood: {payload[0].value}/10
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="mood"
                              stroke="#ef4444"
                              strokeWidth={3}
                              dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Agent Usage - Simplified */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <PieChart className="w-6 h-6 text-blue-500" />
                        AI Agent Usage
                      </CardTitle>
                      <CardDescription className="text-base">
                        How you've been using different AI companions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={agentUsageData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {agentUsageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Insights */}
                <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Brain className="w-6 h-6 text-purple-500" />
                      Key Insights
                    </CardTitle>
                    <CardDescription className="text-base">
                      Personalized insights from your SPARK journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Positive Trend</span>
                        </div>
                        <p className="text-sm text-green-700">Your mood has improved by 15% this week</p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Achievement</span>
                        </div>
                        <p className="text-sm text-blue-700">12-day streak of consistent check-ins</p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-800">Pattern</span>
                        </div>
                        <p className="text-sm text-purple-700">You're most active with mental health sessions</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-orange-800">Suggestion</span>
                        </div>
                        <p className="text-sm text-orange-700">Try morning sessions for better consistency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Analytics Button */}
                <div className="text-center">
                  <Button 
                    onClick={() => setShowDetailedAnalytics(true)}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Detailed Analytics Modal/Overlay */}
      {showDetailedAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detailed Analytics</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailedAnalytics(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-center text-muted-foreground">
                Comprehensive analytics dashboard would be loaded here with all the detailed charts and metrics.
                This keeps the main dashboard clean while providing access to deeper insights when needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;