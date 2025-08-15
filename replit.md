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
- **User Data**: Firestore for user profiles and reflections
- **Short-term Memory**: Firestore for daily chat messages
- **Long-term Memory**: PostgreSQL for conversation summaries and insights
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication System
- Firebase Authentication for user management
- JWT token-based session handling
- Profile setup flow for new users
- Secure sign-up/sign-in with email and password

### Chat Interface
- Real-time AI conversation through RunPod/Ollama integration
- Message persistence with conversation history
- Daily reflection sessions with date-based organization
- Contextual AI responses using conversation history

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
2. **Daily Reflection**: Date Selection → Chat Interface → AI Processing → Message Storage
3. **Conversation Management**: Message History → Context Building → AI Response → Persistence
4. **Data Persistence**: Real-time sync between Firebase and local state

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
- August 15, 2025. Fixed deployment CORS dependency issue - added 'cors' package to production dependencies
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```