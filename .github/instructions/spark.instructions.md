---
applyTo: '**'
---

# SPARK AI Development Instructions

## Project Overview
SPARK (Social Perceptual AI Real-time Knowledge Assistant) is an AI-powered video agent for mental wellness expert, Doctor and a Tutor. Powered by Tavus's Conversational Video Interface (CVI).

## Rules & Guidelines
- Always use tabs for indentation.
- Don't create any files for debugging, until I told you to do so.
- For all designs I ask you to make, have them be beautiful, not cookie cutter. 
- Make code changes in such a way that are fully featured and worthy for production.
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
- **Package Manager**: npm (preferred)


## Firebase Setup
There isn't a firebase.json file in this project directory, which means we need to update the rules directly from the Firebase console.

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
applyTo: '**/tavus.ts'
--

## Key AI Models & Features
- **Phoenix-3**: Lifelike avatar generation with natural facial movements
- **Raven-0**: Advanced emotional perception and ambient awareness
- **Sparrow-0**: Natural turn-taking and conversation rhythm
- **Real-time video conversations** with sub-1-second latency
- **Crisis intervention** with human-in-the-loop escalation
- **Multilingual support** with cultural adaptation

## Reference Documentation
- [Tavus CVI Documentation](https://docs.tavus.io/)