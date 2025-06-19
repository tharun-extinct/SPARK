import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Clock, Target, Brain } from 'lucide-react';

interface TopicData {
  topic: string;
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  growth: number;
}

interface ConversationInsightsProps {
  topics: TopicData[];
  totalSessions: number;
  avgDuration: number;
  totalMinutes: number;
}

const ConversationInsights: React.FC<ConversationInsightsProps> = ({
  topics,
  totalSessions,
  avgDuration,
  totalMinutes
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTopicSize = (frequency: number) => {
    const maxFreq = Math.max(...topics.map(t => t.frequency));
    const minSize = 12;
    const maxSize = 24;
    return minSize + (frequency / maxFreq) * (maxSize - minSize);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgDuration}min</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMinutes}</div>
                <div className="text-sm text-muted-foreground">Total Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Word Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Conversation Topics
          </CardTitle>
          <CardDescription>
            Most frequently discussed topics in your conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            {topics.map((topic, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`${getSentimentColor(topic.sentiment)} hover:scale-105 transition-transform cursor-pointer`}
                style={{ 
                  fontSize: `${getTopicSize(topic.frequency)}px`,
                  padding: '8px 12px'
                }}
              >
                {topic.topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of your conversation themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topics.slice(0, 5).map((topic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{topic.topic}</span>
                    <Badge 
                      variant="outline" 
                      className={getSentimentColor(topic.sentiment)}
                    >
                      {topic.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{topic.frequency} mentions</span>
                    {topic.growth > 0 && (
                      <span className="text-green-600">+{topic.growth}%</span>
                    )}
                    {topic.growth < 0 && (
                      <span className="text-red-600">{topic.growth}%</span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={(topic.frequency / Math.max(...topics.map(t => t.frequency))) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationInsights;