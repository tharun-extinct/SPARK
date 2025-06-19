import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Stethoscope, Sparkles, Users, Shield, Globe, Star, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Intersection Observer for scroll animations
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  const roles = [
    {
      title: "AI Tutor",
      icon: BookOpen,
      description: "Personalized learning in STEM, languages, and soft skills",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgColor: "from-blue-500/10 via-cyan-500/10 to-teal-500/10"
    },
    {
      title: "Mental Health Companion",
      icon: Heart,
      description: "Empathetic support and guided conversations",
      color: "from-pink-500 via-rose-500 to-red-500",
      bgColor: "from-pink-500/10 via-rose-500/10 to-red-500/10"
    },
    {
      title: "Virtual Doctor",
      icon: Stethoscope,
      description: "Initial consultations and health guidance",
      color: "from-green-500 via-emerald-500 to-teal-500",
      bgColor: "from-green-500/10 via-emerald-500/10 to-teal-500/10"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Real-time Emotional Perception",
      description: "SPARK adapts to your emotional state and engagement level using advanced AI",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Multi-Role Assistant",
      description: "Seamlessly switches between tutoring, medical guidance, and mental health support",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "GDPR and COPPA compliant with end-to-end encryption",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Globally Accessible",
      description: "Multiple languages and culturally adaptive content for everyone",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "50K+", label: "Conversations", icon: Brain },
    { number: "99.9%", label: "Uptime", icon: Zap },
    { number: "4.9★", label: "User Rating", icon: Star }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % roles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fix for dynamic icon component
  const ActiveRoleIcon = roles[activeRole].icon;

  const isVisible = (id: string) => visibleElements.has(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.02 + 'px',
            top: mousePosition.y * 0.02 + 'px',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-2xl animate-pulse"
          style={{
            right: mousePosition.x * -0.01 + 'px',
            bottom: mousePosition.y * -0.01 + 'px',
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>

      {/* Navigation bar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SPARK</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">Features</a>
            <a href="#roles" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">Roles</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">About</a>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/login')}
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div 
            id="hero-badge"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible('hero-badge') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Tavus & LiveKit
            </Badge>
          </div>
          
          <div 
            id="hero-title"
            data-animate
            className={`transition-all duration-1000 delay-200 ${
              isVisible('hero-title') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                Social Perceptual AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Real-time Knowledge Assistant
              </span>
            </h1>
          </div>
          
          <div 
            id="hero-description"
            data-animate
            className={`transition-all duration-1000 delay-400 ${
              isVisible('hero-description') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Meet SPARK, your AI companion that revolutionizes human connection through real-time video interaction, 
              emotional perception, and adaptive support across education, healthcare, and mental wellness.
            </p>
          </div>

          <div 
            id="hero-buttons"
            data-animate
            className={`transition-all duration-1000 delay-600 ${
              isVisible('hero-buttons') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:scale-105 transition-all duration-300 text-lg px-8 py-6 shadow-xl hover:shadow-2xl"
                onClick={() => navigate('/login')}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => window.open('#', '_blank')}
              >
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Dynamic Role Showcase */}
          <div 
            id="hero-showcase"
            data-animate
            className={`relative max-w-md mx-auto transition-all duration-1000 delay-800 ${
              isVisible('hero-showcase') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${roles[activeRole].bgColor} blur-3xl transition-all duration-1000`}></div>
            <Card className="relative backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-500 bg-white/80">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${roles[activeRole].color} flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg`}>
                  <ActiveRoleIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {roles[activeRole].title}
                </CardTitle>
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

      {/* Stats Section */}
      <section 
        id="stats-section"
        data-animate
        className={`py-16 transition-all duration-1000 ${
          isVisible('stats-section') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div 
                  key={index}
                  className="text-center group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300">
                    <StatIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-r from-white/50 to-blue-50/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div 
            id="features-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible('features-header') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Intelligent Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SPARK combines cutting-edge AI technology with human-centered design to deliver unprecedented personalized experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`transition-all duration-1000 ${
                    isVisible(`feature-${index}`) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card className="hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group bg-white/80 backdrop-blur-sm border-2 hover:border-primary/20">
                    <CardHeader className="text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                        <FeatureIcon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center group-hover:text-slate-600 transition-colors duration-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <div 
            id="roles-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible('roles-header') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Three Roles, One Purpose
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SPARK adapts to your needs, seamlessly transitioning between different support roles to provide comprehensive assistance.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={index}
                  id={`role-${index}`}
                  data-animate
                  className={`transition-all duration-1000 ${
                    isVisible(`role-${index}`) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group hover:-translate-y-3 bg-white/80 backdrop-blur-sm border-2 hover:border-primary/20">
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <CardHeader className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                        <RoleIcon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                        {role.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <CardDescription className="text-base mb-4 group-hover:text-slate-600 transition-colors duration-300">
                        {role.description}
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 hover:scale-105"
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta-section"
        data-animate
        className={`py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm transition-all duration-1000 ${
          isVisible('cta-section') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Ready to Transform Your Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already experiencing the future of AI-powered support and learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:scale-105 transition-all duration-300 text-lg px-8 py-6 shadow-xl hover:shadow-2xl"
                onClick={() => navigate('/login')}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => navigate('/signup')}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SPARK</span>
              </div>
              <p className="text-muted-foreground">
                Revolutionizing human connection through AI-powered real-time assistance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-300">Privacy</a></li>
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