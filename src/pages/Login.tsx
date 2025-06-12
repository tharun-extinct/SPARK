import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, getUserOnboardingStatus } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/services/firebaseAuth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkOnboardingStatus } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const userCredential = await signIn(email, password);
      const user = userCredential.user;
      
      // Check if the user has completed onboarding
      const hasCompletedOnboarding = await getUserOnboardingStatus(user.uid);
      
      toast({
        title: "Login successful!",
        description: "Welcome back to SPARK",
      });
      
      // Redirect based on onboarding status
      if (hasCompletedOnboarding) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to log in. Please check your credentials.");
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ConnectAI</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:underline"
            >
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
