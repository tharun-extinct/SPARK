import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { getTavusConversationDetails, waitForTranscript, TavusConversationDetails } from '@/lib/tavus';

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
  // Tavus-specific fields
  tavusConversationId?: string;
  tavusRecordingUrl?: string;
  tavusTranscript?: string;
  tavusMetadata?: any;
  tavusShutdownReason?: string;
  tavusPerceptionAnalysis?: any;
  tavusReplicaJoinedTime?: string;
  tavusEvents?: any[];
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

  // Record a new conversation session with enhanced Tavus integration
  async recordConversation(data: Omit<ConversationRecord, 'id' | 'userId'>): Promise<void> {
    try {
      const conversationRef = doc(collection(db, 'conversations'));
      
      // Prepare the base conversation data
      const conversationData = {
        ...data,
        userId: this.userId,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: Timestamp.fromDate(data.endTime),
        createdAt: Timestamp.now()
      };

      // If we have a Tavus conversation ID, fetch comprehensive details
      if (data.tavusConversationId) {
        try {
          console.log('🔄 Fetching comprehensive Tavus conversation details for ID:', data.tavusConversationId);
          
          // First, try to get immediate details
          let tavusDetails = await getTavusConversationDetails(data.tavusConversationId, true);
          
          // If no transcript yet, wait for it to be processed
          if (!tavusDetails.transcript || tavusDetails.transcript.trim() === '') {
            console.log('⏳ Transcript not ready, waiting for processing...');
            const detailsWithTranscript = await waitForTranscript(data.tavusConversationId, 6, 10000); // Wait up to 1 minute
            if (detailsWithTranscript) {
              tavusDetails = detailsWithTranscript;
            }
          }
          
          // Merge comprehensive Tavus data with our conversation record
          conversationData.tavusRecordingUrl = tavusDetails.recording_url;
          conversationData.tavusTranscript = tavusDetails.transcript;
          conversationData.tavusMetadata = tavusDetails.metadata;
          conversationData.tavusShutdownReason = tavusDetails.shutdown_reason;
          conversationData.tavusPerceptionAnalysis = tavusDetails.perception_analysis;
          conversationData.tavusReplicaJoinedTime = tavusDetails.replica_joined_time;
          conversationData.tavusEvents = tavusDetails.events;
          
          // Update duration if Tavus provides more accurate data
          if (tavusDetails.duration && tavusDetails.duration > 0) {
            conversationData.duration = Math.round(tavusDetails.duration / 60); // Convert seconds to minutes
          }
          
          // Update start/end times if Tavus provides more accurate data
          if (tavusDetails.start_time) {
            conversationData.startTime = Timestamp.fromDate(new Date(tavusDetails.start_time));
          }
          if (tavusDetails.end_time) {
            conversationData.endTime = Timestamp.fromDate(new Date(tavusDetails.end_time));
          }
          
          console.log('✅ Successfully enriched conversation with comprehensive Tavus data');
          console.log('📝 Transcript length:', tavusDetails.transcript?.length || 0);
          console.log('🧠 Perception analysis available:', !!tavusDetails.perception_analysis);
          console.log('🛑 Shutdown reason:', tavusDetails.shutdown_reason);
        } catch (tavusError) {
          console.warn('⚠️ Failed to fetch Tavus conversation details, proceeding without:', tavusError);
          // Continue saving the conversation even if Tavus API fails
        }
      }

      await setDoc(conversationRef, conversationData);
      console.log('💾 Conversation saved to Firebase with ID:', conversationRef.id);

      // Update streak after recording conversation
      await this.updateStreak();
    } catch (error) {
      console.error('❌ Error recording conversation:', error);
      throw error;
    }
  }

  // Store Tavus conversation ID for later retrieval
  async storeTavusConversationId(conversationId: string, agentType: string): Promise<string> {
    try {
      const tavusRef = doc(collection(db, 'tavusConversations'));
      await setDoc(tavusRef, {
        userId: this.userId,
        tavusConversationId: conversationId,
        agentType,
        createdAt: Timestamp.now(),
        status: 'active'
      });
      
      console.log('💾 Stored Tavus conversation ID:', conversationId);
      return tavusRef.id;
    } catch (error) {
      console.error('❌ Error storing Tavus conversation ID:', error);
      throw error;
    }
  }

  // Enhanced method to sync and update Tavus conversation data
  async syncTavusConversation(tavusConversationId: string, waitForTranscriptFlag: boolean = true): Promise<TavusConversationDetails | null> {
    try {
      console.log('🔄 Syncing Tavus conversation:', tavusConversationId);
      
      let details: TavusConversationDetails;
      
      if (waitForTranscriptFlag) {
        // Wait for transcript to be ready
        const detailsWithTranscript = await waitForTranscript(tavusConversationId, 6, 10000);
        if (detailsWithTranscript) {
          details = detailsWithTranscript;
        } else {
          // Fallback to immediate fetch if transcript wait fails
          details = await getTavusConversationDetails(tavusConversationId, true);
        }
      } else {
        details = await getTavusConversationDetails(tavusConversationId, true);
      }
      
      // Update the stored conversation record with comprehensive Tavus data
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId),
        where('tavusConversationId', '==', tavusConversationId)
      );

      const snapshot = await getDocs(conversationsQuery);
      
      if (!snapshot.empty) {
        const conversationDoc = snapshot.docs[0];
        const updateData: any = {
          tavusRecordingUrl: details.recording_url,
          tavusTranscript: details.transcript,
          tavusMetadata: details.metadata,
          tavusShutdownReason: details.shutdown_reason,
          tavusPerceptionAnalysis: details.perception_analysis,
          tavusReplicaJoinedTime: details.replica_joined_time,
          tavusEvents: details.events,
          lastSyncedAt: Timestamp.now()
        };

        // Update duration if Tavus provides more accurate data
        if (details.duration && details.duration > 0) {
          updateData.duration = Math.round(details.duration / 60);
        }

        // Update start/end times if available
        if (details.start_time) {
          updateData.startTime = Timestamp.fromDate(new Date(details.start_time));
        }
        if (details.end_time) {
          updateData.endTime = Timestamp.fromDate(new Date(details.end_time));
        }

        await setDoc(conversationDoc.ref, updateData, { merge: true });
        console.log('✅ Successfully synced comprehensive Tavus conversation data');
      }

      return details;
    } catch (error) {
      console.error('❌ Error syncing Tavus conversation:', error);
      return null;
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
        const data = streakDoc.data() as StreakData;
        console.log('📈 Retrieved streak data:', data);
        return data;
      }
      
      console.log('📈 No streak data found, returning defaults');
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
      // Try to get mood entries first
      const moodQuery = query(
        collection(db, 'moodEntries'),
        where('userId', '==', this.userId)
      );

      const moodSnapshot = await getDocs(moodQuery);
      
      if (moodSnapshot.empty) {
        console.log('📊 No mood entries found');
        return 0; // Return 0 instead of hardcoded 7.0
      }

      const moodEntries: number[] = [];
      moodSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.mood && typeof data.mood === 'number') {
          moodEntries.push(data.mood);
        }
      });

      if (moodEntries.length === 0) {
        console.log('📊 No valid mood scores found');
        return 0; // Return 0 instead of hardcoded 7.0
      }

      // Calculate simple average of all mood entries
      const totalMood = moodEntries.reduce((sum, mood) => sum + mood, 0);
      const avgMood = Math.round((totalMood / moodEntries.length) * 10) / 10;
      console.log('📊 Calculated mood score:', avgMood, 'from', moodEntries.length, 'entries');
      return avgMood;
    } catch (error) {
      console.error('Error calculating mood score:', error);
      return 0; // Return 0 instead of hardcoded 7.0
    }
  }

  // Get conversation statistics - ENHANCED WITH REAL DATA
  async getConversationStats(timeRange: 'week' | 'month' | 'quarter' = 'week') {
    try {
      console.log('📊 Getting conversation stats for timeRange:', timeRange);
      
      // Use the simplest possible query - just get user's conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId)
      );

      const snapshot = await getDocs(conversationsQuery);
      
      console.log('📊 Found', snapshot.size, 'total conversations for user');
      
      if (snapshot.empty) {
        console.log('📊 No conversations found, returning empty data');
        // Return default empty data
        return {
          totalSessions: 0,
          totalMinutes: 0,
          avgSatisfaction: 0,
          agentUsageData: [
            { name: 'Mental Health', value: 0, color: '#ef4444', percentage: 0 },
            { name: 'Learning', value: 0, color: '#3b82f6', percentage: 0 },
            { name: 'Wellness', value: 0, color: '#10b981', percentage: 0 }
          ],
          conversations: []
        };
      }

      const allConversations: ConversationRecord[] = [];

      // Process all conversations
      snapshot.forEach(doc => {
        const data = doc.data();
        const startTime = data.startTime ? data.startTime.toDate() : new Date();
        
        allConversations.push({
          id: doc.id,
          userId: data.userId,
          agentType: data.agentType || 'psychiatrist',
          startTime: startTime,
          endTime: data.endTime ? data.endTime.toDate() : new Date(),
          duration: data.duration || 30,
          moodBefore: data.moodBefore,
          moodAfter: data.moodAfter,
          topics: data.topics || [],
          satisfaction: data.satisfaction || 4,
          notes: data.notes,
          tavusConversationId: data.tavusConversationId,
          tavusRecordingUrl: data.tavusRecordingUrl,
          tavusTranscript: data.tavusTranscript,
          tavusMetadata: data.tavusMetadata,
          tavusShutdownReason: data.tavusShutdownReason,
          tavusPerceptionAnalysis: data.tavusPerceptionAnalysis,
          tavusReplicaJoinedTime: data.tavusReplicaJoinedTime,
          tavusEvents: data.tavusEvents
        });
      });

      console.log('📊 Processed', allConversations.length, 'conversations');

      // Filter by time range in memory
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

      const conversations = allConversations.filter(conv => conv.startTime >= startDate);
      console.log('📊 Filtered to', conversations.length, 'conversations in timeRange:', timeRange);

      // Calculate statistics
      const totalSessions = conversations.length;
      const totalMinutes = conversations.reduce((sum, conv) => sum + conv.duration, 0);
      const avgSatisfaction = conversations.length > 0 
        ? conversations.reduce((sum, conv) => sum + (conv.satisfaction || 4), 0) / conversations.length 
        : 0; // Return 0 instead of hardcoded 4.0

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

      // Sort conversations by date and return recent ones
      const sortedConversations = conversations
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 10);

      const result = {
        totalSessions,
        totalMinutes,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        agentUsageData,
        conversations: sortedConversations
      };

      console.log('📊 Final conversation stats:', result);
      return result;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      // Return default data instead of throwing
      return {
        totalSessions: 0,
        totalMinutes: 0,
        avgSatisfaction: 0,
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
      
      // Only calculate if we have actual data
      if (moodScore === 0 && stats.totalSessions === 0) {
        console.log('📊 No data for wellness metrics, returning zeros');
        return {
          overall: 0,
          emotional: 0,
          physical: 0,
          social: 0,
          mental: 0,
          spiritual: 0
        };
      }
      
      // Base calculations on mood score and conversation patterns
      const emotional = moodScore;
      const physical = Math.min(10, moodScore + (stats.agentUsageData.find(a => a.name === 'Wellness')?.percentage || 0) / 10);
      const social = Math.min(10, moodScore + (stats.totalSessions > 10 ? 1 : 0));
      const mental = Math.min(10, moodScore + (stats.agentUsageData.find(a => a.name === 'Learning')?.percentage || 0) / 10);
      const spiritual = Math.min(10, moodScore * 0.9); // Slightly lower baseline
      
      const overall = (emotional + physical + social + mental + spiritual) / 5;

      const result = {
        overall: Math.round(overall * 10) / 10,
        emotional: Math.round(emotional * 10) / 10,
        physical: Math.round(physical * 10) / 10,
        social: Math.round(social * 10) / 10,
        mental: Math.round(mental * 10) / 10,
        spiritual: Math.round(spiritual * 10) / 10
      };

      console.log('📊 Calculated wellness metrics:', result);
      return result;
    } catch (error) {
      console.error('Error calculating wellness metrics:', error);
      return {
        overall: 0,
        emotional: 0,
        physical: 0,
        social: 0,
        mental: 0,
        spiritual: 0
      };
    }
  }

  // Get mood data for charts - ENHANCED WITH REAL DATA
  async getMoodData(days: number = 7): Promise<MoodEntry[]> {
    try {
      console.log('📊 Getting mood data for', days, 'days');
      
      // Use the simplest possible query
      const moodQuery = query(
        collection(db, 'moodEntries'),
        where('userId', '==', this.userId)
      );

      const snapshot = await getDocs(moodQuery);
      
      if (snapshot.empty) {
        console.log('📊 No mood entries found, returning empty array');
        // Return empty array instead of default data
        return [];
      }

      const allMoodData: MoodEntry[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const entryDate = data.date ? data.date.toDate() : data.createdAt?.toDate() || new Date();
        
        allMoodData.push({
          date: entryDate.toISOString().split('T')[0],
          mood: data.mood || 0,
          energy: data.energy || 0,
          stress: data.stress || 0,
          anxiety: data.anxiety || 0,
          sleep: data.sleep || 0
        });
      });

      // Filter and sort in memory
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentMoodData = allMoodData
        .filter(entry => new Date(entry.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('📊 Found', recentMoodData.length, 'mood entries in date range');
      return recentMoodData;
    } catch (error) {
      console.error('Error getting mood data:', error);
      return []; // Return empty array instead of default data
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