import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/services/firebaseAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { Loader2 } from 'lucide-react';

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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Role options for dropdown
  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "software_engineer", label: "Software Engineer" },
    { value: "data_scientist", label: "Data Science Professional" },
    { value: "professor", label: "Professor" },
    { value: "doctor", label: "Doctor" },
    { value: "startup_founder", label: "Startup Founder" },
    { value: "scientist", label: "Scientist" },
    { value: "designer", label: "Designer" },
    { value: "product_manager", label: "Product Manager" },
    { value: "business_professional", label: "Business Professional" },
    { value: "artist", label: "Artist" },
    { value: "other", label: "Other" }
  ];
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
    },
    mode: "onChange"
  });
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
        });
      } else {
        // Initialize with data from auth if available
        if (currentUser.displayName) {
          const nameParts = currentUser.displayName.split(' ');
          form.setValue('firstName', nameParts[0] || '');
          form.setValue('lastName', nameParts.slice(1).join(' ') || '');
        }
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
        lastUpdated: new Date().toISOString(),
      };

      // Update profile in Firestore
      await setDoc(userDocRef, profileData, { merge: true });
      
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
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              {currentUser.photoURL ? (
                <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User profile"} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 
                   currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="on">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                    <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} autoComplete="given-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} autoComplete="family-name" />
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
                      <FormLabel>Email</FormLabel>                      <FormControl>
                        <Input {...field} disabled autoComplete="email" />
                      </FormControl>
                      <FormDescription>
                        Your email address is associated with your account and cannot be changed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>                      <FormControl>
                          <Input {...field} type="number" disabled={!isEditing} autoComplete="age" />
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
                            <SelectTrigger>
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
                </div>                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (with country code)</FormLabel>                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" disabled={!isEditing} autoComplete="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /><FormField
                  control={form.control}
                  name="currentRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />                <div className="pt-4 space-y-4">
                  {!isEditing ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to the last saved values
                          fetchProfileData();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
