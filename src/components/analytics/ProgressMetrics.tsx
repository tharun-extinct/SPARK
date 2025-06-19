import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Award, Star, CheckCircle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  category: 'wellness' | 'learning' | 'social';
  completed: boolean;
  completedDate?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressMetricsProps {
  milestones: Milestone[];
  achievements: Achievement[];
  overallProgress: number;
  weeklyGoals: number;
  monthlyGoals: number;
}

const ProgressMetrics: React.FC<ProgressMetricsProps> = ({
  milestones,
  achievements,
  overallProgress,
  weeklyGoals,
  monthlyGoals
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wellness': return 'bg-green-100 text-green-800 border-green-200';
      case 'learning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{weeklyGoals}/7</div>
                <div className="text-sm text-muted-foreground">Weekly Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Learning Milestones
          </CardTitle>
          <CardDescription>
            Track your progress towards wellness and learning goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{milestone.title}</span>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(milestone.category)}
                    >
                      {milestone.category}
                    </Badge>
                    {milestone.completed && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {milestone.progress}/{milestone.target}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                <Progress 
                  value={(milestone.progress / milestone.target) * 100} 
                  className="h-2"
                />
                {milestone.completed && milestone.completedDate && (
                  <p className="text-xs text-green-600">
                    Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Celebrate your accomplishments and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.slice(0, 6).map((achievement) => (
              <div 
                key={achievement.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{achievement.title}</span>
                    <Badge 
                      className={getRarityColor(achievement.rarity)}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressMetrics;