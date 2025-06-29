import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface ConversationRecord {
  id: string;
  userId: string;
  agentType: 'psychiatrist' | 'tutor' | 'doctor';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  moodBefore?: number;
  moodAfter?: number;
  topics: string[];
  satisfaction?: number;
  notes?: string;
}

export interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  sleep: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface WellnessMetrics {
  overall: number;
  emotional: number;
  physical: number;
  social: number;
  mental: number;
  spiritual: number;
}

export class AnalyticsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Record a new conversation session
  async recordConversation(data: Omit<ConversationRecord, 'id' | 'userId'>): Promise<void> {
    try {
      const conversationRef = doc(collection(db, 'conversations'));
      await setDoc(conversationRef, {
        ...data,
        userId: this.userId,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: Timestamp.fromDate(data.endTime),
        createdAt: Timestamp.now()
      });

      // Update streak after recording conversation
      await this.updateStreak();
    } catch (error) {
      console.error('Error recording conversation:', error);
      throw error;
    }
  }

  // Calculate and update user streak
  async updateStreak(): Promise<StreakData> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const userStreakRef = doc(db, 'userStreaks', this.userId);
      
      // Get current streak data
      const streakDoc = await getDoc(userStreakRef);
      let streakData: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: ''
      };

      if (streakDoc.exists()) {
        streakData = streakDoc.data() as StreakData;
      }

      // Check if user was active yesterday or today
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streakData.lastActiveDate === today) {
        // Already counted today, no change needed
        return streakData;
      } else if (streakData.lastActiveDate === yesterdayStr) {
        // Continuing streak
        streakData.currentStreak += 1;
        streakData.lastActiveDate = today;
      } else if (streakData.lastActiveDate === '') {
        // First time user
        streakData.currentStreak = 1;
        streakData.lastActiveDate = today;
      } else {
        // Streak broken, start new
        streakData.currentStreak = 1;
        streakData.lastActiveDate = today;
      }

      // Update longest streak if current is higher
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }

      // Save updated streak
      await setDoc(userStreakRef, streakData);
      return streakData;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Get user's current streak
  async getStreak(): Promise<StreakData> {
    try {
      const userStreakRef = doc(db, 'userStreaks', this.userId);
      const streakDoc = await getDoc(userStreakRef);
      
      if (streakDoc.exists()) {
        return streakDoc.data() as StreakData;
      }
      
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: ''
      };
    } catch (error) {
      console.error('Error getting streak:', error);
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
    }
  }

  // Calculate mood score from recent conversations and mood entries
  async calculateMoodScore(): Promise<number> {
    try {
      // Get recent mood entries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const moodQuery = query(
        collection(db, 'moodEntries'),
        where('userId', '==', this.userId),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('date', 'desc'),
        limit(7)
      );

      const moodSnapshot = await getDocs(moodQuery);
      const moodEntries: MoodEntry[] = [];

      moodSnapshot.forEach(doc => {
        const data = doc.data();
        moodEntries.push({
          date: data.date.toDate().toISOString().split('T')[0],
          mood: data.mood || 5,
          energy: data.energy || 5,
          stress: data.stress || 5,
          anxiety: data.anxiety || 5,
          sleep: data.sleep || 5
        });
      });

      if (moodEntries.length === 0) {
        return 7.0; // Default neutral mood
      }

      // Calculate weighted average (recent entries have more weight)
      let totalScore = 0;
      let totalWeight = 0;

      moodEntries.forEach((entry, index) => {
        const weight = moodEntries.length - index; // More recent = higher weight
        const entryScore = (entry.mood + entry.energy + (10 - entry.stress) + (10 - entry.anxiety) + entry.sleep) / 5;
        totalScore += entryScore * weight;
        totalWeight += weight;
      });

      return Math.round((totalScore / totalWeight) * 10) / 10;
    } catch (error) {
      console.error('Error calculating mood score:', error);
      return 7.0;
    }
  }

  // Get conversation statistics
  async getConversationStats(timeRange: 'week' | 'month' | 'quarter' = 'week') {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId),
        where('startTime', '>=', Timestamp.fromDate(startDate)),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(conversationsQuery);
      const conversations: ConversationRecord[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          userId: data.userId,
          agentType: data.agentType,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          duration: data.duration,
          moodBefore: data.moodBefore,
          moodAfter: data.moodAfter,
          topics: data.topics || [],
          satisfaction: data.satisfaction,
          notes: data.notes
        });
      });

      // Calculate statistics
      const totalSessions = conversations.length;
      const totalMinutes = conversations.reduce((sum, conv) => sum + conv.duration, 0);
      const avgSatisfaction = conversations.length > 0 
        ? conversations.reduce((sum, conv) => sum + (conv.satisfaction || 4), 0) / conversations.length 
        : 4.0;

      // Agent usage breakdown
      const agentUsage = conversations.reduce((acc, conv) => {
        acc[conv.agentType] = (acc[conv.agentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const agentUsageData = [
        { 
          name: 'Mental Health', 
          value: agentUsage.psychiatrist || 0, 
          color: '#ef4444',
          percentage: totalSessions > 0 ? Math.round((agentUsage.psychiatrist || 0) / totalSessions * 100) : 0
        },
        { 
          name: 'Learning', 
          value: agentUsage.tutor || 0, 
          color: '#3b82f6',
          percentage: totalSessions > 0 ? Math.round((agentUsage.tutor || 0) / totalSessions * 100) : 0
        },
        { 
          name: 'Wellness', 
          value: agentUsage.doctor || 0, 
          color: '#10b981',
          percentage: totalSessions > 0 ? Math.round((agentUsage.doctor || 0) / totalSessions * 100) : 0
        }
      ];

      return {
        totalSessions,
        totalMinutes,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        agentUsageData,
        conversations
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        avgSatisfaction: 4.0,
        agentUsageData: [
          { name: 'Mental Health', value: 0, color: '#ef4444', percentage: 0 },
          { name: 'Learning', value: 0, color: '#3b82f6', percentage: 0 },
          { name: 'Wellness', value: 0, color: '#10b981', percentage: 0 }
        ],
        conversations: []
      };
    }
  }

  // Calculate wellness metrics from conversation data and mood entries
  async calculateWellnessMetrics(): Promise<WellnessMetrics> {
    try {
      const moodScore = await this.calculateMoodScore();
      const stats = await this.getConversationStats('month');
      
      // Base calculations on mood score and conversation patterns
      const emotional = moodScore;
      const physical = Math.min(10, moodScore + (stats.agentUsageData.find(a => a.name === 'Wellness')?.percentage || 0) / 10);
      const social = Math.min(10, moodScore + (stats.totalSessions > 10 ? 1 : 0));
      const mental = Math.min(10, moodScore + (stats.agentUsageData.find(a => a.name === 'Learning')?.percentage || 0) / 10);
      const spiritual = Math.min(10, moodScore * 0.9); // Slightly lower baseline
      
      const overall = (emotional + physical + social + mental + spiritual) / 5;

      return {
        overall: Math.round(overall * 10) / 10,
        emotional: Math.round(emotional * 10) / 10,
        physical: Math.round(physical * 10) / 10,
        social: Math.round(social * 10) / 10,
        mental: Math.round(mental * 10) / 10,
        spiritual: Math.round(spiritual * 10) / 10
      };
    } catch (error) {
      console.error('Error calculating wellness metrics:', error);
      return {
        overall: 7.0,
        emotional: 7.0,
        physical: 7.0,
        social: 7.0,
        mental: 7.0,
        spiritual: 7.0
      };
    }
  }

  // Get mood data for charts
  async getMoodData(days: number = 7): Promise<MoodEntry[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodQuery = query(
        collection(db, 'moodEntries'),
        where('userId', '==', this.userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(moodQuery);
      const moodData: MoodEntry[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        moodData.push({
          date: data.date.toDate().toISOString().split('T')[0],
          mood: data.mood || 5,
          energy: data.energy || 5,
          stress: data.stress || 5,
          anxiety: data.anxiety || 5,
          sleep: data.sleep || 5
        });
      });

      // Fill in missing days with neutral values
      const filledData: MoodEntry[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existingEntry = moodData.find(entry => entry.date === dateStr);
        if (existingEntry) {
          filledData.push(existingEntry);
        } else {
          filledData.push({
            date: dateStr,
            mood: 7,
            energy: 7,
            stress: 3,
            anxiety: 3,
            sleep: 7
          });
        }
      }

      return filledData;
    } catch (error) {
      console.error('Error getting mood data:', error);
      return [];
    }
  }

  // Record mood entry
  async recordMoodEntry(moodData: Omit<MoodEntry, 'date'>): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const moodRef = doc(db, 'moodEntries', `${this.userId}_${today}`);
      
      await setDoc(moodRef, {
        ...moodData,
        userId: this.userId,
        date: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error recording mood entry:', error);
      throw error;
    }
  }
}

export default AnalyticsService;