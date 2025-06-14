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
import NotFound from "./pages/NotFound";
import Navigation from "./pages/Navigation";
import PsyChat from "@/pages/conversation/PsyChat";
import TutorChat from "@/pages/conversation/TutorChat";
import DoctorChat from "@/pages/conversation/DoctorChat";
const queryClient = new QueryClient();

// Protect routes that require authentication
const ProtectedConversation = Conversation
const ProtectedDashboard = Dashboard
const ProtectedOnboarding = withAuth(Onboarding);

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
        <Route path="/conversation/tutor" element={<TutorChat />} />
        <Route path="/conversation/doctor" element={<DoctorChat />} />
        <Route path="/conversation/psy" element={<PsyChat />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/onboarding" element={<ProtectedOnboarding />} />
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
