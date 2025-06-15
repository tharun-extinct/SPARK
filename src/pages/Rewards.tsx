import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

const Rewards = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>Rewards & Referrals</CardTitle>
          <CardDescription>Coming soon! Earn rewards by referring friends and completing actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-center text-muted-foreground">
            Our rewards program is currently under development. Check back soon for exciting opportunities to earn rewards and refer friends to SPARK!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rewards;
