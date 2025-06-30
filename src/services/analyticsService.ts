import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp, orderBy, limit, addDoc } from 'firebase/firestore';
import { getTavusConversationDetails, TavusConversationDetails } from '@/lib/tavus';

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
  tavusPerceptionAnalysis?: string; // Added field for perception analysis
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
    console.log('🔧 AnalyticsService initialized for user:', userId);
  }

  // Record a new conversation session with Tavus integration
  async recordConversation(data: Omit<ConversationRecord, 'id' | 'userId'>): Promise<string> {
    try {
      console.log('🔄 Recording conversation to Firestore for user:', this.userId);
      console.log('📊 Input conversation data:', data);
      
      // Use addDoc instead of doc+setDoc to let Firestore generate the ID
      const conversationsCollection = collection(db, 'conversations');
      
      // Prepare the base conversation data
      const conversationData: any = {
        ...data,
        userId: this.userId,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: Timestamp.fromDate(data.endTime),
        createdAt: Timestamp.now()
      };

      console.log('💾 Saving conversation data to Firestore:', {
        userId: conversationData.userId,
        agentType: conversationData.agentType,
        duration: conversationData.duration,
        tavusConversationId: conversationData.tavusConversationId,
        topics: conversationData.topics,
        startTime: conversationData.startTime,
        endTime: conversationData.endTime
      });

      // If we have a Tavus conversation ID, fetch additional details
      if (data.tavusConversationId) {
        try {
          console.log('🔄 Fetching Tavus conversation details for ID:', data.tavusConversationId);
          const tavusDetails = await getTavusConversationDetails(data.tavusConversationId);
          
          // Merge Tavus data with our conversation record - only add fields that exist
          if (tavusDetails.recording_url) {
            conversationData.tavusRecordingUrl = tavusDetails.recording_url;
          }
          
          if (tavusDetails.transcript) {
            conversationData.tavusTranscript = tavusDetails.transcript;
          }
          
          if (tavusDetails.metadata) {
            conversationData.tavusMetadata = tavusDetails.metadata;
          }
          
          // Store perception analysis if available
          if (tavusDetails.perception_analysis) {
            conversationData.tavusPerceptionAnalysis = tavusDetails.perception_analysis;
            
            // Calculate mood after based on perception analysis
            const moodAfter = this.calculateMoodFromPerception(tavusDetails.perception_analysis);
            if (moodAfter > 0) {
              conversationData.moodAfter = moodAfter;
            }
          }
          
          // Update duration if Tavus provides more accurate data
          if (tavusDetails.duration && tavusDetails.duration > 0) {
            conversationData.duration = Math.round(tavusDetails.duration / 60); // Convert seconds to minutes
          }
          
          console.log('✅ Successfully enriched conversation with Tavus data');
        } catch (tavusError) {
          console.warn('⚠️ Failed to fetch Tavus conversation details, proceeding without:', tavusError);
          // Continue saving the conversation even if Tavus API fails
          
          // Remove any undefined fields that might cause Firestore errors
          if (conversationData.tavusRecordingUrl === undefined) {
            delete conversationData.tavusRecordingUrl;
          }
          if (conversationData.tavusTranscript === undefined) {
            delete conversationData.tavusTranscript;
          }
          if (conversationData.tavusMetadata === undefined) {
            delete conversationData.tavusMetadata;
          }
          if (conversationData.tavusPerceptionAnalysis === undefined) {
            delete conversationData.tavusPerceptionAnalysis;
          }
        }
      }

      // Actually save to Firestore using addDoc
      const docRef = await addDoc(conversationsCollection, conversationData);
      console.log('✅ Conversation saved to Firestore with ID:', docRef.id);

      // Verify the save by reading it back
      try {
        const savedDoc = await getDoc(docRef);
        if (savedDoc.exists()) {
          console.log('✅ Verified: Conversation document exists in Firestore');
          console.log('📊 Saved document data:', savedDoc.data());
        } else {
          console.error('❌ ERROR: Conversation document was not saved to Firestore!');
        }
      } catch (verifyError) {
        console.error('❌ Error verifying saved conversation:', verifyError);
      }

      // Update streak after recording conversation
      await this.updateStreak();
      console.log('✅ Streak updated after conversation');
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error recording conversation:', error);
      throw error;
    }
  }

  // Calculate mood score from perception analysis text
  private calculateMoodFromPerception(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      console.log('🧠 Calculating mood from perception analysis');
      
      // Extract emotional states section
      const emotionalStatesMatch = perceptionText.match(/\*\*Emotional States:\*\*([\s\S]*?)(?:\*\*|$)/);
      if (!emotionalStatesMatch) {
        console.log('⚠️ No emotional states section found in perception analysis');
        return 0;
      }
      
      const emotionalStatesText = emotionalStatesMatch[1];
      console.log('🔍 Extracted emotional states text:', emotionalStatesText);
      
      // Define positive and negative emotional indicators
      const positiveIndicators = [
        'happy', 'happiness', 'smiling', 'smile', 'positive', 'joy', 'joyful', 'enjoy', 'enjoyment',
        'enthusiastic', 'enthusiasm', 'excited', 'excitement', 'pleased', 'content', 'contentment',
        'satisfied', 'satisfaction', 'calm', 'relaxed', 'peaceful', 'engaged', 'attentive'
      ];
      
      const negativeIndicators = [
        'sad', 'sadness', 'upset', 'distressed', 'distress', 'anxious', 'anxiety', 'worried', 'worry',
        'stressed', 'stress', 'frustrated', 'frustration', 'angry', 'anger', 'irritated', 'irritation',
        'bored', 'boredom', 'tired', 'fatigue', 'exhausted', 'exhaustion', 'confused', 'confusion'
      ];
      
      // Count occurrences of positive and negative indicators
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = emotionalStatesText.match(regex);
        if (matches) {
          positiveCount += matches.length;
        }
      });
      
      negativeIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = emotionalStatesText.match(regex);
        if (matches) {
          negativeCount += matches.length;
        }
      });
      
      console.log('📊 Emotional indicators count:', { positive: positiveCount, negative: negativeCount });
      
      // Calculate mood score (1-10 scale)
      let moodScore = 5; // Neutral baseline
      
      if (positiveCount + negativeCount > 0) {
        // Calculate ratio of positive to total emotions
        const positiveRatio = positiveCount / (positiveCount + negativeCount);
        
        // Convert ratio to 1-10 scale
        moodScore = 1 + (positiveRatio * 9);
        
        // Round to one decimal place
        moodScore = Math.round(moodScore * 10) / 10;
      }
      
      console.log('🎯 Calculated mood score:', moodScore);
      return moodScore;
    } catch (error) {
      console.error('❌ Error calculating mood from perception:', error);
      return 0;
    }
  }

  // Calculate energy level from perception analysis
  private calculateEnergyFromPerception(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      // Energy indicators (high energy)
      const highEnergyIndicators = [
        'animated', 'enthusiastic', 'excited', 'energetic', 'active', 'lively',
        'vibrant', 'dynamic', 'expressive', 'gesturing', 'moving', 'talking'
      ];
      
      // Low energy indicators
      const lowEnergyIndicators = [
        'tired', 'exhausted', 'fatigued', 'lethargic', 'sluggish', 'slow',
        'calm', 'relaxed', 'still', 'quiet', 'passive', 'reserved'
      ];
      
      // Count occurrences
      let highEnergyCount = 0;
      let lowEnergyCount = 0;
      
      highEnergyIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          highEnergyCount += matches.length;
        }
      });
      
      lowEnergyIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          lowEnergyCount += matches.length;
        }
      });
      
      // Calculate energy score (1-10 scale)
      let energyScore = 5; // Neutral baseline
      
      if (highEnergyCount + lowEnergyCount > 0) {
        // Calculate ratio of high energy to total
        const highEnergyRatio = highEnergyCount / (highEnergyCount + lowEnergyCount);
        
        // Convert ratio to 1-10 scale
        energyScore = 1 + (highEnergyRatio * 9);
        
        // Round to one decimal place
        energyScore = Math.round(energyScore * 10) / 10;
      }
      
      return energyScore;
    } catch (error) {
      console.error('❌ Error calculating energy from perception:', error);
      return 0;
    }
  }

  // Calculate stress level from perception analysis
  private calculateStressFromPerception(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      // Stress indicators
      const stressIndicators = [
        'stressed', 'stress', 'anxious', 'anxiety', 'worried', 'worry',
        'tense', 'tension', 'nervous', 'agitated', 'restless', 'fidgeting',
        'concerned', 'uneasy', 'apprehensive', 'distressed'
      ];
      
      // Calm indicators (opposite of stress)
      const calmIndicators = [
        'calm', 'relaxed', 'peaceful', 'composed', 'tranquil', 'serene',
        'at ease', 'comfortable', 'content', 'collected', 'steady'
      ];
      
      // Count occurrences
      let stressCount = 0;
      let calmCount = 0;
      
      stressIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          stressCount += matches.length;
        }
      });
      
      calmIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          calmCount += matches.length;
        }
      });
      
      // Calculate stress score (1-10 scale)
      let stressScore = 5; // Neutral baseline
      
      if (stressCount + calmCount > 0) {
        // Calculate ratio of stress to total
        const stressRatio = stressCount / (stressCount + calmCount);
        
        // Convert ratio to 1-10 scale
        stressScore = 1 + (stressRatio * 9);
        
        // Round to one decimal place
        stressScore = Math.round(stressScore * 10) / 10;
      }
      
      return stressScore;
    } catch (error) {
      console.error('❌ Error calculating stress from perception:', error);
      return 0;
    }
  }

  // Calculate anxiety level from perception analysis
  private calculateAnxietyFromPerception(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      // Anxiety indicators
      const anxietyIndicators = [
        'anxious', 'anxiety', 'nervous', 'worried', 'worry', 'fear', 'fearful',
        'apprehensive', 'uneasy', 'tense', 'on edge', 'restless', 'agitated'
      ];
      
      // Confidence indicators (opposite of anxiety)
      const confidenceIndicators = [
        'confident', 'confidence', 'assured', 'self-assured', 'composed',
        'calm', 'relaxed', 'comfortable', 'at ease', 'secure'
      ];
      
      // Count occurrences
      let anxietyCount = 0;
      let confidenceCount = 0;
      
      anxietyIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          anxietyCount += matches.length;
        }
      });
      
      confidenceIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          confidenceCount += matches.length;
        }
      });
      
      // Calculate anxiety score (1-10 scale)
      let anxietyScore = 5; // Neutral baseline
      
      if (anxietyCount + confidenceCount > 0) {
        // Calculate ratio of anxiety to total
        const anxietyRatio = anxietyCount / (anxietyCount + confidenceCount);
        
        // Convert ratio to 1-10 scale
        anxietyScore = 1 + (anxietyRatio * 9);
        
        // Round to one decimal place
        anxietyScore = Math.round(anxietyScore * 10) / 10;
      }
      
      return anxietyScore;
    } catch (error) {
      console.error('❌ Error calculating anxiety from perception:', error);
      return 0;
    }
  }

  // Store Tavus conversation ID for later retrieval
  async storeTavusConversationId(conversationId: string, agentType: string): Promise<string> {
    try {
      console.log('🔄 Storing Tavus conversation ID:', conversationId, 'for user:', this.userId);
      
      // Use addDoc instead of doc+setDoc to let Firestore generate the ID
      const tavusCollection = collection(db, 'tavusConversations');
      const tavusData = {
        userId: this.userId,
        tavusConversationId: conversationId,
        agentType,
        createdAt: Timestamp.now(),
        status: 'active'
      };
      
      const docRef = await addDoc(tavusCollection, tavusData);
      
      console.log('✅ Tavus conversation ID stored with ref ID:', docRef.id);
      console.log('📊 Stored data:', tavusData);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing Tavus conversation ID:', error);
      throw error;
    }
  }

  // Retrieve and sync Tavus conversation data
  async syncTavusConversation(tavusConversationId: string): Promise<TavusConversationDetails | null> {
    try {
      console.log('🔄 Syncing Tavus conversation:', tavusConversationId);
      
      const details = await getTavusConversationDetails(tavusConversationId);
      
      // Update the stored conversation record with Tavus data
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId),
        where('tavusConversationId', '==', tavusConversationId)
      );

      const snapshot = await getDocs(conversationsQuery);
      
      if (!snapshot.empty) {
        const conversationDoc = snapshot.docs[0];
        const updateData: any = {
          lastSyncedAt: Timestamp.now()
        };

        // Only add fields that exist and are not undefined
        if (details.recording_url) {
          updateData.tavusRecordingUrl = details.recording_url;
        }
        
        if (details.transcript) {
          updateData.tavusTranscript = details.transcript;
        }
        
        if (details.metadata) {
          updateData.tavusMetadata = details.metadata;
        }
        
        // Store perception analysis if available
        if (details.perception_analysis) {
          updateData.tavusPerceptionAnalysis = details.perception_analysis;
          
          // Calculate mood after based on perception analysis
          const moodAfter = this.calculateMoodFromPerception(details.perception_analysis);
          if (moodAfter > 0) {
            updateData.moodAfter = moodAfter;
          }
        }

        // Update duration if Tavus provides more accurate data
        if (details.duration && details.duration > 0) {
          updateData.duration = Math.round(details.duration / 60);
        }

        await setDoc(conversationDoc.ref, updateData, { merge: true });
        console.log('✅ Successfully synced Tavus conversation data');
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
      console.log('🔄 Calculating mood score from perception analysis');
      
      // Get recent conversations with perception analysis
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId)
      );
      
      const snapshot = await getDocs(conversationsQuery);
      
      if (snapshot.empty) {
        console.log('⚠️ No conversations found for mood calculation');
        return 0;
      }
      
      // Filter conversations with perception analysis
      const conversationsWithPerception: {
        perceptionAnalysis: string;
        timestamp: Date;
        moodScore: number;
      }[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.tavusPerceptionAnalysis) {
          // Calculate mood score from perception
          const moodScore = this.calculateMoodFromPerception(data.tavusPerceptionAnalysis);
          
          if (moodScore > 0) {
            conversationsWithPerception.push({
              perceptionAnalysis: data.tavusPerceptionAnalysis,
              timestamp: data.endTime ? data.endTime.toDate() : data.startTime.toDate(),
              moodScore
            });
          }
        } else if (data.moodAfter && typeof data.moodAfter === 'number') {
          // Use explicitly recorded mood if available
          conversationsWithPerception.push({
            perceptionAnalysis: '',
            timestamp: data.endTime ? data.endTime.toDate() : data.startTime.toDate(),
            moodScore: data.moodAfter
          });
        }
      });
      
      if (conversationsWithPerception.length === 0) {
        console.log('⚠️ No conversations with perception analysis or mood data found');
        return 0;
      }
      
      // Sort by timestamp (most recent first)
      conversationsWithPerception.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Calculate weighted average, giving more weight to recent conversations
      let totalWeight = 0;
      let weightedSum = 0;
      
      conversationsWithPerception.forEach((conv, index) => {
        // Weight decreases with index (older conversations have less weight)
        const weight = Math.max(1, 10 - index); // 10, 9, 8, ... down to 1
        weightedSum += conv.moodScore * weight;
        totalWeight += weight;
      });
      
      const averageMoodScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      
      console.log('📊 Calculated mood score from perception:', averageMoodScore);
      return Math.round(averageMoodScore * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('❌ Error calculating mood score:', error);
      return 0;
    }
  }

  // Get conversation statistics with simplified query (no orderBy to avoid index requirement)
  async getConversationStats(timeRange: 'week' | 'month' | 'quarter' = 'week') {
    try {
      console.log('🔄 Getting conversation stats for timeRange:', timeRange);
      console.log('🔍 Querying conversations for user ID:', this.userId);
      
      // Use simple query without orderBy to avoid index requirement
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId)
      );

      console.log('🔍 Executing Firestore query for conversations...');
      const snapshot = await getDocs(conversationsQuery);
      
      console.log('📊 Found', snapshot.size, 'total conversations in database for user:', this.userId);
      
      if (snapshot.empty) {
        console.log('⚠️ No conversations found, returning default data');
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
        
        console.log('📝 Processing conversation:', {
          id: doc.id,
          agentType: data.agentType,
          startTime: startTime,
          duration: data.duration,
          tavusConversationId: data.tavusConversationId,
          userId: data.userId
        });
        
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
          tavusPerceptionAnalysis: data.tavusPerceptionAnalysis
        });
      });

      console.log('📊 Processed', allConversations.length, 'conversations');

      // Filter by time range in memory and sort by date
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

      const conversations = allConversations
        .filter(conv => conv.startTime >= startDate)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // Sort by date descending in memory
      
      console.log('📊 Filtered to', conversations.length, 'conversations for timeRange:', timeRange);

      // Calculate statistics
      const totalSessions = conversations.length;
      const totalMinutes = conversations.reduce((sum, conv) => sum + conv.duration, 0);
      
      // Calculate satisfaction from perception analysis if available
      let avgSatisfaction = 0;
      let satisfactionCount = 0;
      
      conversations.forEach(conv => {
        if (conv.satisfaction && typeof conv.satisfaction === 'number') {
          avgSatisfaction += conv.satisfaction;
          satisfactionCount++;
        } else if (conv.tavusPerceptionAnalysis) {
          // Extract satisfaction from perception analysis
          const moodScore = this.calculateMoodFromPerception(conv.tavusPerceptionAnalysis);
          if (moodScore > 0) {
            // Convert 1-10 mood scale to 1-5 satisfaction scale
            const satisfaction = Math.min(5, Math.max(1, Math.round(moodScore / 2)));
            avgSatisfaction += satisfaction;
            satisfactionCount++;
          }
        }
      });
      
      avgSatisfaction = satisfactionCount > 0 ? avgSatisfaction / satisfactionCount : 0;

      // Agent usage breakdown
      const agentUsage = conversations.reduce((acc, conv) => {
        acc[conv.agentType] = (acc[conv.agentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 Agent usage breakdown:', agentUsage);

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

      // Return recent conversations (already sorted)
      const recentConversations = conversations.slice(0, 10);

      const result = {
        totalSessions,
        totalMinutes,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        agentUsageData,
        conversations: recentConversations
      };

      console.log('✅ Conversation stats calculated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting conversation stats:', error);
      // Return empty data instead of throwing
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
      console.log('🔄 Calculating wellness metrics from perception analysis');
      
      // Get recent conversations with perception analysis
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId)
      );
      
      const snapshot = await getDocs(conversationsQuery);
      
      if (snapshot.empty) {
        console.log('⚠️ No conversations found for wellness metrics calculation');
        return {
          overall: 0,
          emotional: 0,
          physical: 0,
          social: 0,
          mental: 0,
          spiritual: 0
        };
      }
      
      // Process conversations with perception analysis
      const metrics: {
        emotional: number[];
        physical: number[];
        social: number[];
        mental: number[];
        spiritual: number[];
      } = {
        emotional: [],
        physical: [],
        social: [],
        mental: [],
        spiritual: []
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.tavusPerceptionAnalysis) {
          // Extract emotional metrics from perception
          const moodScore = this.calculateMoodFromPerception(data.tavusPerceptionAnalysis);
          const energyScore = this.calculateEnergyFromPerception(data.tavusPerceptionAnalysis);
          const stressScore = this.calculateStressFromPerception(data.tavusPerceptionAnalysis);
          const anxietyScore = this.calculateAnxietyFromPerception(data.tavusPerceptionAnalysis);
          
          if (moodScore > 0) metrics.emotional.push(moodScore);
          if (energyScore > 0) metrics.physical.push(energyScore);
          
          // Social score based on engagement indicators in perception
          const socialScore = this.extractSocialEngagement(data.tavusPerceptionAnalysis);
          if (socialScore > 0) metrics.social.push(socialScore);
          
          // Mental score based on attentiveness and focus
          const mentalScore = this.extractMentalEngagement(data.tavusPerceptionAnalysis);
          if (mentalScore > 0) metrics.mental.push(mentalScore);
          
          // Spiritual score is harder to extract from perception, use a derivative of emotional
          if (moodScore > 0) {
            // Spiritual wellbeing often correlates with emotional wellbeing but is more stable
            const spiritualScore = Math.min(10, Math.max(1, moodScore * 0.8 + 2));
            metrics.spiritual.push(spiritualScore);
          }
        } else if (data.moodAfter && typeof data.moodAfter === 'number') {
          // Use explicitly recorded mood if available
          metrics.emotional.push(data.moodAfter);
          
          // Derive other metrics from mood if perception is not available
          const baseMood = data.moodAfter;
          metrics.physical.push(Math.min(10, Math.max(1, baseMood * 0.9 + 0.5)));
          metrics.social.push(Math.min(10, Math.max(1, baseMood * 0.8 + 1)));
          metrics.mental.push(Math.min(10, Math.max(1, baseMood * 0.85 + 1.5)));
          metrics.spiritual.push(Math.min(10, Math.max(1, baseMood * 0.7 + 2)));
        }
      });
      
      // Calculate averages for each dimension
      const calculateAverage = (values: number[]): number => {
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / values.length) * 10) / 10;
      };
      
      const emotional = calculateAverage(metrics.emotional);
      const physical = calculateAverage(metrics.physical);
      const social = calculateAverage(metrics.social);
      const mental = calculateAverage(metrics.mental);
      const spiritual = calculateAverage(metrics.spiritual);
      
      // Calculate overall wellness as average of all dimensions
      const overall = Math.round(((emotional + physical + social + mental + spiritual) / 5) * 10) / 10;
      
      console.log('📊 Calculated wellness metrics:', {
        overall,
        emotional,
        physical,
        social,
        mental,
        spiritual
      });
      
      return {
        overall,
        emotional,
        physical,
        social,
        mental,
        spiritual
      };
    } catch (error) {
      console.error('❌ Error calculating wellness metrics:', error);
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

  // Extract social engagement score from perception analysis
  private extractSocialEngagement(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      // Social engagement indicators
      const socialEngagementIndicators = [
        'engaged', 'engaging', 'interactive', 'talking', 'conversing',
        'responsive', 'attentive', 'listening', 'participating', 'active',
        'animated', 'expressive', 'communicative', 'social'
      ];
      
      // Social disengagement indicators
      const socialDisengagementIndicators = [
        'disengaged', 'withdrawn', 'quiet', 'silent', 'reserved',
        'passive', 'unresponsive', 'distracted', 'inattentive', 'detached'
      ];
      
      // Count occurrences
      let engagementCount = 0;
      let disengagementCount = 0;
      
      socialEngagementIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          engagementCount += matches.length;
        }
      });
      
      socialDisengagementIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          disengagementCount += matches.length;
        }
      });
      
      // Calculate social engagement score (1-10 scale)
      let socialScore = 5; // Neutral baseline
      
      if (engagementCount + disengagementCount > 0) {
        // Calculate ratio of engagement to total
        const engagementRatio = engagementCount / (engagementCount + disengagementCount);
        
        // Convert ratio to 1-10 scale
        socialScore = 1 + (engagementRatio * 9);
        
        // Round to one decimal place
        socialScore = Math.round(socialScore * 10) / 10;
      }
      
      return socialScore;
    } catch (error) {
      console.error('❌ Error extracting social engagement:', error);
      return 0;
    }
  }

  // Extract mental engagement score from perception analysis
  private extractMentalEngagement(perceptionText: string): number {
    if (!perceptionText) return 0;
    
    try {
      // Mental engagement indicators
      const mentalEngagementIndicators = [
        'focused', 'attentive', 'concentrating', 'thoughtful', 'thinking',
        'contemplative', 'reflective', 'analytical', 'engaged', 'alert',
        'interested', 'curious', 'inquisitive'
      ];
      
      // Mental disengagement indicators
      const mentalDisengagementIndicators = [
        'distracted', 'unfocused', 'inattentive', 'bored', 'disinterested',
        'confused', 'disengaged', 'daydreaming', 'absent-minded', 'scattered'
      ];
      
      // Count occurrences
      let engagementCount = 0;
      let disengagementCount = 0;
      
      mentalEngagementIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          engagementCount += matches.length;
        }
      });
      
      mentalDisengagementIndicators.forEach(indicator => {
        const regex = new RegExp(indicator, 'gi');
        const matches = perceptionText.match(regex);
        if (matches) {
          disengagementCount += matches.length;
        }
      });
      
      // Calculate mental engagement score (1-10 scale)
      let mentalScore = 5; // Neutral baseline
      
      if (engagementCount + disengagementCount > 0) {
        // Calculate ratio of engagement to total
        const engagementRatio = engagementCount / (engagementCount + disengagementCount);
        
        // Convert ratio to 1-10 scale
        mentalScore = 1 + (engagementRatio * 9);
        
        // Round to one decimal place
        mentalScore = Math.round(mentalScore * 10) / 10;
      }
      
      return mentalScore;
    } catch (error) {
      console.error('❌ Error extracting mental engagement:', error);
      return 0;
    }
  }

  // Get mood data for charts based on perception analysis
  async getMoodData(days: number = 7): Promise<MoodEntry[]> {
    try {
      console.log('🔄 Getting mood data from perception analysis');
      
      // Get recent conversations with perception analysis
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', this.userId)
      );
      
      const snapshot = await getDocs(conversationsQuery);
      
      if (snapshot.empty) {
        console.log('⚠️ No conversations found for mood data');
        return this.generateEmptyMoodData(days);
      }
      
      // Process conversations with perception analysis
      const moodDataMap = new Map<string, MoodEntry>();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const endTime = data.endTime ? data.endTime.toDate() : data.startTime.toDate();
        const dateStr = endTime.toISOString().split('T')[0];
        
        // Skip if date is outside our range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        if (endTime < cutoffDate) return;
        
        let moodScore = 0;
        let energyScore = 0;
        let stressScore = 0;
        let anxietyScore = 0;
        
        if (data.tavusPerceptionAnalysis) {
          // Extract metrics from perception analysis
          moodScore = this.calculateMoodFromPerception(data.tavusPerceptionAnalysis);
          energyScore = this.calculateEnergyFromPerception(data.tavusPerceptionAnalysis);
          stressScore = this.calculateStressFromPerception(data.tavusPerceptionAnalysis);
          anxietyScore = this.calculateAnxietyFromPerception(data.tavusPerceptionAnalysis);
        } else if (data.moodAfter && typeof data.moodAfter === 'number') {
          // Use explicitly recorded mood if available
          moodScore = data.moodAfter;
          
          // Derive other metrics from mood if perception is not available
          energyScore = Math.min(10, Math.max(1, moodScore * 0.9 + 0.5));
          stressScore = Math.min(10, Math.max(1, 11 - moodScore)); // Inverse of mood
          anxietyScore = Math.min(10, Math.max(1, 10.5 - moodScore)); // Inverse of mood
        }
        
        // Only add if we have valid mood data
        if (moodScore > 0) {
          // If we already have an entry for this date, use the most recent one
          if (moodDataMap.has(dateStr)) {
            const existingEntry = moodDataMap.get(dateStr)!;
            
            // Update with new values
            existingEntry.mood = moodScore;
            existingEntry.energy = energyScore;
            existingEntry.stress = stressScore;
            existingEntry.anxiety = anxietyScore;
            existingEntry.sleep = Math.min(10, Math.max(1, moodScore * 0.8 + 1.5)); // Derive sleep from mood
            
            moodDataMap.set(dateStr, existingEntry);
          } else {
            // Create new entry
            moodDataMap.set(dateStr, {
              date: dateStr,
              mood: moodScore,
              energy: energyScore,
              stress: stressScore,
              anxiety: anxietyScore,
              sleep: Math.min(10, Math.max(1, moodScore * 0.8 + 1.5)) // Derive sleep from mood
            });
          }
        }
      });
      
      if (moodDataMap.size === 0) {
        console.log('⚠️ No valid mood data found in conversations');
        return this.generateEmptyMoodData(days);
      }
      
      // Fill in missing days
      const filledData: MoodEntry[] = [];
      let lastEntry: MoodEntry | null = null;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existingEntry = moodDataMap.get(dateStr);
        if (existingEntry) {
          filledData.push(existingEntry);
          lastEntry = existingEntry;
        } else if (lastEntry) {
          // Use last known entry for missing days
          filledData.push({
            date: dateStr,
            mood: lastEntry.mood,
            energy: lastEntry.energy,
            stress: lastEntry.stress,
            anxiety: lastEntry.anxiety,
            sleep: lastEntry.sleep
          });
        } else {
          // No previous entry, use zeros
          filledData.push({
            date: dateStr,
            mood: 0,
            energy: 0,
            stress: 0,
            anxiety: 0,
            sleep: 0
          });
        }
      }
      
      console.log('📊 Generated mood data for', filledData.length, 'days');
      return filledData;
    } catch (error) {
      console.error('❌ Error getting mood data:', error);
      return this.generateEmptyMoodData(days);
    }
  }

  // Generate empty mood data (zeros instead of defaults)
  private generateEmptyMoodData(days: number): MoodEntry[] {
    const emptyData: MoodEntry[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyData.push({
        date: date.toISOString().split('T')[0],
        mood: 0,
        energy: 0,
        stress: 0,
        anxiety: 0,
        sleep: 0
      });
    }
    return emptyData;
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