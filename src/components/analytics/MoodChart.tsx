import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodData {
  date: string;
  mood: number;
  energy: number;
  stress: number;
}

interface MoodChartProps {
  data: MoodData[];
  timeRange: string;
}

const MoodChart: React.FC<MoodChartProps> = ({ data, timeRange }) => {
  // Calculate mood trend
  const calculateTrend = () => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + item.mood, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item.mood, 0) / 3;
    return recent - previous;
  };

  const trend = calculateTrend();
  const currentMood = data[data.length - 1]?.mood || 0;

  const getTrendIcon = () => {
    if (trend > 0.5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < -0.5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 w-4 text-gray-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#10b981'; // green
    if (mood >= 6) return '#f59e0b'; // yellow
    if (mood >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Mood Tracking
              {getTrendIcon()}
            </CardTitle>
            <CardDescription>
              Your emotional patterns over {timeRange}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: getMoodColor(currentMood) }}>
              {currentMood.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Current Mood</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}/10
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
                dataKey="mood"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#moodGradient)"
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Energy"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Stress"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Mood</div>
            <div className="text-lg font-semibold text-purple-600">
              {(data.reduce((sum, item) => sum + item.mood, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Energy</div>
            <div className="text-lg font-semibold text-green-600">
              {(data.reduce((sum, item) => sum + item.energy, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Stress</div>
            <div className="text-lg font-semibold text-red-600">
              {(data.reduce((sum, item) => sum + item.stress, 0) / data.length).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodChart;