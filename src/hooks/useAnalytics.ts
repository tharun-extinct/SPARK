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

  // Dashboard metrics - NO HARDCODED VALUES
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    moodScore: 0,
    sessionsThisWeek: 0,
    totalMinutes: 0,
    streakDays: 0,
    wellnessGoals: 0,
    completedGoals: 0
  });

  // Analytics data - NO HARDCODED VALUES
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [agentUsageData, setAgentUsageData] = useState<AgentUsageData[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetrics>({
    overall: 0,
    emotional: 0,
    physical: 0,
    social: 0,
    mental: 0,
    spiritual: 0
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

      console.log('🔄 Loading analytics data for user:', currentUser?.uid);

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

      console.log('📊 Raw analytics data loaded:', {
        moodScore,
        streakData,
        conversationStats: {
          totalSessions: conversationStats.totalSessions,
          totalMinutes: conversationStats.totalMinutes,
          conversationsCount: conversationStats.conversations.length
        },
        wellnessData,
        moodDataPoints: moodChartData.length
      });

      // Update dashboard metrics with REAL data
      const newDashboardMetrics = {
        moodScore: moodScore || 0,
        sessionsThisWeek: conversationStats.totalSessions || 0,
        totalMinutes: conversationStats.totalMinutes || 0,
        streakDays: streakData.currentStreak || 0,
        wellnessGoals: 3, // This could be dynamic based on user goals
        completedGoals: Math.min(3, Math.floor((streakData.currentStreak || 0) / 7)) // Complete goals based on streak
      };

      console.log('📈 Setting dashboard metrics:', newDashboardMetrics);
      setDashboardMetrics(newDashboardMetrics);

      // Update chart data with REAL data
      console.log('📊 Setting chart data:', {
        moodDataLength: moodChartData.length,
        agentUsageLength: conversationStats.agentUsageData.length,
        conversationsLength: conversationStats.conversations.length
      });
      
      setMoodData(moodChartData);
      setAgentUsageData(conversationStats.agentUsageData);
      setWellnessMetrics(wellnessData);
      setRecentConversations(conversationStats.conversations.slice(0, 5)); // Last 5 conversations

      console.log('✅ Analytics data updated successfully');

    } catch (err) {
      console.error('❌ Error loading analytics data:', err);
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

  // Record a new conversation with Tavus integration
  const recordConversation = async (conversationData: Omit<ConversationRecord, 'id' | 'userId'>) => {
    if (!analyticsService) return;

    try {
      console.log('🔄 Recording conversation:', conversationData);
      await analyticsService.recordConversation(conversationData);
      
      console.log('✅ Conversation recorded successfully');
      
      // Reload data to reflect changes
      await loadAnalyticsData();
    } catch (err) {
      console.error('❌ Error recording conversation:', err);
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

  // Sync Tavus conversation data
  const syncTavusConversation = async (tavusConversationId: string) => {
    if (!analyticsService) return null;

    try {
      const details = await analyticsService.syncTavusConversation(tavusConversationId);
      // Reload data to reflect changes
      await loadAnalyticsData();
      return details;
    } catch (err) {
      console.error('Error syncing Tavus conversation:', err);
      setError('Failed to sync conversation data');
      return null;
    }
  };

  // Refresh all data
  const refreshData = () => {
    if (analyticsService) {
      console.log('🔄 Refreshing analytics data...');
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
    syncTavusConversation,
    refreshData,
    
    // Service
    analyticsService
  };
};

export default useAnalytics;