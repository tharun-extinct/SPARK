import { useState, useEffect } from 'react';
import { useAuth } from '@/services/firebaseAuth';
import AnalyticsService, { ConversationRecord, MoodEntry, StreakData, WellnessMetrics } from '@/services/analyticsService';

export interface DashboardMetrics {
  moodScore: number;
  sessionsThisWeek: number;
  totalMinutes: number;
  streakDays: number;
  wellnessGoals: number;
  completedGoals: number;
}

export interface AgentUsageData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export const useAnalytics = () => {
  const { currentUser } = useAuth();
  const [analyticsService, setAnalyticsService] = useState<AnalyticsService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard metrics
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    moodScore: 7.0,
    sessionsThisWeek: 0,
    totalMinutes: 0,
    streakDays: 0,
    wellnessGoals: 3,
    completedGoals: 2
  });

  // Analytics data
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [agentUsageData, setAgentUsageData] = useState<AgentUsageData[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetrics>({
    overall: 7.0,
    emotional: 7.0,
    physical: 7.0,
    social: 7.0,
    mental: 7.0,
    spiritual: 7.0
  });
  const [recentConversations, setRecentConversations] = useState<ConversationRecord[]>([]);

  // Initialize analytics service when user changes
  useEffect(() => {
    if (currentUser) {
      const service = new AnalyticsService(currentUser.uid);
      setAnalyticsService(service);
    } else {
      setAnalyticsService(null);
    }
  }, [currentUser]);

  // Load all analytics data
  const loadAnalyticsData = async () => {
    if (!analyticsService) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        moodScore,
        streakData,
        conversationStats,
        wellnessData,
        moodChartData
      ] = await Promise.all([
        analyticsService.calculateMoodScore(),
        analyticsService.getStreak(),
        analyticsService.getConversationStats('week'),
        analyticsService.calculateWellnessMetrics(),
        analyticsService.getMoodData(7)
      ]);

      // Update dashboard metrics
      setDashboardMetrics({
        moodScore,
        sessionsThisWeek: conversationStats.totalSessions,
        totalMinutes: conversationStats.totalMinutes,
        streakDays: streakData.currentStreak,
        wellnessGoals: 3, // This could be dynamic based on user goals
        completedGoals: Math.min(3, Math.floor(streakData.currentStreak / 7)) // Complete goals based on streak
      });

      // Update chart data
      setMoodData(moodChartData);
      setAgentUsageData(conversationStats.agentUsageData);
      setWellnessMetrics(wellnessData);
      setRecentConversations(conversationStats.conversations.slice(0, 5)); // Last 5 conversations

    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when service is available
  useEffect(() => {
    if (analyticsService) {
      loadAnalyticsData();
    }
  }, [analyticsService]);

  // Record a new conversation
  const recordConversation = async (conversationData: Omit<ConversationRecord, 'id' | 'userId'>) => {
    if (!analyticsService) return;

    try {
      await analyticsService.recordConversation(conversationData);
      // Reload data to reflect changes
      await loadAnalyticsData();
    } catch (err) {
      console.error('Error recording conversation:', err);
      setError('Failed to record conversation');
    }
  };

  // Record mood entry
  const recordMoodEntry = async (moodEntry: Omit<MoodEntry, 'date'>) => {
    if (!analyticsService) return;

    try {
      await analyticsService.recordMoodEntry(moodEntry);
      // Reload data to reflect changes
      await loadAnalyticsData();
    } catch (err) {
      console.error('Error recording mood entry:', err);
      setError('Failed to record mood entry');
    }
  };

  // Refresh all data
  const refreshData = () => {
    if (analyticsService) {
      loadAnalyticsData();
    }
  };

  return {
    // Data
    dashboardMetrics,
    moodData,
    agentUsageData,
    wellnessMetrics,
    recentConversations,
    
    // State
    isLoading,
    error,
    
    // Actions
    recordConversation,
    recordMoodEntry,
    refreshData,
    
    // Service
    analyticsService
  };
};

export default useAnalytics;