import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings as SettingsIcon, 
  Shield, 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Save,
  Check,
  AlertTriangle,
  Info,
  Trash2,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/services/firebaseAuth';
import { signOut } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Data sharing preferences
  const [dataSharing, setDataSharing] = useState({
    namePreference: 'first_name', // 'first_name', 'last_name', 'full_name'
  });

  // Other settings
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showActivity: true,
      showStats: false,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
    }
  });

  // Intersection Observer for animations
  useEffect(() => {
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

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const isVisible = (id: string) => visibleElements.has(id);

  // Handle settings update
  const handleSettingsUpdate = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  // Handle data sharing update
  const handleDataSharingUpdate = (key: string, value: any) => {
    setDataSharing(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete all conversation data
  const handleDeleteConversationData = async () => {
    setIsDeletingData(true);
    try {
      // Simulate API call to delete conversation data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Data Deleted",
        description: "All your conversation data has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  const nameOptions = [
    { value: 'first_name', label: 'First name only', description: 'Share only your first name with AI' },
    { value: 'last_name', label: 'Last name only', description: 'Share only your last name with AI' },
    { value: 'full_name', label: 'Full name', description: 'Share your complete name with AI' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" 
             style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-2xl animate-pulse" 
             style={{ bottom: '10%', right: '10%' }} />
      </div>

      <div className="container mx-auto py-6 px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div 
            id="settings-header"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible('settings-header') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <Card className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg">
                    <SettingsIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Settings
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Manage your preferences and privacy settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Data Sharing Preferences */}
          <div 
            id="data-sharing-section"
            data-animate
            className={`transition-all duration-1000 delay-200 ${
              isVisible('data-sharing-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Data Sharing with AI</CardTitle>
                    <CardDescription>
                      Choose what personal information you'd like to share with conversational AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Why we ask this</h4>
                      <p className="text-blue-700 text-sm">
                        Sharing your name helps the AI provide more personalized and natural conversations. 
                        You can change this preference at any time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">What would you prefer to share with conversational AI?</h4>
                  
                  <RadioGroup 
                    value={dataSharing.namePreference} 
                    onValueChange={(value) => handleDataSharingUpdate('namePreference', value)}
                    className="space-y-4"
                  >
                    {nameOptions.map((option) => (
                      <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        {dataSharing.namePreference === option.value && (
                          <Badge variant="default" className="bg-gradient-to-r from-primary to-purple-600">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Privacy Note</h4>
                      <p className="text-amber-700 text-sm">
                        Your name is only used during conversations and is not stored permanently. 
                        All conversations are encrypted and follow our privacy policy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <div 
            id="notification-settings"
            data-animate
            className={`transition-all duration-1000 delay-400 ${
              isVisible('notification-settings') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to receive updates and alerts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Notifications', description: 'Text message alerts' },
                  { key: 'marketing', label: 'Marketing Communications', description: 'Product updates and tips' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[setting.key as keyof typeof settings.notifications]}
                      onCheckedChange={(checked) => handleSettingsUpdate('notifications', setting.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Privacy Settings */}
          <div 
            id="privacy-settings"
            data-animate
            className={`transition-all duration-1000 delay-600 ${
              isVisible('privacy-settings') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Privacy Settings</CardTitle>
                    <CardDescription>
                      Control your privacy and data sharing preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'profileVisible', label: 'Public Profile', description: 'Make your profile visible to others' },
                  { key: 'showActivity', label: 'Show Activity', description: 'Display your recent activity' },
                  { key: 'showStats', label: 'Show Statistics', description: 'Share your progress statistics' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={settings.privacy[setting.key as keyof typeof settings.privacy]}
                      onCheckedChange={(checked) => handleSettingsUpdate('privacy', setting.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div 
            id="save-section"
            data-animate
            className={`transition-all duration-1000 delay-800 ${
              isVisible('save-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Save Changes</h3>
                    <p className="text-sm text-muted-foreground">
                      Your preferences will be applied immediately
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone - Delete Data and Logout */}
          <div 
            id="danger-zone"
            data-animate
            className={`transition-all duration-1000 delay-1000 ${
              isVisible('danger-zone') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-red-800">Danger Zone</CardTitle>
                    <CardDescription className="text-red-600">
                      Irreversible actions that affect your account and data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delete Conversation Data */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-white/50">
                  <div>
                    <h4 className="font-medium text-red-800">Delete All Conversation Data</h4>
                    <p className="text-sm text-red-600">
                      Permanently delete all your conversation history and chat data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        disabled={isDeletingData}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      >
                        {isDeletingData ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Data
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="w-5 h-5" />
                          Delete All Conversation Data?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                          This will permanently delete all your conversation history, chat logs, and related data. 
                          This action cannot be undone and you will lose all your conversation records.
                          <br /><br />
                          Are you absolutely sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteConversationData}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Separator className="bg-red-200" />

                {/* Logout */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-white/50">
                  <div>
                    <h4 className="font-medium text-orange-800">Logout</h4>
                    <p className="text-sm text-orange-600">
                      Sign out of your account and return to the home page
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={isLoggingOut}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <LogOut className="w-5 h-5" />
                          Logout Confirmation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to logout? You'll need to sign in again to access your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                          Yes, Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;