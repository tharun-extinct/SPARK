---
applyTo: '**'

---

# SPARK AI Development Instructions

## Project Overview
SPARK (Social Perceptual AI Real-time Knowledge Assistant) is an AI-powered video agent for mental wellness support using Tavus's Conversational Video Interface (CVI).

## Work flow
- **New user**: SignUp -> Dashboard (onboarding is optional)
- **Returning user**: Login -> Dashboard (always)

## Core Technology Stack
- **Frontend**: Vite + React + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Video Technology**: Tavus CVI Pipeline (Phoenix-3, Raven-0, Sparrow-0)
- **WebRTC**: Daily.co / LiveKit integration
- **State Management**: React hooks (useState, useEffect)
- **Routing**: React Router
- **Package Manager**: Bun (preferred) / npm

## Key AI Models & Features
- **Phoenix-3**: Lifelike avatar generation with natural facial movements
- **Raven-0**: Advanced emotional perception and ambient awareness
- **Sparrow-0**: Natural turn-taking and conversation rhythm
- **Real-time video conversations** with sub-1-second latency
- **Crisis intervention** with human-in-the-loop escalation
- **Multilingual support** with cultural adaptation

## Development Standards

### File Structure
```
src/
├── components/        # UI components including Navigation
│   └── ui/            # shadcn/ui components
├── pages/             # Main application pages
├── hooks/             # Custom React hooks
├── services/          # Service files like firebaseAuth
├── contexts/          # Context providers (if needed)
└── lib/               # Utilities and configurations
```

### Coding Conventions
- Use TypeScript for all new code
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Implement responsive design (mobile-first)
- Use lucide-react for icons
- Prefer arrow functions and const declarations

### Component Patterns
```tsx
// Preferred component structure
import { useState, useEffect } from 'react';
import { ComponentIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComponentName = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="responsive-classes">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### UI/UX Guidelines
- Use gradient backgrounds for visual appeal
- Implement hover animations and transitions
- Maintain consistent spacing (Tailwind spacing scale)
- Use primary/secondary color scheme from theme
- Include loading states and error handling
- Ensure accessibility (ARIA labels, keyboard navigation)

### Mental Health Context
- **Empathetic language** in all user-facing text
- **Crisis-safe design** - always provide help resources
- **Privacy-first** approach to data handling
- **Non-judgmental** interface design
- **Inclusive** language and imagery

### Key Features to Implement
1. **Real-time Video Interface**: Tavus CVI integration
2. **AI Personas**: Empathetic Listener, Cognitive Coach, Wellness Guardian
3. **Emotional Adaptation**: Dynamic response based on user state
4. **Crisis Detection**: Escalation protocols for emergency situations
5. **Personalization**: Adaptive content and conversation flow

### Performance Requirements
- Sub-1-second response times for conversations
- Support thousands of simultaneous users
- Optimized bundle sizes
- Efficient state management
- Minimal re-renders

### Security & Privacy
- GDPR/COPPA compliance
- End-to-end encryption for sensitive data
- Firebase Authentication for secure user management
- Protected routes for authenticated content
- Firestore security rules to control data access
- Explicit user consent for data collection
- Anonymous usage options
- Secure crisis intervention protocols

### Testing Approach
- Component testing with user interaction focus
- Integration testing for video/AI features
- Accessibility testing
- Performance testing under load
- Crisis scenario testing

### Deployment
- Web-based application
- PWA capabilities for mobile access
- CDN optimization for global reach
- Environment-specific configurations
- Monitoring and analytics integration

## Common Tasks

### Adding New UI Components
1. Use shadcn/ui CLI: `npx shadcn-ui@latest add [component]`
2. Customize with Tailwind classes
3. Ensure responsive design
4. Add proper TypeScript types

### Implementing Video Features
1. Integrate with Tavus CVI API
2. Handle WebRTC connections via Daily/LiveKit
3. Implement error handling for connection issues
4. Add proper cleanup on component unmount

### Crisis Safety Features
1. Always include crisis hotline information
2. Implement clear escalation paths
3. Never replace human intervention
4. Maintain supportive presence during handoff

### Authentication Implementation
- Firebase Authentication for user management
- Persistent sessions using browserLocalPersistence
- Protected routes using Higher-Order Components (HOCs)
- User profiles stored in Firestore
- Error handling and loading states for auth operations

### Route Protection Patterns
```tsx
// In App.tsx
import { AuthProvider, withAuth, withCompletedOnboarding } from "./services/firebaseAuth";

// Protect routes that require authentication
const ProtectedConversation = withAuth(Conversation);
const ProtectedDashboard = withCompletedOnboarding(Dashboard);
const ProtectedOnboarding = withAuth(Onboarding);

// Route setup
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      {/* Other routes */}
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Import Path Conventions
- Use `@/` prefix for imports from the src directory
- Correct import paths:
  - UI components: `import { Button } from "@/components/ui/button";`
  - Pages: `import Dashboard from "@/pages/Dashboard";`
  - Services: `import { useAuth } from "@/services/firebaseAuth";`
  - Lib utilities: `import { signIn } from "@/lib/firebase";`

## Firebase Configuration

### Authentication Setup
- Use Email/Password authentication
- Enable persistent sessions (browserLocalPersistence)
- Implement proper error handling for auth operations

### Firestore Collections
- `users`: User profiles and preferences
  - Contains onboarding status, profile info
  - Used to control access to various features
- `conversations`: History of user interactions
  - Tracks engagement with different AI personas
  - Useful for continuing conversations

### Firestore Security Rules
- Use the provided `firestore.rules` file as a template
- Ensure users can only access their own data
- Implement role-based access if needed for admin features

## Domain-Specific Knowledge
- Mental health is primary focus, not medical diagnosis
- AI transparency is crucial - users must know they're talking to AI
- Cultural sensitivity matters - support diverse backgrounds
- Privacy is paramount - minimize data collection
- Scalability is key - design for global reach

## Common Pitfalls to Avoid
- Don't implement medical diagnosis features
- Don't store sensitive personal data unnecessarily
- Don't create addictive interaction patterns
- Don't bypass crisis intervention protocols

## External Integrations
- Tavus API for AI video agents
- Daily.co/LiveKit for WebRTC
- Crisis hotline APIs (with user consent)
- Health monitoring devices (future)
- EHR systems (future roadmap)