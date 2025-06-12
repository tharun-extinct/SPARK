import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/firebaseAuth";
import { withAuth, withCompletedOnboarding } from "./services/firebaseAuth";
import Index from "./pages/Index";
// import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Conversation from "./pages/Conversation";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Navigation from "./components/cmp/Navigation";

const queryClient = new QueryClient();

// Protect routes that require authentication
const ProtectedDashboard = withCompletedOnboarding(Dashboard);
const ProtectedConversation = withAuth(Conversation);
const ProtectedOnboarding = withAuth(Onboarding);

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            {/*<Route path="/landing" element={<Landing />} />*/}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/conversation/:agentType" element={<ProtectedConversation />} />
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route path="/onboarding" element={<ProtectedOnboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
