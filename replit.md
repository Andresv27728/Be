# Overview

This project is a comprehensive WhatsApp bot application called "Gawr Gura Bot" - a feature-rich messaging bot with a modern web dashboard for management and monitoring. The application provides real-time chat capabilities, command management, user analytics, and administrative controls through a sleek React-based interface with an Express.js backend.

The bot includes advanced features like interactive games (trivia), sticker generation, user leveling systems, and comprehensive analytics. The dashboard allows administrators to monitor bot performance, manage commands, view chat activity, and handle bot connectivity through QR code or PIN-based authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## August 6, 2025 - Multi-Platform Deployment & Production Ready
- ✅ Fixed WhatsApp library import compatibility for all platforms (Render, Heroku, Railway)
- ✅ Created universal production launcher `start-production.js` with auto-detection
- ✅ Implemented auto-cleanup system that deletes auth files after failed reconnections
- ✅ Fixed real-time statistics to show zeros when bot is disconnected
- ✅ Completed CRUD commands functionality with WebSocket broadcasting
- ✅ Added restart button to connection page for session cleanup
- ✅ Created comprehensive deployment guide (DEPLOYMENT.md) for external platforms
- ✅ Built Docker configuration for VPS/dedicated server deployment
- ✅ Added standalone bot mode (bot-standalone.js) for headless operation
- ✅ Created automated deployment script (external-deploy.sh) for easy setup
- ✅ Enhanced server configuration for external hosting (0.0.0.0 binding)
- ✅ Made bot platform-independent and ready for production deployment

## August 2, 2025 - Migration & Deployment Setup
- ✅ Successfully migrated project from Replit Agent to standard Replit environment
- ✅ Fixed 8-digit PIN connection system with proper async/await handling
- ✅ Implemented real-time statistics synchronization (updates every 10 seconds)
- ✅ Created dynamic hourly data based on time of day with realistic multipliers
- ✅ Added WebSocket broadcasting for statistics updates
- ✅ Created simplified Spanish README with clear project structure
- ✅ Added comprehensive .gitignore to prevent unnecessary file uploads
- ✅ Fixed all TypeScript compilation errors and LSP diagnostics
- ✅ Created universal deployment launcher `start.js` with auto-detection
- ✅ Added deployment configs for Render, Railway, Vercel, and Netlify
- ✅ Created comprehensive deployment guide in README and DEPLOY.md
- ✅ Made bot ready for one-click deployment on major platforms
- ✅ Implemented download commands with free APIs (YouTube, TikTok, Instagram, Twitter, Facebook)
- ✅ Added URL validation and async processing for all download platforms
- ✅ Enhanced help command with organized categories and emoji indicators

## August 2, 2025 - Production-Ready Deployment & Console Optimization
- ✅ Implemented intelligent auto-reconnection system with exponential backoff (5s→10s→15s→20s→25s)
- ✅ Enhanced console logging with beautiful ASCII art banner and emoji indicators
- ✅ Simplified console output to show only essential bot messages (📥/📤)
- ✅ Silenced technical JSON logs and API request noise for clean monitoring
- ✅ Added production deployment configurations (Vercel, Render, Docker)
- ✅ Implemented 15+ bot commands including entertainment, utilities, and games
- ✅ Created real-time message feed with WebSocket integration
- ✅ Updated modern UI with improved sidebar design and gradients
- ✅ Added comprehensive README with deployment instructions and auto-reconnection details
- ✅ Ensured compatibility with Render, Vercel, and Docker platforms
- ✅ Bot auto-starts when server launches and reconnects automatically on disconnection

## August 1, 2025 - Advanced WhatsApp Integration Features
- ✅ Implemented configurable command prefix system with multiple prefixes (/, !, ., #, $)
- ✅ Added 8-digit PIN code pairing as alternative to QR code authentication
- ✅ Created comprehensive bot configuration system in server/bot-config.ts
- ✅ Enhanced command system with aliases and categorization
- ✅ Added security authentication for admin and chat pages (password: gawr2024)
- ✅ Implemented dual connection methods (QR + PIN) with modern tabbed interface
- ✅ Added WebSocket events for real-time pairing code notifications
- ✅ Enhanced sidebar with authentication status indicators and locked/unlocked sections

# System Architecture

## Frontend Architecture
The client uses React with TypeScript and is built with Vite for fast development and optimized production builds. The UI framework is based on shadcn/ui components with Radix UI primitives, providing a consistent and accessible design system. The application uses Wouter for lightweight client-side routing and TanStack Query for efficient server state management with real-time updates.

The styling approach combines Tailwind CSS for utility-first styling with custom CSS variables for theming. The design implements a marine/ocean theme with custom gradients and animations to match the "Gawr Gura" shark character branding.

## Backend Architecture
The server is built with Express.js and TypeScript, implementing a RESTful API architecture. The application uses a modular route structure with WebSocket support for real-time features like live chat updates and bot status monitoring. The server includes comprehensive logging middleware and error handling for production reliability.

The storage layer is abstracted through an interface-based design (`IStorage`) with both in-memory and database implementations. This allows for flexible deployment options and easy testing with mock data.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, groups, messages, commands, statistics, and bot status tracking. The database configuration uses Neon serverless PostgreSQL for scalable cloud deployment.

Key entities include:
- Users with leveling and experience systems
- Groups with customizable settings
- Messages with metadata for different content types
- Commands with usage tracking
- Daily statistics for analytics
- Bot status for connectivity monitoring

## Real-time Communication
WebSocket implementation provides real-time updates for chat messages, bot status changes, and system notifications. The client automatically reconnects on connection loss and handles various message types for different bot events.

## Authentication & Bot Integration
The application supports multiple WhatsApp connection methods including QR code scanning and PIN-based authentication. The bot status is continuously monitored with automatic reconnection capabilities and comprehensive error handling.

## State Management
The frontend uses TanStack Query for server state management with optimistic updates and automatic background synchronization. Local component state is managed with React hooks, while global UI state (like toasts and modals) uses context providers.

# External Dependencies

## UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives for building the component system
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Class Variance Authority**: Type-safe utility for managing component variants and conditional styling

## Data and State Management
- **TanStack Query**: Powerful data synchronization for React with caching, background updates, and optimistic mutations
- **React Hook Form**: Performant form library with minimal re-renders and comprehensive validation
- **Zod**: TypeScript-first schema validation for API endpoints and form validation

## Development and Build Tools
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static typing for enhanced developer experience and code reliability
- **ESBuild**: Fast JavaScript bundler for production builds

## Database and ORM
- **Drizzle ORM**: Lightweight, type-safe SQL ORM with excellent TypeScript integration
- **Neon Database**: Serverless PostgreSQL for scalable cloud deployment
- **Drizzle Kit**: Database migration and schema management tools

## Server Infrastructure
- **Express.js**: Web framework for building RESTful APIs and middleware integration
- **WebSocket (ws)**: Real-time bidirectional communication for live updates
- **Connect PG Simple**: PostgreSQL session store for user session management

## Utilities and Enhancements
- **Date-fns**: Modern JavaScript date utility library for date formatting and manipulation
- **Nanoid**: URL-safe unique string ID generator for various application entities
- **CLSX & TWMerge**: Utility functions for conditional CSS class management