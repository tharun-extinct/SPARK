import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Star, MessageSquare, Clock, Heart, Brain, Zap } from 'lucide-react';

interface SessionData {
  date: string;
  quality: number;
  engagement: number;
  satisfaction: number;
  duration: number;
  agentType: string;
}

interface QualityMetrics {
  empathy: number;
  clarity: number;
  helpfulness: number;
  responsiveness: number;
  accuracy: number;
  engagement: number;
}

interface SessionQualityProps {
  sessions: SessionData[];
  qualityMetrics: QualityMetrics;
  averageRating: number;
  totalFeedback: number;
}

const SessionQuality: React.FC<SessionQualityProps> = ({
  sessions,
  qualityMetrics,
  averageRating,
  totalFeedback
}) => {
  const getQualityColor = (quality: number) => {
    if (quality >= 4.5) return 'text-green-600';
    if (quality >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 4.5) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (quality >= 3.5) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (quality >= 2.5) return { label: 'Fair', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const radarData = [
    { subject: 'Empathy', value: qualityMetrics.empathy, fullMark: 5 },
    { subject: 'Clarity', value: qualityMetrics.clarity, fullMark: 5 },
    { subject: 'Helpfulness', value: qualityMetrics.helpfulness, fullMark: 5 },
    { subject: 'Responsiveness', value: qualityMetrics.responsiveness, fullMark: 5 },
    { subject: 'Accuracy', value: qualityMetrics.accuracy, fullMark: 5 },
    { subject: 'Engagement', value: qualityMetrics.engagement, fullMark: 5 },
  ];

  const recentSessions = sessions.slice(-7);
  const qualityBadge = getQualityBadge(averageRating);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${getQualityColor(averageRating)}`}>
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalFeedback}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{qualityMetrics.empathy.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Empathy Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{qualityMetrics.engagement.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Quality Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Session Quality Trend
            </CardTitle>
            <CardDescription>
              Quality ratings over your recent sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentSessions}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
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

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
          <CardDescription>
            Individual metric scores and improvement areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(qualityMetrics).map(([metric, value]) => (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{metric}</span>
                    <Badge 
                      variant="outline" 
                      className={getQualityBadge(value).color}
                    >
                      {getQualityBadge(value).label}
                    </Badge>
                  </div>
                  <span className={`font-semibold ${getQualityColor(value)}`}>
                    {value.toFixed(1)}/5.0
                  </span>
                </div>
                <Progress value={(value / 5) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Session Feedback</CardTitle>
          <CardDescription>
            Your latest conversation ratings and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
    </div>
  );
};

export default SessionQuality;