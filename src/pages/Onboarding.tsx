import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Shield, Video, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/services/firebaseAuth";
import { updateUserOnboardingStatus, getUserOnboardingStatus } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [consent, setConsent] = useState({
    aiDisclosure: false,
    dataPrivacy: false,
    crisisIntervention: false,
    emergencyContact: false
  });

  // Check if the user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (currentUser) {
        try {
          const status = await getUserOnboardingStatus(currentUser.uid);
          if (status) {
            toast({
              title: "Already completed",
              description: "You have already completed the onboarding process.",
            });
            navigate("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [currentUser, navigate, toast]);

  const steps = [
    {
      title: "Welcome to ConnectAI",
      description: "Let's get you started with your AI wellness companion",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Your Wellness Journey Begins</h3>
            <p className="text-gray-600">
              ConnectAI uses advanced AI technology to provide you with empathetic, 
              human-like conversations that support your mental wellness and personal growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Video className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Face-to-Face</h4>
              <p className="text-sm text-gray-600">Real-time video conversations</p>
            </div>
            <div className="text-center p-4">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Private & Secure</h4>
              <p className="text-sm text-gray-600">Your privacy is protected</p>
            </div>
            <div className="text-center p-4">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Empathetic AI</h4>
              <p className="text-sm text-gray-600">Understands your emotions</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Disclosure & Transparency",
      description: "Understanding your AI companion",
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">Important: You're Talking to AI</h3>
            <p className="text-yellow-700">
              ConnectAI companions are advanced AI agents, not human therapists or medical professionals. 
              While they provide empathetic support and guidance, they cannot replace professional medical care.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">What ConnectAI CAN do:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Provide 24/7 emotional support and active listening</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Help with stress management and coping strategies</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Offer educational content and wellness guidance</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Connect you with human professionals when needed</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="aiDisclosure"
              checked={consent.aiDisclosure}
              onChange={(e) => setConsent({...consent, aiDisclosure: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="aiDisclosure" className="text-sm">
              I understand that I'm interacting with AI, not a human professional
            </label>
          </div>
        </div>
      )
    },
    {
      title: "Privacy & Data Protection",
      description: "How we protect your information",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Your Privacy Matters</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Data Encryption</h4>
              <p className="text-blue-700 text-sm">
                All conversations are encrypted end-to-end and stored securely
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Anonymous by Default</h4>
              <p className="text-green-700 text-sm">
                You can use ConnectAI without sharing personal identifying information
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Your Control</h4>
              <p className="text-purple-700 text-sm">
                You can delete your data or opt out at any time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="dataPrivacy"
              checked={consent.dataPrivacy}
              onChange={(e) => setConsent({...consent, dataPrivacy: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="dataPrivacy" className="text-sm">
              I consent to data processing as described in the privacy policy
            </label>
          </div>
        </div>
      )
    },
    {
      title: "Crisis Support Protocol",
      description: "When you need immediate help",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2">Crisis Intervention</h3>
            <p className="text-red-700">
              If ConnectAI detects signs of severe distress, suicidal thoughts, or immediate danger, 
              it will immediately connect you with human crisis support services.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Emergency Contacts:</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
              <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p><strong>Emergency Services:</strong> 911</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="crisisIntervention"
                checked={consent.crisisIntervention}
                onChange={(e) => setConsent({...consent, crisisIntervention: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="crisisIntervention" className="text-sm">
                I understand the crisis intervention protocols
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emergencyContact"
                checked={consent.emergencyContact}
                onChange={(e) => setConsent({...consent, emergencyContact: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="emergencyContact" className="text-sm">
                I consent to emergency contacts being notified if I'm in immediate danger (optional)
              </label>
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return consent.aiDisclosure;
      case 2:
        return consent.dataPrivacy;
      case 3:
        return consent.crisisIntervention;
      default:
        return true;
    }
  };
  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step completed, mark onboarding as complete
      setIsSubmitting(true);
      
      if (currentUser) {
        try {
          await updateUserOnboardingStatus(currentUser.uid, true);
          toast({
            title: "Onboarding complete!",
            description: "Your profile has been set up successfully.",
          });
          navigate("/dashboard");
        } catch (error) {
          console.error("Error completing onboarding:", error);
          toast({
            title: "Error",
            description: "There was a problem completing your setup. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      } else {
        toast({
          title: "Authentication error",
          description: "You need to be logged in to complete onboarding.",
          variant: "destructive",
        });
        navigate("/login");
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Preparing your onboarding experience...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ConnectAI</span>
            </div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <Progress value={(currentStep + 1) / steps.length * 100} className="mb-6" />
          
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8">
            {steps[currentStep].content}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
              <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting 
                ? "Saving..." 
                : currentStep === steps.length - 1 
                  ? "Get Started" 
                  : "Next"
              }
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;