import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Stethoscope, Sparkles, Users, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState(0);
  
  const roles = [
    {
      title: "AI Tutor",
      icon: BookOpen,
      description: "Personalized learning in STEM, languages, and soft skills",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Mental Health Companion",
      icon: Heart,
      description: "Empathetic support and guided conversations",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Virtual Doctor",
      icon: Stethoscope,
      description: "Initial consultations and health guidance",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Real-time Emotional Perception",
      description: "SPARK adapts to your emotional state and engagement level using advanced AI"
    },
    {
      icon: Users,
      title: "Multi-Role Assistant",
      description: "Seamlessly switches between tutoring, medical guidance, and mental health support"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "GDPR and COPPA compliant with end-to-end encryption"
    },
    {
      icon: Globe,
      title: "Globally Accessible",
      description: "Multiple languages and culturally adaptive content for everyone"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fix for dynamic icon component
  const ActiveRoleIcon = roles[activeRole].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
 
      {/* Navigation bar */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SPARK</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">Roles</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <Button 
          className="bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform"
          onClick={() => navigate('/login')}>
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </nav> 


      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Tavus & LiveKit
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Social Perceptual AI
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Real-time Knowledge Assistant
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Meet SPARK, your AI companion that revolutionizes human connection through real-time video interaction, 
            emotional perception, and adaptive support across education, healthcare, and mental wellness.
          </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform text-lg px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 hover:scale-105 transition-transform"
              onClick={() => window.open('#', '_blank')} // Replace with actual demo URL when available
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Dynamic Role Showcase */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-3xl"></div>
            <Card className="relative backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${roles[activeRole].color} flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                  <ActiveRoleIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{roles[activeRole].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {roles[activeRole].description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SPARK combines cutting-edge AI technology with human-centered design to deliver unprecedented personalized experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FeatureIcon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three Roles, One Purpose</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SPARK adapts to your needs, seamlessly transitioning between different support roles to provide comprehensive assistance.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const RoleIcon = role.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <RoleIcon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base mb-4">
                      {role.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Experience?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already experiencing the future of AI-powered support and learning.
            </p>            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform text-lg px-8 py-6"
                onClick={() => navigate('/login')}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-transform"
                onClick={() => navigate('/signup')}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">SPARK</span>
              </div>
              <p className="text-muted-foreground">
                Revolutionizing human connection through AI-powered real-time assistance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SPARK. All rights reserved. Powered by Tavus & LiveKit.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
