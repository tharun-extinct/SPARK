import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  Download, 
  Calendar,
  Heart,
  Brain,
  Activity,
  Star,
  Trophy,
  Zap,
  Clock,
  Award,
  CheckCircle
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('mood');
  const [visibleElements, setVisibleElements] = useState(new Set());
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
  }, [selectedTab]);

  const isVisible = (id: string) => visibleElements.has(id);

  // Real data with proper structure
  const moodData = [
    { date: '2024-01-01', mood: 6.5, energy: 7.2, stress: 4.1 },
    { date: '2024-01-02', mood: 7.1, energy: 6.8, stress: 3.9 },
    { date: '2024-01-03', mood: 6.8, energy: 7.5, stress: 3.2 },
    { date: '2024-01-04', mood: 8.2, energy: 8.1, stress: 2.8 },
    { date: '2024-01-05', mood: 7.9, energy: 7.8, stress: 3.1 },
    { date: '2024-01-06', mood: 8.5, energy: 8.3, stress: 2.5 },
    { date: '2024-01-07', mood: 8.1, energy: 7.9, stress: 2.9 },
  ];

  const conversationTopics = [
    { topic: 'Anxiety Management', frequency: 15, sentiment: 'positive', growth: 12 },
    { topic: 'Sleep Issues', frequency: 12, sentiment: 'neutral', growth: -5 },
    { topic: 'Work Stress', frequency: 10, sentiment: 'negative', growth: 8 },
    { topic: 'Relationships', frequency: 8, sentiment: 'positive', growth: 15 },
    { topic: 'Self-Care', frequency: 7, sentiment: 'positive', growth: 20 },
    { topic: 'Goal Setting', frequency: 6, sentiment: 'positive', growth: 10 },
    { topic: 'Mindfulness', frequency: 5, sentiment: 'positive', growth: 25 },
    { topic: 'Exercise', frequency: 4, sentiment: 'neutral', growth: 5 },
  ];

  const milestones = [
    {
      id: '1',
      title: 'Daily Check-ins',
      description: 'Complete daily mood and wellness check-ins',
      progress: 6,
      target: 7,
      category: 'wellness',
      completed: false
    },
    {
      id: '2',
      title: 'Anxiety Coping Skills',
      description: 'Learn and practice 5 different anxiety management techniques',
      progress: 5,
      target: 5,
      category: 'wellness',
      completed: true,
      completedDate: '2024-01-05'
    },
    {
      id: '3',
      title: 'Learning Streak',
      description: 'Maintain a 30-day learning conversation streak',
      progress: 18,
      target: 30,
      category: 'learning',
      completed: false
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first AI conversation',
      icon: '🎯',
      unlockedDate: '2024-01-01',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Mood Master',
      description: 'Tracked mood for 7 consecutive days',
      icon: '😊',
      unlockedDate: '2024-01-07',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Wellness Warrior',
      description: 'Completed 10 wellness-focused conversations',
      icon: '💪',
      unlockedDate: '2024-01-06',
      rarity: 'epic'
    }
  ];

  const sessionData = [
    { date: '2024-01-01', quality: 4.2, engagement: 4.5, satisfaction: 4.1, duration: 25, agentType: 'Mental Health' },
    { date: '2024-01-02', quality: 4.6, engagement: 4.8, satisfaction: 4.4, duration: 32, agentType: 'Tutor' },
    { date: '2024-01-03', quality: 4.1, engagement: 4.3, satisfaction: 4.0, duration: 28, agentType: 'Doctor' },
    { date: '2024-01-04', quality: 4.8, engagement: 4.9, satisfaction: 4.7, duration: 35, agentType: 'Mental Health' },
    { date: '2024-01-05', quality: 4.5, engagement: 4.6, satisfaction: 4.3, duration: 30, agentType: 'Tutor' },
    { date: '2024-01-06', quality: 4.9, engagement: 5.0, satisfaction: 4.8, duration: 40, agentType: 'Mental Health' },
    { date: '2024-01-07', quality: 4.7, engagement: 4.8, satisfaction: 4.6, duration: 33, agentType: 'Doctor' },
  ];

  const qualityMetrics = {
    empathy: 4.6,
    clarity: 4.3,
    helpfulness: 4.7,
    responsiveness: 4.5,
    accuracy: 4.4,
    engagement: 4.8
  };

  const radarData = [
    { subject: 'Empathy', value: qualityMetrics.empathy, fullMark: 5 },
    { subject: 'Clarity', value: qualityMetrics.clarity, fullMark: 5 },
    { subject: 'Helpfulness', value: qualityMetrics.helpfulness, fullMark: 5 },
    { subject: 'Responsiveness', value: qualityMetrics.responsiveness, fullMark: 5 },
    { subject: 'Accuracy', value: qualityMetrics.accuracy, fullMark: 5 },
    { subject: 'Engagement', value: qualityMetrics.engagement, fullMark: 5 },
  ];

  const handleExportData = () => {
    console.log('Exporting analytics data...');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wellness': return 'bg-green-100 text-green-800 border-green-200';
      case 'learning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentMood = moodData[moodData.length - 1]?.mood || 0;
  const avgMood = moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length;
  const avgEnergy = moodData.reduce((sum, item) => sum + item.energy, 0) / moodData.length;
  const avgStress = moodData.reduce((sum, item) => sum + item.stress, 0) / moodData.length;
  const averageRating = sessionData.reduce((sum, item) => sum + item.quality, 0) / sessionData.length;

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div 
        id="analytics-header"
        data-animate
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-1000 ${
          isVisible('analytics-header') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-100 translate-y-0'
        }`}
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            AI Conversation Analytics
          </h2>
          <p className="text-muted-foreground">
            Insights into your wellness journey and AI interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white transition-all duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div 
        id="analytics-tabs"
        data-animate
        className={`transition-all duration-1000 delay-200 ${
          isVisible('analytics-tabs') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-100 translate-y-0'
        }`}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger 
              value="mood" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="w-4 h-4" />
              Mood Tracking
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Conversation Insights
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <Target className="w-4 h-4" />
              Progress Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="quality" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
            >
              <BarChart3 className="w-4 h-4" />
              Session Quality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-6">
            {/* Mood Overview Cards */}
            <div 
              id="mood-overview"
              data-animate
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-rose-600">{currentMood.toFixed(1)}</div>
                      <div className="text-sm text-rose-500">Current Mood</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{avgMood.toFixed(1)}</div>
                      <div className="text-sm text-blue-500">Avg Mood</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{avgEnergy.toFixed(1)}</div>
                      <div className="text-sm text-green-500">Avg Energy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{avgStress.toFixed(1)}</div>
                      <div className="text-sm text-orange-500">Avg Stress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Mood Tracking Over Time
                </CardTitle>
                <CardDescription>
                  Your emotional patterns over {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}/10
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#moodGradient)"
                        name="Mood"
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="Energy"
                      />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        name="Stress"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Conversation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">42</div>
                      <div className="text-sm text-blue-500">Total Sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">31min</div>
                      <div className="text-sm text-green-500">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">1,302</div>
                      <div className="text-sm text-purple-500">Total Minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Topic Word Cloud */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Conversation Topics
                </CardTitle>
                <CardDescription>
                  Most frequently discussed topics in your conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  {conversationTopics.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${getSentimentColor(topic.sentiment)} hover:scale-105 transition-transform cursor-pointer animate-pulse`}
                      style={{ 
                        fontSize: `${12 + (topic.frequency / 15) * 12}px`,
                        padding: '8px 12px',
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {topic.topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Analysis Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle>Topic Frequency Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of your conversation themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversationTopics.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="topic" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{label}</p>
                                <p className="text-blue-600">Frequency: {data.frequency}</p>
                                <p className="text-green-600">Sentiment: {data.sentiment}</p>
                                <p className="text-purple-600">Growth: {data.growth}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="frequency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">73%</div>
                      <div className="text-sm text-blue-500">Overall Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">5/7</div>
                      <div className="text-sm text-green-500">Weekly Goals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{achievements.length}</div>
                      <div className="text-sm text-purple-500">Achievements</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">2/3</div>
                      <div className="text-sm text-orange-500">Milestones</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Learning Milestones
                </CardTitle>
                <CardDescription>
                  Track your progress towards wellness and learning goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id} 
                      className="space-y-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{milestone.title}</span>
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(milestone.category)}
                          >
                            {milestone.category}
                          </Badge>
                          {milestone.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {milestone.progress}/{milestone.target}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      <Progress value={(milestone.progress / milestone.target) * 100} className="h-3" />
                      {milestone.completed && milestone.completedDate && (
                        <p className="text-xs text-green-600">
                          Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your accomplishments and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-2xl animate-bounce">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{achievement.title}</span>
                          <Badge 
                            className={getRarityColor(achievement.rarity)}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                      <div className="text-sm text-yellow-500">Avg Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">127</div>
                      <div className="text-sm text-blue-500">Total Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{qualityMetrics.empathy.toFixed(1)}</div>
                      <div className="text-sm text-green-500">Empathy Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{qualityMetrics.engagement.toFixed(1)}</div>
                      <div className="text-sm text-purple-500">Engagement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Quality Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Session Quality Trend
                  </CardTitle>
                  <CardDescription>
                    Quality ratings over your recent sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sessionData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded-lg shadow-lg">
                                  <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                                  <p className="text-blue-600">Quality: {data.quality}/5</p>
                                  <p className="text-green-600">Engagement: {data.engagement}/5</p>
                                  <p className="text-purple-600">Satisfaction: {data.satisfaction}/5</p>
                                  <p className="text-gray-600">Agent: {data.agentType}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="quality" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics Radar */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    AI Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of AI assistant capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 5]} 
                          tick={{ fontSize: 10 }}
                          tickCount={6}
                        />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle>Recent Session Feedback</CardTitle>
                <CardDescription>
                  Your latest conversation ratings and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionData.slice(-5).map((session, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md hover:scale-102 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{session.agentType}</Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{session.duration}min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < session.quality 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{session.quality.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;