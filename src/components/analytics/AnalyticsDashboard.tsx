import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
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
  CheckCircle,
  Users,
  Smile,
  AlertCircle,
  TrendingDown,
  Eye,
  Headphones,
  Video,
  MessageCircleMore
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');
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

  // Enhanced data with more comprehensive analytics
  const moodData = [
    { date: '2024-01-01', mood: 6.5, energy: 7.2, stress: 4.1, anxiety: 3.8, sleep: 7.0 },
    { date: '2024-01-02', mood: 7.1, energy: 6.8, stress: 3.9, anxiety: 3.5, sleep: 6.5 },
    { date: '2024-01-03', mood: 6.8, energy: 7.5, stress: 3.2, anxiety: 3.0, sleep: 8.0 },
    { date: '2024-01-04', mood: 8.2, energy: 8.1, stress: 2.8, anxiety: 2.5, sleep: 7.5 },
    { date: '2024-01-05', mood: 7.9, energy: 7.8, stress: 3.1, anxiety: 2.8, sleep: 7.8 },
    { date: '2024-01-06', mood: 8.5, energy: 8.3, stress: 2.5, anxiety: 2.2, sleep: 8.2 },
    { date: '2024-01-07', mood: 8.1, energy: 7.9, stress: 2.9, anxiety: 2.6, sleep: 7.9 },
  ];

  const conversationData = [
    { date: '2024-01-01', sessions: 2, duration: 45, satisfaction: 4.2, topics: 3 },
    { date: '2024-01-02', sessions: 1, duration: 32, satisfaction: 4.6, topics: 2 },
    { date: '2024-01-03', sessions: 3, duration: 67, satisfaction: 4.1, topics: 4 },
    { date: '2024-01-04', sessions: 2, duration: 58, satisfaction: 4.8, topics: 3 },
    { date: '2024-01-05', sessions: 1, duration: 28, satisfaction: 4.5, topics: 2 },
    { date: '2024-01-06', sessions: 2, duration: 52, satisfaction: 4.9, topics: 3 },
    { date: '2024-01-07', sessions: 1, duration: 35, satisfaction: 4.7, topics: 2 },
  ];

  const agentUsageData = [
    { name: 'Mental Health', sessions: 45, percentage: 52, color: '#ef4444' },
    { name: 'Learning', sessions: 28, percentage: 32, color: '#3b82f6' },
    { name: 'Wellness', sessions: 14, percentage: 16, color: '#10b981' },
  ];

  const topicTrendsData = [
    { topic: 'Anxiety Management', week1: 15, week2: 12, week3: 18, week4: 14, trend: 'stable' },
    { topic: 'Sleep Issues', week1: 8, week2: 12, week3: 10, week4: 6, trend: 'improving' },
    { topic: 'Work Stress', week1: 10, week2: 8, week3: 12, week4: 15, trend: 'increasing' },
    { topic: 'Relationships', week1: 5, week2: 8, week3: 6, week4: 9, trend: 'stable' },
    { topic: 'Self-Care', week1: 3, week2: 5, week3: 7, week4: 9, trend: 'improving' },
  ];

  const wellnessMetrics = {
    overall: 7.8,
    emotional: 7.5,
    physical: 8.1,
    social: 7.2,
    mental: 8.0,
    spiritual: 6.8
  };

  const radarData = [
    { subject: 'Emotional', value: wellnessMetrics.emotional, fullMark: 10 },
    { subject: 'Physical', value: wellnessMetrics.physical, fullMark: 10 },
    { subject: 'Social', value: wellnessMetrics.social, fullMark: 10 },
    { subject: 'Mental', value: wellnessMetrics.mental, fullMark: 10 },
    { subject: 'Spiritual', value: wellnessMetrics.spiritual, fullMark: 10 },
  ];

  const engagementMetrics = [
    { metric: 'Session Completion Rate', value: 94, target: 90, status: 'excellent' },
    { metric: 'Average Session Duration', value: 42, target: 30, status: 'good' },
    { metric: 'Weekly Active Days', value: 5, target: 4, status: 'excellent' },
    { metric: 'Response Quality Rating', value: 4.6, target: 4.0, status: 'excellent' },
  ];

  const handleExportData = () => {
    const data = {
      moodData,
      conversationData,
      agentUsageData,
      topicTrendsData,
      wellnessMetrics,
      engagementMetrics,
      exportDate: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spark-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentMood = moodData[moodData.length - 1]?.mood || 0;
  const avgMood = moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length;
  const totalSessions = conversationData.reduce((sum, item) => sum + item.sessions, 0);
  const avgSatisfaction = conversationData.reduce((sum, item) => sum + item.satisfaction, 0) / conversationData.length;

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 rounded-2xl">
      {/* Header */}
      <div 
        id="analytics-header"
        data-animate
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-100 translate-y-0"
      >
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            AI Conversation Analytics
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Comprehensive insights into your wellness journey and AI interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
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
            className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white transition-all duration-300 shadow-lg"
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
        className="opacity-100 translate-y-0"
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-xl p-2">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 rounded-lg"
            >
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="mood" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 rounded-lg"
            >
              <Heart className="w-4 h-4" />
              Mood & Wellness
            </TabsTrigger>
            <TabsTrigger 
              value="conversations" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger 
              value="engagement" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 rounded-lg"
            >
              <Zap className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 rounded-lg"
            >
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{avgMood.toFixed(1)}</div>
                      <div className="text-sm text-blue-500">Avg Mood Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{totalSessions}</div>
                      <div className="text-sm text-green-500">Total Sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{avgSatisfaction.toFixed(1)}</div>
                      <div className="text-sm text-purple-500">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{wellnessMetrics.overall}</div>
                      <div className="text-sm text-orange-500">Wellness Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wellness Overview Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="w-6 h-6 text-purple-500" />
                    Wellness Dimensions
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your overall wellness across different life areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 10]} 
                          tick={{ fontSize: 10 }}
                          tickCount={6}
                        />
                        <Radar
                          name="Wellness"
                          dataKey="value"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                    AI Agent Usage
                  </CardTitle>
                  <CardDescription className="text-base">
                    Distribution of your conversations by AI agent type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={agentUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="sessions"
                        >
                          {agentUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            {/* Mood Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-rose-600">{currentMood.toFixed(1)}</div>
                      <div className="text-sm text-rose-500">Current Mood</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{(moodData.reduce((sum, item) => sum + item.energy, 0) / moodData.length).toFixed(1)}</div>
                      <div className="text-sm text-green-500">Avg Energy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{(moodData.reduce((sum, item) => sum + item.stress, 0) / moodData.length).toFixed(1)}</div>
                      <div className="text-sm text-orange-500">Avg Stress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{(moodData.reduce((sum, item) => sum + item.anxiety, 0) / moodData.length).toFixed(1)}</div>
                      <div className="text-sm text-blue-500">Avg Anxiety</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{(moodData.reduce((sum, item) => sum + item.sleep, 0) / moodData.length).toFixed(1)}</div>
                      <div className="text-sm text-purple-500">Avg Sleep</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Tracking Chart */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="w-6 h-6 text-rose-500" />
                  Comprehensive Mood Tracking
                </CardTitle>
                <CardDescription className="text-base">
                  Track your emotional and physical wellness patterns over {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
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
                              <div className="bg-white p-4 border rounded-xl shadow-xl">
                                <p className="font-medium text-lg">{new Date(label).toLocaleDateString()}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }} className="text-sm">
                                    {entry.name}: {entry.value}/10
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="mood" stroke="#ef4444" strokeWidth={3} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} name="Energy" />
                      <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={3} name="Stress" />
                      <Line type="monotone" dataKey="anxiety" stroke="#3b82f6" strokeWidth={3} name="Anxiety" />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} name="Sleep Quality" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            {/* Conversation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
                      <div className="text-sm text-blue-500">Total Sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{Math.round(conversationData.reduce((sum, item) => sum + item.duration, 0) / conversationData.length)}min</div>
                      <div className="text-sm text-green-500">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{avgSatisfaction.toFixed(1)}</div>
                      <div className="text-sm text-purple-500">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <MessageCircleMore className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{Math.round(conversationData.reduce((sum, item) => sum + item.topics, 0) / conversationData.length)}</div>
                      <div className="text-sm text-orange-500">Avg Topics</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversation Trends */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Conversation Activity Trends
                </CardTitle>
                <CardDescription className="text-base">
                  Your conversation patterns and engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={conversationData}>
                      <defs>
                        <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-4 border rounded-xl shadow-xl">
                                <p className="font-medium text-lg">{new Date(label).toLocaleDateString()}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }} className="text-sm">
                                    {entry.name}: {entry.value}
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
                        dataKey="sessions"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#sessionsGradient)"
                        name="Sessions"
                      />
                      <Line
                        type="monotone"
                        dataKey="duration"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Duration (min)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Topic Trends */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Brain className="w-6 h-6 text-purple-500" />
                  Topic Discussion Trends
                </CardTitle>
                <CardDescription className="text-base">
                  How your conversation topics have evolved over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicTrendsData.map((topic, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{topic.topic}</span>
                          {getTrendIcon(topic.trend)}
                        </div>
                        <Badge variant="outline" className={`${
                          topic.trend === 'improving' ? 'text-green-600 border-green-200' :
                          topic.trend === 'increasing' ? 'text-red-600 border-red-200' :
                          'text-gray-600 border-gray-200'
                        }`}>
                          {topic.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{topic.week1}</div>
                          <div className="text-gray-500">Week 1</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{topic.week2}</div>
                          <div className="text-gray-500">Week 2</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{topic.week3}</div>
                          <div className="text-gray-500">Week 3</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{topic.week4}</div>
                          <div className="text-gray-500">Week 4</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {engagementMetrics.map((metric, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{metric.metric}</h3>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span className="font-medium">
                          {typeof metric.value === 'number' && metric.value < 10 ? 
                            metric.value.toFixed(1) : 
                            metric.value
                          }
                          {metric.metric.includes('Rate') ? '%' : 
                           metric.metric.includes('Duration') ? ' min' :
                           metric.metric.includes('Days') ? ' days' : ''}
                        </span>
                      </div>
                      <Progress 
                        value={typeof metric.value === 'number' ? 
                          (metric.value / (metric.target * 1.2)) * 100 : 
                          0
                        } 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Target: {metric.target}</span>
                        <span>
                          {typeof metric.value === 'number' && metric.value > metric.target ? 
                            `+${(metric.value - metric.target).toFixed(1)} above target` :
                            `${(metric.target - metric.value).toFixed(1)} to target`
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Engagement Timeline */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-6 h-6 text-green-500" />
                  Daily Engagement Pattern
                </CardTitle>
                <CardDescription className="text-base">
                  Your interaction patterns throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversationData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 border rounded-xl shadow-xl">
                                <p className="font-medium text-lg">{new Date(label).toLocaleDateString()}</p>
                                <p className="text-blue-600">Sessions: {data.sessions}</p>
                                <p className="text-green-600">Duration: {data.duration} min</p>
                                <p className="text-purple-600">Satisfaction: {data.satisfaction}/5</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="w-6 h-6 text-purple-500" />
                    AI Response Quality
                  </CardTitle>
                  <CardDescription className="text-base">
                    How well the AI is understanding and responding to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Understanding Accuracy</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20 h-2" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Response Relevance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={88} className="w-20 h-2" />
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Emotional Intelligence</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95} className="w-20 h-2" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Helpfulness Rating</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90} className="w-20 h-2" />
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Smile className="w-6 h-6 text-yellow-500" />
                    Conversation Insights
                  </CardTitle>
                  <CardDescription className="text-base">
                    Key patterns and insights from your conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Positive Trend</span>
                      </div>
                      <p className="text-sm text-blue-700">Your mood scores have improved by 15% over the past month</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Achievement</span>
                      </div>
                      <p className="text-sm text-green-700">You've maintained consistent daily check-ins for 2 weeks</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Insight</span>
                      </div>
                      <p className="text-sm text-purple-700">Your stress levels are lowest on weekends and after exercise</p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Recommendation</span>
                      </div>
                      <p className="text-sm text-orange-700">Consider scheduling more conversations during high-stress periods</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personalization Insights */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-500 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-indigo-500" />
                  AI Personalization Analysis
                </CardTitle>
                <CardDescription className="text-base">
                  How the AI is adapting to your unique needs and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Communication Style</h3>
                    <p className="text-sm text-gray-600">The AI has learned you prefer detailed explanations and empathetic responses</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Optimal Timing</h3>
                    <p className="text-sm text-gray-600">Your most productive conversations happen in the evening between 7-9 PM</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Emotional Patterns</h3>
                    <p className="text-sm text-gray-600">The AI recognizes your stress triggers and adapts its support approach accordingly</p>
                  </div>
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