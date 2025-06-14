---
applyTo: '**'
---

# SPARK AI Development Instructions

## Project Overview
SPARK (Social Perceptual AI Real-time Knowledge Assistant) is an AI-powered video agent for mental wellness support using Tavus's Conversational Video Interface (CVI).

## Rules & Guidelines
- Always use tabs for indentation.
- Don't create any files for debugging, until I told you to do so.
- For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.
- Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.


## Work flow
- **New user**: SignUp -> Onboarding (necessary) -> Dashboard
- **Returning user**: Login -> Dashboard


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




--
applyTo: '**/src/pages/**'
--

### Coding Conventions
- Follow React functional components with hooks
- Implement responsive design (mobile-first)
- Use lucide-react for icons
- Prefer arrow functions and const declarations
- Include loading states and error handling


### UI/UX Guidelines
- Use gradient backgrounds for visual appeal
- Implement hover animations and transitions
- Maintain consistent spacing (Tailwind spacing scale)
- Use primary/secondary color scheme from theme
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



### Authentication Implementation
- Google and Email/Password authentication
- Firebase Authentication for user management
- Persistent sessions using browserLocalPersistence
- Protected routes using Higher-Order Components (HOCs)
- User profiles stored in Firestore
- Error handling and loading states for auth operations




