import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { 
  ensureFirestoreConnection, 
  validateFirestoreConnection, 
  updateUserOnboardingStatus,
  checkFirestoreHealth
} from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, resetFirestoreConnection, checkConnection } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // "connected", "reconnecting", "offline"
  const [connectionCheckTime, setConnectionCheckTime] = useState(0);// Check if we're coming directly from onboarding and ensure Firestore connection
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
            title: "Welcome to ConnectAI",
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

  // Function to check and monitor Firestore connection health
  const checkConnectionHealth = async () => {
    // Don't check too frequently to avoid spamming the server
    const now = Date.now();
    if (now - connectionCheckTime < 10000) {  // Only check every 10 seconds at most
      return;
    }
    
    setConnectionCheckTime(now);
    
    try {
      // Update connection status to "checking"
      setConnectionStatus("checking");
      
      // Check connection health
      const isConnected = await checkConnection();
      
      // Update connection status based on result
      if (isConnected) {
        if (connectionStatus !== "connected") {
          setConnectionStatus("connected");
          toast({
            title: "Connection Restored",
            description: "Your connection to SPARK has been restored.",
            variant: "default",
          });
        }
        setConnectionError(false);
      } else {
        // If not connected, try to reconnect
        setConnectionStatus("reconnecting");
        
        // Attempt to reset the connection
        await resetFirestoreConnection();
        
        // Check again after reset
        const reconnected = await checkConnection();
        
        if (reconnected) {
          setConnectionStatus("connected");
          toast({
            title: "Connection Restored",
            description: "Your connection to SPARK has been restored.",
            variant: "default",
          });
          setConnectionError(false);
        } else {
          setConnectionStatus("offline");
          setConnectionError(true);
          toast({
            title: "Connection Lost",
            description: "You appear to be offline. Some features may be limited.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error checking connection health:", error);
      setConnectionStatus("offline");
      setConnectionError(true);
    }
  };
  // Periodically check connection health
  useEffect(() => {
    // Only check connection if we're authenticated to avoid blocking landing page
    if (currentUser) {
      // Check connection immediately when component mounts
      checkConnectionHealth();
      
      // Then set up a periodic check every 30 seconds
      const intervalId = setInterval(() => {
        checkConnectionHealth();
      }, 30000);
      
      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, currentUser]);

  const metrics = {
    moodScore: 7.2,
    sessionsThisWeek: 4,
    totalMinutes: 180,
    streakDays: 12,
    wellnessGoals: 3,
    completedGoals: 2
  };

  const recentSessions = [
    { id: 1, agent: "Dr. Sarah", type: "Mental Health", duration: "45 min", mood: "Good", date: "Today" },
    { id: 2, agent: "Alex", type: "Learning", duration: "30 min", mood: "Focused", date: "Yesterday" },
    { id: 3, agent: "Dr. James", type: "Wellness", duration: "25 min", mood: "Calm", date: "2 days ago" },
  ];
  const upcomingGoals = [
    { id: 1, title: "Daily check-in", progress: 80, target: "7 days" },
    { id: 2, title: "Anxiety management", progress: 60, target: "Practice breathing" },
    { id: 3, title: "Sleep hygiene", progress: 40, target: "8 hours sleep" },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Preparing your dashboard...</p>
          </div>
        </div>
      ) : connectionError ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-700 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">
              We're having trouble connecting to our servers. This might be due to your internet connection or a temporary server issue.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  <Home className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Dashboard</h1>
              </div>              <div className="flex items-center space-x-4">
                {/* Connection Status Indicator */}
                <div className="flex items-center space-x-2 mr-4">
                  {connectionStatus === "connected" && (
                    <div className="flex items-center text-green-500 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Connected
                    </div>
                  )}
                  {connectionStatus === "reconnecting" && (
                    <div className="flex items-center text-amber-500 text-sm">
                      <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                      Reconnecting...
                    </div>
                  )}
                  {connectionStatus === "offline" && (
                    <div className="flex items-center text-red-500 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      Offline
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 h-6 text-xs"
                        onClick={checkConnectionHealth}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mood Score</CardTitle>
                  <Heart className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.moodScore}/10</div>
                  <p className="text-xs text-muted-foreground">
                    +0.5 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.sessionsThisWeek}</div>
                  <p className="text-xs text-muted-foreground">
                    This week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalMinutes}min</div>
                  <p className="text-xs text-muted-foreground">
                    Total this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.streakDays}</div>
                  <p className="text-xs text-muted-foreground">
                    Days active
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Sessions
                  </CardTitle>
                  <CardDescription>
                    Your latest AI companion interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{session.agent}</p>
                          <p className="text-sm text-gray-600">{session.type} • {session.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.mood}</p>
                          <p className="text-xs text-gray-500">{session.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Sessions
                  </Button>
                </CardContent>
              </Card>

              {/* Wellness Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Wellness Goals
                  </CardTitle>
                  <CardDescription>
                    Track your progress towards better mental health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGoals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{goal.title}</p>
                          <span className="text-sm text-gray-600">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <p className="text-xs text-gray-500">{goal.target}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Set New Goal
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start a new session or explore your wellness tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate("/conversation/psychiatrist")}
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Heart className="w-6 h-6" />
                    <span>Mental Health Chat</span>
                  </Button>
                  <Button 
                    onClick={() => navigate("/conversation/tutor")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Brain className="w-6 h-6" />
                    <span>Learning Session</span>
                  </Button>
                  <Button 
                    onClick={() => navigate("/conversation/doctor")}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <Activity className="w-6 h-6" />
                    <span>Wellness Check</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>  );
};

export default Dashboard;
