import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  User,
  Home,
  MessageSquare,
  BarChart,
  Settings
} from 'lucide-react';
import { useAuth } from '@/services/firebaseAuth';
import { signOut, getUserOnboardingStatus } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (currentUser) {
        try {
          const status = await getUserOnboardingStatus(currentUser.uid);
          setOnboardingCompleted(status);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }
    };
    
    checkOnboardingStatus();
  }, [currentUser]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      setOnboardingCompleted(false);
      toast({
        title: "Signed out successfully",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };
  const menuItems = [
    ...(onboardingCompleted ? [{ name: 'Home', path: '/dashboard', icon: <Home className="w-5 h-5" /> }] : []),
    { name: 'Chat', path: '/conversation/default', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <Link to="/" className="text-xl font-bold">SPARK</Link>
          </div>

          {/* Desktop Menu */}
          {currentUser ? (
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-6 mr-6">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                      isActive(item.path) 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-muted">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {currentUser.displayName || currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/signup')}>Sign Up</Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 md:hidden pb-4 border-t pt-4">
            {currentUser ? (
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                      isActive(item.path) 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start px-0" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  className="justify-start px-0"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
