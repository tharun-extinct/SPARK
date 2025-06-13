
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
  User
} from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { ensureFirestoreConnection } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Check if we're coming directly from onboarding and ensure Firestore connection
  useEffect(() => {
    const fromOnboarding = location.state?.fromOnboarding === true;
    console.log("Dashboard loaded, from onboarding:", fromOnboarding);
    console.log("Current user:", currentUser?.uid);
    
    const initializeDashboard = async () => {
      try {
        // Ensure Firestore connection is working before loading dashboard
        const isConnected = await ensureFirestoreConnection(3);
        
        if (!isConnected) {
          console.error("Failed to connect to Firestore");
          setConnectionError(true);
          toast({
            title: "Connection Error",
            description: "Could not connect to the database. Please check your internet connection and try again.",
            variant: "destructive",
          });
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
      } finally {
        // Show dashboard even if there are connection issues
        setIsLoading(false);
      }
    };
    
    // Short loading delay for better UX, then initialize
    const timer = setTimeout(() => {
      initializeDashboard();
    }, 1000);
      return () => clearTimeout(timer);
  }, [location, currentUser, toast]);

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
              </div>
              <div className="flex items-center space-x-4">
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
