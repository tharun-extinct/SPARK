import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, withAuth, withCompletedOnboarding } from "./services/firebaseAuth";
import Index from "./pages/Index";
// import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Conversation from "./pages/Conversation";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import AllSessions from "./pages/AllSessions";
import MindGame from "./pages/MindGame";
import NotFound from "./pages/NotFound";
import Navigation from "./pages/Navigation";

const queryClient = new QueryClient();

// Protect routes that require authentication
const ProtectedConversation = withAuth(Conversation);
const ProtectedDashboard = withCompletedOnboarding(Dashboard);
const ProtectedOnboarding = withAuth(Onboarding);
const ProtectedProfile = withAuth(Profile);
const ProtectedRewards = withAuth(Rewards);
const ProtectedSupport = withAuth(Support);
const ProtectedSettings = withAuth(Settings);
const ProtectedAllSessions = withAuth(AllSessions);
const ProtectedMindGame = withAuth(MindGame);

// Component to handle conditional navigation rendering
const AppContent = () => {
  const location = useLocation();
  const hideNavigation = ['/login', '/signup', '/'].includes(location.pathname);

  return (
    <>
      <Toaster />
      <Sonner />
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />        
        <Route path="/conversation/:agentType" element={<ProtectedConversation />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/onboarding" element={<ProtectedOnboarding />} />
        <Route path="/profile" element={<ProtectedProfile />} />
        <Route path="/rewards" element={<ProtectedRewards />} />
        <Route path="/support" element={<ProtectedSupport />} />
        <Route path="/settings" element={<ProtectedSettings />} />
        <Route path="/sessions" element={<ProtectedAllSessions />} />
        <Route path="/mind-games" element={<ProtectedMindGame />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
	<BrowserRouter>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Routes>
					{/* Public landing page at root */}
					<Route path="/" element={<Index />} />
					{/* Authenticated app routes */}
					<Route path="/*" element={
						<AuthProvider>
							<AppContent />
						</AuthProvider>
					} />
				</Routes>
			</TooltipProvider>
		</QueryClientProvider>
	</BrowserRouter>
);

export default App;