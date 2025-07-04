# Deite - AI Mental Health Companion

## Overview

Deite is a mental health companion application that combines therapy and reflection through AI-powered conversations. The application provides users with a private, secure space to engage in daily reflections through conversational AI interactions, helping them process thoughts and emotions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for auth and theme state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds
- **Animations**: Framer Motion for smooth transitions and interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints with external AI service integration
- **Middleware**: CORS, JSON parsing, request logging

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM  
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Firebase Authentication
- **User Data**: Firestore for user profiles
- **Reflection Storage**: Firebase subcollections with per-user daily reflections
- **Chat Storage**: Firebase arrays within daily reflection documents
- **Long-term Memory**: PostgreSQL for additional analytics and insights
- **Schema Management**: Drizzle Kit for migrations and schema management

### Firebase Reflection Structure
```
users (collection)
  └── {userId} (document)
        ├── name, email, etc.
        └── reflections (subcollection)
              └── {YYYY-MM-DD} (document)
                    ├── chat: [Array of messages]
                    └── reflection: "text summary of the day"
                    └── createdAt: timestamp
```

## Key Components

### Authentication System
- Firebase Authentication for user management
- JWT token-based session handling
- Profile setup flow for new users
- Secure sign-up/sign-in with email and password

### Chat Interface
- Real-time AI conversation through RunPod/Ollama integration
- Firebase-based message persistence with per-user daily organization
- Automatic reflection generation and storage
- Load existing conversations when reopening past dates
- No duplicate reflections - existing reflections are preserved

### User Interface
- Multi-screen application flow (Splash → Onboarding → Auth → Profile → Dashboard → Chat)
- Responsive design with mobile-first approach
- Dark/light theme support with system preference detection
- Calendar-based reflection navigation

### AI Integration
- External AI service (RunPod with Llama3 model)
- Anthropic Claude integration as primary AI service
- Dual-layer memory system (short-term + long-term)
- Conversation context management with persistent memory
- Prompt engineering for therapeutic responses with memory injection
- Error handling and timeout management
- Daily conversation summarization for long-term insights

## Data Flow

1. **User Registration**: Firebase Auth → Profile Creation → Firestore Storage
2. **Daily Reflection**: Date Selection → Load Existing or Start New → Chat Interface → AI Processing
3. **Message Storage**: Each chat message saved to Firebase subcollection array immediately
4. **Reflection Generation**: AI-generated summary saved only once per day
5. **Data Persistence**: Direct Firebase integration with subcollection structure

## External Dependencies

### Core Dependencies
- **Firebase**: Authentication and Firestore database
- **Drizzle ORM**: Database operations and schema management
- **RunPod/Ollama**: AI model hosting and inference
- **Neon Database**: PostgreSQL hosting
- **Axios**: HTTP client for API requests

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library
- **React Hook Form**: Form state management
- **Zod**: Schema validation

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Internal port 5000, external port 80
- **Hot Reload**: Vite dev server with HMR support

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundling for Node.js deployment
- **Deployment Target**: Autoscale deployment on Replit
- **Environment Variables**: Database URL and Firebase configuration

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Environment-based DATABASE_URL configuration
- **ORM**: Type-safe database operations with Drizzle

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Implemented AI Memory System with short-term (Firestore) and long-term (PostgreSQL) memory
- July 4, 2025. Migrated to Firebase subcollection structure for reflections and chat storage
- July 4, 2025. Implemented per-user daily reflection system with automatic AI summarization
- July 4, 2025. Added load existing reflection functionality to prevent duplicate generation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```