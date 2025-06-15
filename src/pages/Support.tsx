import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Support = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>Get help with your SPARK experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team for immediate assistance
                </p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us an email and we'll get back to you
                </p>
                <Button variant="outline" className="w-full">
                  support@sparkapp.com
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our help articles to find answers to common questions
              </p>
              <div className="space-y-2">
                <Button variant="link" className="w-full justify-start p-0 h-auto text-primary">
                  How to get started with SPARK
                </Button>
                <Button variant="link" className="w-full justify-start p-0 h-auto text-primary">
                  Troubleshooting connection issues
                </Button>
                <Button variant="link" className="w-full justify-start p-0 h-auto text-primary">
                  Account settings and preferences
                </Button>
                <Button variant="link" className="w-full justify-start p-0 h-auto text-primary">
                  Billing and subscription information
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
