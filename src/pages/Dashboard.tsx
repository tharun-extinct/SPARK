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
  X
} from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { 
  ensureFirestoreConnection, 
  validateFirestoreConnection, 
  updateUserOnboardingStatus 
} from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

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
          {/* Welcome Header */}
          <div 
            id="welcome-header"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible('welcome-header') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 
                  </h1>
                  <p className="text-muted-foreground mt-1">Here's your wellness journey overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div 
            id="dashboard-tabs"
            data-animate
            className="opacity-100 translate-y-0"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div 
                  id="stats-grid"
                  data-animate
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-100 translate-y-0"
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Sessions */}
                  <div 
                    id="recent-sessions"
                    data-animate
                    className="opacity-100 translate-y-0"
                  >
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
                  </div>

                  {/* Wellness Goals */}
                  <div 
                    id="wellness-goals"
                    data-animate
                    className="opacity-100 translate-y-0"
                  >
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
                </div>

                {/* Quick Actions */}
                <div 
                  id="quick-actions"
                  data-animate
                  className="opacity-100 translate-y-0"
                >
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
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div 
                  id="analytics-dashboard"
                  data-animate
                  className="opacity-100 translate-y-0"
                >
                  <AnalyticsDashboard />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;