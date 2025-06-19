import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, MessageSquare, Target, Download, Calendar } from 'lucide-react';
import MoodChart from './MoodChart';
import ConversationInsights from './ConversationInsights';
import ProgressMetrics from './ProgressMetrics';
import SessionQuality from './SessionQuality';

// Mock data - in a real app, this would come from your backend
const mockMoodData = [
  { date: '2024-01-01', mood: 6.5, energy: 7.2, stress: 4.1 },
  { date: '2024-01-02', mood: 7.1, energy: 6.8, stress: 3.9 },
  { date: '2024-01-03', mood: 6.8, energy: 7.5, stress: 3.2 },
  { date: '2024-01-04', mood: 8.2, energy: 8.1, stress: 2.8 },
  { date: '2024-01-05', mood: 7.9, energy: 7.8, stress: 3.1 },
  { date: '2024-01-06', mood: 8.5, energy: 8.3, stress: 2.5 },
  { date: '2024-01-07', mood: 8.1, energy: 7.9, stress: 2.9 },
];

const mockTopics = [
  { topic: 'Anxiety Management', frequency: 15, sentiment: 'positive', growth: 12 },
  { topic: 'Sleep Issues', frequency: 12, sentiment: 'neutral', growth: -5 },
  { topic: 'Work Stress', frequency: 10, sentiment: 'negative', growth: 8 },
  { topic: 'Relationships', frequency: 8, sentiment: 'positive', growth: 15 },
  { topic: 'Self-Care', frequency: 7, sentiment: 'positive', growth: 20 },
  { topic: 'Goal Setting', frequency: 6, sentiment: 'positive', growth: 10 },
  { topic: 'Mindfulness', frequency: 5, sentiment: 'positive', growth: 25 },
  { topic: 'Exercise', frequency: 4, sentiment: 'neutral', growth: 5 },
];

const mockMilestones = [
  {
    id: '1',
    title: 'Daily Check-ins',
    description: 'Complete daily mood and wellness check-ins',
    progress: 6,
    target: 7,
    category: 'wellness' as const,
    completed: false
  },
  {
    id: '2',
    title: 'Anxiety Coping Skills',
    description: 'Learn and practice 5 different anxiety management techniques',
    progress: 5,
    target: 5,
    category: 'wellness' as const,
    completed: true,
    completedDate: '2024-01-05'
  },
  {
    id: '3',
    title: 'Learning Streak',
    description: 'Maintain a 30-day learning conversation streak',
    progress: 18,
    target: 30,
    category: 'learning' as const,
    completed: false
  }
];

const mockAchievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Completed your first AI conversation',
    icon: '🎯',
    unlockedDate: '2024-01-01',
    rarity: 'common' as const
  },
  {
    id: '2',
    title: 'Mood Master',
    description: 'Tracked mood for 7 consecutive days',
    icon: '😊',
    unlockedDate: '2024-01-07',
    rarity: 'rare' as const
  },
  {
    id: '3',
    title: 'Wellness Warrior',
    description: 'Completed 10 wellness-focused conversations',
    icon: '💪',
    unlockedDate: '2024-01-06',
    rarity: 'epic' as const
  }
];

const mockSessions = [
  { date: '2024-01-01', quality: 4.2, engagement: 4.5, satisfaction: 4.1, duration: 25, agentType: 'Mental Health' },
  { date: '2024-01-02', quality: 4.6, engagement: 4.8, satisfaction: 4.4, duration: 32, agentType: 'Tutor' },
  { date: '2024-01-03', quality: 4.1, engagement: 4.3, satisfaction: 4.0, duration: 28, agentType: 'Doctor' },
  { date: '2024-01-04', quality: 4.8, engagement: 4.9, satisfaction: 4.7, duration: 35, agentType: 'Mental Health' },
  { date: '2024-01-05', quality: 4.5, engagement: 4.6, satisfaction: 4.3, duration: 30, agentType: 'Tutor' },
  { date: '2024-01-06', quality: 4.9, engagement: 5.0, satisfaction: 4.8, duration: 40, agentType: 'Mental Health' },
  { date: '2024-01-07', quality: 4.7, engagement: 4.8, satisfaction: 4.6, duration: 33, agentType: 'Doctor' },
];

const mockQualityMetrics = {
  empathy: 4.6,
  clarity: 4.3,
  helpfulness: 4.5,
  responsiveness: 4.7,
  accuracy: 4.2,
  engagement: 4.8
};

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('mood');

  const handleExportData = () => {
    // In a real app, this would generate and download a report
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            AI Conversation Analytics
          </h2>
          <p className="text-muted-foreground">
            Insights into your wellness journey and AI interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Mood Tracking
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversation Insights
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Progress Metrics
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Session Quality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-6">
          <MoodChart data={mockMoodData} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <ConversationInsights 
            topics={mockTopics}
            totalSessions={42}
            avgDuration={31}
            totalMinutes={1302}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressMetrics 
            milestones={mockMilestones}
            achievements={mockAchievements}
            overallProgress={73}
            weeklyGoals={5}
            monthlyGoals={18}
          />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <SessionQuality 
            sessions={mockSessions}
            qualityMetrics={mockQualityMetrics}
            averageRating={4.5}
            totalFeedback={127}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;