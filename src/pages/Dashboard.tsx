
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronRight,
  Sparkles,
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { 
  ensureFirestoreConnection, 
  validateFirestoreConnection, 
  updateUserOnboardingStatus 
} from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { wellnessAssistants } from "@/services/tavusConversation";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [activeTab, setActiveTab] = useState("wellness");

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
              // No cached status, so redirect to onboarding
              console.warn("No cached onboarding status and connection issues - redirecting to onboarding");
              navigate("/onboarding");
              return;
            }
          } catch (e) {
            console.error("Error checking cached status:", e);
            navigate("/onboarding");
            return;
          }
        } else if (fromOnboarding) {
          // We're coming from onboarding and have a good connection
          toast({
            title: "Welcome to SPARK!",
            description: "Your mental wellness journey begins now.",
          });
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        toast({
          title: "Error Loading Dashboard",
          description: "Please try again or contact support if the problem persists.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    };
    
    if (currentUser) {
      initializeDashboard();
    } else {
      // No user is logged in, redirect to login
      navigate("/login");
    }
  }, [currentUser, location.state, navigate, toast]);

  // Mock data for the dashboard
  const wellnessScore = 72;
  const moodTrend = [60, 65, 58, 64, 68, 72, 75];
  const upcomingSession = {
    title: "Mindfulness Session",
    time: "Today, 3:00 PM",
    assistant: "Dr. Anna"
  };
  const recentConversations = [
    { id: 1, assistant: "Dr. Anna", time: "Yesterday", topic: "Stress Management" },
    { id: 2, assistant: "Maya", time: "3 days ago", topic: "Guided Meditation" }
  ];
  const dailyGoals = [
    { id: 1, title: "10 minutes of mindfulness", completed: true },
    { id: 2, title: "Record mood in journal", completed: true },
    { id: 3, title: "Evening reflection practice", completed: false }
  ];

  // Calculate the percentage of completed goals
  const completedGoals = dailyGoals.filter(goal => goal.completed).length;
  const goalPercentage = Math.round((completedGoals / dailyGoals.length) * 100);

  // Handler for starting a new conversation
  const startConversation = (assistantType: string) => {
    navigate(`/conversation/${assistantType}`);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Hello, {currentUser?.displayName || 'Friend'}!
          </h1>
          <p className="text-muted-foreground">
            {connectionError ? 
              "Limited connection mode. Some features may be unavailable." :
              "How are you feeling today?"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/conversation/therapist')}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Start a Conversation
          </Button>
          <Button onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="wellness" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Wellness Tab */}
        <TabsContent value="wellness" className="space-y-6">
          {/* Wellness Score and Mood Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-primary" />
                  Wellness Score
                </CardTitle>
                <CardDescription>Your overall mental wellness assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-5xl font-bold">{wellnessScore}</div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12% this week</span>
                  </div>
                </div>
                <Progress value={wellnessScore} className="h-2 mt-4" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Needs Attention</span>
                  <span>Excellent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Daily Goals
                </CardTitle>
                <CardDescription>Track your wellness activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Progress: {completedGoals}/{dailyGoals.length} completed</div>
                    <div className="text-sm font-medium">{goalPercentage}%</div>
                  </div>
                  <Progress value={goalPercentage} className="h-2" />
                  
                  <div className="space-y-2 mt-4">
                    {dailyGoals.map(goal => (
                      <div key={goal.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${goal.completed ? 'bg-primary' : 'border border-muted-foreground'}`}>
                          {goal.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>{goal.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Conversations and Upcoming Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                  Recent Conversations
                </CardTitle>
                <CardDescription>Your latest wellness sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentConversations.length > 0 ? (
                  <div className="space-y-4">
                    {recentConversations.map(convo => (
                      <div key={convo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {convo.assistant.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{convo.assistant}</div>
                            <div className="text-sm text-muted-foreground">{convo.topic}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">{convo.time}</div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent conversations found.
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("assistants")}>
                  Start New Conversation
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Session
                </CardTitle>
                <CardDescription>Your next scheduled activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{upcomingSession.time}</span>
                  </div>
                  <h3 className="font-medium mb-1">{upcomingSession.title}</h3>
                  <p className="text-sm text-muted-foreground">With {upcomingSession.assistant}</p>
                  
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="w-full">Reschedule</Button>
                    <Button size="sm" className="w-full">Join</Button>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assistants Tab */}
        <TabsContent value="assistants" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Choose Your Wellness Assistant</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(wellnessAssistants).map(([key, assistant]) => (
              <Card key={key} className="overflow-hidden border hover:shadow-md transition-all cursor-pointer" onClick={() => startConversation(key)}>
                <div className="h-3 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={assistant.avatar} alt={assistant.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {assistant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{assistant.name}</h3>
                    <Badge variant="outline" className="mt-1">{assistant.title}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{assistant.description}</p>
                  
                  <Button className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start Conversation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 p-6 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">SPARK AI Technology</h3>
                <p className="text-muted-foreground mb-4">
                  Our wellness assistants are powered by Tavus's advanced Conversational Video Interface (CVI) 
                  with emotional perception capabilities and natural conversation flow.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-2 bg-primary/5 rounded border">
                    <span className="font-medium">Phoenix-3</span>: Lifelike avatar generation
                  </div>
                  <div className="p-2 bg-primary/5 rounded border">
                    <span className="font-medium">Raven-0</span>: Emotional perception
                  </div>
                  <div className="p-2 bg-primary/5 rounded border">
                    <span className="font-medium">Sparrow-0</span>: Natural conversation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  Mood Patterns
                </CardTitle>
                <CardDescription>7-day analysis of your emotional state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {moodTrend.map((value, index) => (
                    <div key={index} className="relative flex-1">
                      <div 
                        className="bg-primary/80 rounded-t-sm w-full hover:bg-primary transition-colors" 
                        style={{ height: `${value}%` }}
                      />
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t">
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Your mood has been gradually improving over the past week. 
                    Weekend activities seem to correlate with higher emotional wellbeing.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Wellness Factors
                </CardTitle>
                <CardDescription>Areas influencing your mental wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Sleep Quality</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Stress Management</span>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Social Connection</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Mindfulness Practice</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <p className="font-medium mb-1">Recommendation:</p>
                  <p>Consider adding more mindfulness practice to your daily routine to improve overall wellness.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Personalized Insights
              </CardTitle>
              <CardDescription>AI-generated observations about your wellness journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Positive Trend
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your mood scores have improved by 15% since you started regular meditation sessions.
                  The consistency of your practice appears to be having a cumulative positive effect.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Pattern Detected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your stress levels tend to peak on Wednesday afternoons. Consider scheduling a brief 
                  mindfulness break or short walk during this time to help manage mid-week pressure.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Achievement
                </h4>
                <p className="text-sm text-muted-foreground">
                  You've completed 10 consecutive days of mood tracking! Consistent self-monitoring 
                  is associated with improved emotional awareness and self-regulation.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Wellness Report
              </Button>            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;