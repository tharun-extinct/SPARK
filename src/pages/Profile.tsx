import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadProfilePicture } from '@/lib/firebase';
import { useAuth } from '@/services/firebaseAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pencil, 
  Loader2, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase,
  Heart,
  Star,
  Trophy,
  Target,
  Activity,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
  X,
  Check,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  age: z.string().refine((val) => !val || !isNaN(parseInt(val)), {
    message: 'Age must be a number',
  }),
  gender: z.string().optional(),
  phone: z.string().optional(),
  currentRole: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  timezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Settings state
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

  // Role options for dropdown
  const roleOptions = [
    { value: "student", label: "Student", icon: "🎓" },
    { value: "software_engineer", label: "Software Engineer", icon: "💻" },
    { value: "data_scientist", label: "Data Science Professional", icon: "📊" },
    { value: "professor", label: "Professor", icon: "👨‍🏫" },
    { value: "doctor", label: "Doctor", icon: "👩‍⚕️" },
    { value: "startup_founder", label: "Startup Founder", icon: "🚀" },
    { value: "scientist", label: "Scientist", icon: "🔬" },
    { value: "designer", label: "Designer", icon: "🎨" },
    { value: "product_manager", label: "Product Manager", icon: "📋" },
    { value: "business_professional", label: "Business Professional", icon: "💼" },
    { value: "artist", label: "Artist", icon: "🎭" },
    { value: "other", label: "Other", icon: "🌟" }
  ];

  const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ];

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
  }, [isLoading]);

  const isVisible = (id: string) => visibleElements.has(id);

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: currentUser?.email || '',
      age: '',
      gender: '',
      phone: '',
      currentRole: '',
      bio: '',
      location: '',
      website: '',
      timezone: '',
    },
    mode: "onChange"
  });

  // Calculate profile completion
  const calculateProfileCompletion = (data: any) => {
    const fields = ['firstName', 'lastName', 'email', 'age', 'gender', 'phone', 'currentRole', 'bio', 'location'];
    const completedFields = fields.filter(field => data[field] && data[field].toString().trim() !== '').length;
    const photoCompleted = currentUser?.photoURL ? 1 : 0;
    return Math.round(((completedFields + photoCompleted) / (fields.length + 1)) * 100);
  };

  // Fetch user profile data
  const fetchProfileData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Update form with existing data
        form.reset({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || currentUser.email || '',
          age: userData.age ? String(userData.age) : '',
          gender: userData.gender || '',
          phone: userData.phone || '',
          currentRole: userData.currentRole || '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          timezone: userData.timezone || '',
        });

        // Calculate profile completion
        setProfileCompletion(calculateProfileCompletion(userData));
      } else {
        // Initialize with data from auth if available
        if (currentUser.displayName) {
          const nameParts = currentUser.displayName.split(' ');
          form.setValue('firstName', nameParts[0] || '');
          form.setValue('lastName', nameParts.slice(1).join(' ') || '');
        }
        setProfileCompletion(calculateProfileCompletion({}));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submit handler
  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Prepare data for Firestore
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        phone: data.phone,
        currentRole: data.currentRole,
        bio: data.bio,
        location: data.location,
        website: data.website,
        timezone: data.timezone,
        lastUpdated: new Date().toISOString(),
      };

      // Update profile in Firestore
      await setDoc(userDocRef, profileData, { merge: true });
      
      // Calculate new completion percentage
      setProfileCompletion(calculateProfileCompletion(profileData));
      
      // Turn off edit mode
      setIsEditing(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    setIsUploadingPhoto(true);
    
    try {
      await uploadProfilePicture(currentUser, file);
      
      toast({
        title: 'Profile Picture Updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  if (!currentUser) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Profile</CardTitle>
            <CardDescription>You need to be signed in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-gray-600 animate-pulse">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Header */}
            <div 
              id="profile-header"
              data-animate
              className={`transition-all duration-1000 ${
                isVisible('profile-header') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-100 translate-y-0'
              }`}
            >
              <Card className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar Section */}
                    <div className="relative group">
                      <Avatar className="w-32 h-32 cursor-pointer ring-4 ring-white shadow-xl hover:scale-105 transition-all duration-300" onClick={handleAvatarClick}>
                        {imagePreview ? (
                          <AvatarImage src={imagePreview} alt="Profile picture preview" />
                        ) : currentUser.photoURL ? (
                          <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User profile"} />
                        ) : (
                          <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-600 text-white">
                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 
                             currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        {form.watch('firstName') && form.watch('lastName') 
                          ? `${form.watch('firstName')} ${form.watch('lastName')}`
                          : currentUser.displayName || 'User Profile'
                        }
                      </h1>
                      <p className="text-muted-foreground text-lg mt-1">
                        {form.watch('currentRole') ? roleOptions.find(r => r.value === form.watch('currentRole'))?.label : 'SPARK User'}
                      </p>
                      {form.watch('bio') && (
                        <p className="text-muted-foreground mt-2 max-w-md">
                          {form.watch('bio')}
                        </p>
                      )}
                      
                      {/* Profile Completion */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Profile Completion</span>
                          <span className="font-medium">{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2" />
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Member since {new Date(currentUser.metadata.creationTime || '').getFullYear()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {profileCompletion >= 80 ? 'Complete Profile' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSaving}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Tabs */}
            <div 
              id="profile-tabs"
              data-animate
              className="opacity-100 translate-y-0"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Activity className="w-4 h-4" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="on">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    First Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={!isEditing} autoComplete="given-name" className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Last Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={!isEditing} autoComplete="family-name" className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} disabled autoComplete="email" className="bg-gray-50" />
                                </FormControl>
                                <FormDescription>
                                  Your email address is associated with your account and cannot be changed.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Heart className="w-4 h-4" />
                                  Bio
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    disabled={!isEditing} 
                                    placeholder="Tell us about yourself..."
                                    className="min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-primary"
                                  />
                                </FormControl>
                                <FormDescription>
                                  A brief description about yourself (max 500 characters)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="age"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Age
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" disabled={!isEditing} autoComplete="age" className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!isEditing}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary">
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="non-binary">Non-binary</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="+1 (555) 123-4567" disabled={!isEditing} autoComplete="tel" className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="City, Country" disabled={!isEditing} className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="currentRole"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Current Role
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!isEditing}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary">
                                        <SelectValue placeholder="Select your role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {roleOptions.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                          <div className="flex items-center gap-2">
                                            <span>{role.icon}</span>
                                            {role.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="timezone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Timezone
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!isEditing}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary">
                                        <SelectValue placeholder="Select timezone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {timezones.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                          {tz.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Website
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://yourwebsite.com" disabled={!isEditing} className="transition-all duration-300 focus:ring-2 focus:ring-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {isEditing && (
                            <div className="pt-4 space-y-4">
                              <div className="flex flex-col space-y-3">
                                <Button 
                                  type="submit" 
                                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 hover:scale-105" 
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    setIsEditing(false);
                                    fetchProfileData();
                                  }}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Activity Stats */}
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">42</div>
                            <div className="text-sm text-blue-500">Total Sessions</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">18</div>
                            <div className="text-sm text-green-500">Goals Achieved</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">7</div>
                            <div className="text-sm text-purple-500">Achievements</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        Your latest interactions and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { type: 'session', title: 'Completed wellness session with Dr. Anna', time: '2 hours ago', icon: Heart },
                          { type: 'achievement', title: 'Unlocked "Consistent Learner" badge', time: '1 day ago', icon: Trophy },
                          { type: 'goal', title: 'Reached daily mood tracking goal', time: '2 days ago', icon: Target },
                          { type: 'session', title: 'Learning session with Alex completed', time: '3 days ago', icon: Activity },
                        ].map((activity, index) => {
                          const IconComponent = activity.icon;
                          return (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300">
                              <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg">
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  {/* Notification Settings */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
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

                  {/* Privacy Settings */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Privacy Settings
                      </CardTitle>
                      <CardDescription>
                        Control your privacy and data sharing
                      </CardDescription>
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

                  {/* App Preferences */}
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        App Preferences
                      </CardTitle>
                      <CardDescription>
                        Customize your app experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Theme</label>
                        <Select
                          value={settings.preferences.theme}
                          onValueChange={(value) => handleSettingsUpdate('preferences', 'theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Language</label>
                        <Select
                          value={settings.preferences.language}
                          onValueChange={(value) => handleSettingsUpdate('preferences', 'language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;