import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Heart, 
  Brain, 
  Activity, 
  MessageCircle, 
  Clock, 
  Filter, 
  SlidersHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/services/firebaseAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/components/ui/use-toast';

const AllSessions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeTab, setActiveTab] = useState('all');
  
  // Get analytics data
  const { 
    recentConversations: allConversations, 
    refreshData,
    isLoading: analyticsLoading
  } = useAnalytics();

  useEffect(() => {
    setIsLoading(analyticsLoading);
  }, [analyticsLoading]);

  // Agent type mapping
  const agentMap = {
    psychiatrist: 'Dr. Anna',
    default: 'Dr. Anna',
    tutor: 'Alex',
    doctor: 'Dr. James'
  };

  // Session type mapping
  const typeMap = {
    psychiatrist: 'Mental Health',
    default: 'Mental Health',
    tutor: 'Learning',
    doctor: 'Wellness'
  };

  // Color mapping
  const colorMap: Record<string, string> = {
    psychiatrist: "bg-gradient-to-r from-pink-500 to-rose-500",
    default: "bg-gradient-to-r from-pink-500 to-rose-500",
    tutor: "bg-gradient-to-r from-blue-500 to-cyan-500",
    doctor: "bg-gradient-to-r from-green-500 to-emerald-500"
  };

  // Filter conversations based on search, time range, and agent type
  const filteredConversations = allConversations.filter(conv => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const agentName = agentMap[conv.agentType as keyof typeof agentMap] || '';
    const sessionType = typeMap[conv.agentType as keyof typeof typeMap] || '';
    
    const matchesSearch = searchTerm === '' || 
      agentName.toLowerCase().includes(searchLower) ||
      sessionType.toLowerCase().includes(searchLower) ||
      (conv.topics && conv.topics.some(topic => topic.toLowerCase().includes(searchLower)));
    
    // Time range filter
    let matchesTimeRange = true;
    const now = new Date();
    
    if (timeRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchesTimeRange = conv.startTime >= today;
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      matchesTimeRange = conv.startTime >= weekAgo;
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      matchesTimeRange = conv.startTime >= monthAgo;
    }
    
    // Agent filter
    const matchesAgentFilter = agentFilter === 'all' || conv.agentType === agentFilter;
    
    // Tab filter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'mental-health' && conv.agentType === 'psychiatrist') ||
      (activeTab === 'learning' && conv.agentType === 'tutor') ||
      (activeTab === 'wellness' && conv.agentType === 'doctor');
    
    return matchesSearch && matchesTimeRange && matchesAgentFilter && matchesTab;
  });

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return b.startTime.getTime() - a.startTime.getTime();
    } else if (sortBy === 'date-asc') {
      return a.startTime.getTime() - b.startTime.getTime();
    } else if (sortBy === 'duration-desc') {
      return b.duration - a.duration;
    } else if (sortBy === 'duration-asc') {
      return a.duration - b.duration;
    } else if (sortBy === 'mood-desc') {
      return (b.moodAfter || 0) - (a.moodAfter || 0);
    } else if (sortBy === 'mood-asc') {
      return (a.moodAfter || 0) - (b.moodAfter || 0);
    }
    return 0;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + 
        `, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    refreshData();
    toast({
      title: "Refreshing Data",
      description: "Updating your session history..."
    });
  };

  // Handle export
  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Agent', 'Type', 'Duration (min)', 'Mood Score', 'Topics'];
    const rows = sortedConversations.map(conv => [
      conv.startTime.toLocaleDateString(),
      agentMap[conv.agentType as keyof typeof agentMap] || '',
      typeMap[conv.agentType as keyof typeof typeMap] || '',
      conv.duration.toString(),
      (conv.moodAfter || 'N/A').toString(),
      (conv.topics || []).join(', ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spark-sessions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Your session history has been downloaded as a CSV file."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                All Sessions
              </h1>
              <p className="text-muted-foreground">
                View and manage your conversation history
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={sortedConversations.length === 0}
              className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Time Range */}
              <div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Agent Filter */}
              <div>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Agent Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="psychiatrist">Dr. Anna</SelectItem>
                    <SelectItem value="tutor">Alex</SelectItem>
                    <SelectItem value="doctor">Dr. James</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort By */}
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="duration-desc">Longest First</SelectItem>
                    <SelectItem value="duration-asc">Shortest First</SelectItem>
                    <SelectItem value="mood-desc">Highest Mood First</SelectItem>
                    <SelectItem value="mood-asc">Lowest Mood First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              All Sessions
            </TabsTrigger>
            <TabsTrigger value="mental-health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Mental Health
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Wellness
            </TabsTrigger>
          </TabsList>
          
          {/* Content for all tabs */}
          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {activeTab === 'all' ? 'All Sessions' : 
                     activeTab === 'mental-health' ? 'Mental Health Sessions' :
                     activeTab === 'learning' ? 'Learning Sessions' : 'Wellness Sessions'}
                  </CardTitle>
                  <Badge variant="outline">
                    {sortedConversations.length} {sortedConversations.length === 1 ? 'session' : 'sessions'}
                  </Badge>
                </div>
                <CardDescription>
                  {activeTab === 'all' ? 'All your conversations with AI assistants' : 
                   activeTab === 'mental-health' ? 'Your conversations with Dr. Anna' :
                   activeTab === 'learning' ? 'Your learning sessions with Alex' : 'Your wellness check-ins with Dr. James'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-muted-foreground">Loading your sessions...</p>
                    </div>
                  </div>
                ) : sortedConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || timeRange !== 'all' || agentFilter !== 'all' 
                        ? "Try adjusting your filters to see more results" 
                        : "Start a conversation to see your sessions here"}
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                      Return to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedConversations.map((session) => (
                      <div 
                        key={session.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${colorMap[session.agentType] || colorMap.default} flex items-center justify-center text-white shadow-md`}>
                            {session.agentType === 'psychiatrist' ? <Heart className="h-5 w-5" /> : 
                             session.agentType === 'tutor' ? <Brain className="h-5 w-5" /> : 
                             <Activity className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {agentMap[session.agentType as keyof typeof agentMap] || 'AI Assistant'}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {typeMap[session.agentType as keyof typeof typeMap] || 'Session'}
                              </Badge>
                              {session.moodAfter && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    session.moodAfter >= 7 ? 'bg-green-50 text-green-700 border-green-200' : 
                                    session.moodAfter >= 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  Mood: {session.moodAfter}/10
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(session.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{session.duration} minutes</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Navigate to a detailed view of this session
                              // This would be implemented in a future feature
                              toast({
                                title: "Coming Soon",
                                description: "Session details view will be available in a future update."
                              });
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AllSessions;