# O&N Home Renovation - Replit Project Guide

## Overview

This is a full-stack web application for O&N Home Renovation, a luxury home renovation company in Dubai. The application features a modern, responsive design with a contact form system for potential clients to submit renovation inquiries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom Dubai-themed colors
- **State Management**: TanStack Query for server state, React hooks for local state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage (development) with planned PostgreSQL integration
- **API Design**: RESTful endpoints with JSON responses

## Key Components

### Frontend Components
1. **Navigation**: Sticky navigation with smooth scrolling
2. **Hero Section**: Full-screen banner with call-to-action buttons
3. **Services**: Grid layout showcasing renovation services
4. **Portfolio**: Filterable gallery of completed projects
5. **About**: Company information and mission statement
6. **Testimonials**: Client reviews and ratings
7. **Contact Form**: Multi-field form with validation
8. **Footer**: Company links and social media

### Backend Components
1. **Express Server**: Main application server with middleware
2. **API Routes**: Contact form submission and retrieval endpoints
3. **Data Storage**: Abstracted storage interface supporting in-memory and database operations
4. **Schema Validation**: Zod schemas for type-safe data validation

## Data Flow

### Contact Form Submission
1. User fills out contact form on frontend
2. Form data validated using Zod schema
3. POST request sent to `/api/contact` endpoint
4. Backend validates data and stores contact request
5. Success/error response sent back to frontend
6. Toast notification displayed to user

### Data Storage
- **Development**: In-memory storage for quick testing
- **Production**: PostgreSQL database with Drizzle ORM
- **Schema**: Separate tables for users and contact requests

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React ecosystem (React, React DOM)
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter and Playfair Display)
- **Date Handling**: date-fns for date formatting

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Session Store**: connect-pg-simple for PostgreSQL sessions

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full TypeScript support across stack
- **Development Server**: Express with Vite integration
- **Hot Reload**: Vite HMR for frontend, tsx for backend

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Node.js server to `dist/index.js`
3. **Static Assets**: Served from built frontend directory

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Development**: Local development with file watching
- **Production**: Optimized builds with static file serving

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database instance
- Environment variables for database connection
- Static file serving capability

## Key Features

### User Experience
- Responsive design for all device sizes
- Smooth scrolling navigation
- Image optimization and lazy loading
- Form validation with user-friendly error messages
- Toast notifications for user feedback

### Business Features
- Contact form with service selection
- Client testimonials display
- Portfolio filtering by renovation type
- Company information and mission
- Social media integration

### Technical Features
- Type-safe development with TypeScript
- Component-based architecture
- Reusable UI components
- Database schema migrations
- API error handling and validation

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Set up database: Configure `DATABASE_URL`
3. Run migrations: `npm run db:push`
4. Start development server: `npm run dev`

### Database Management
- Schema defined in `shared/schema.ts`
- Migrations handled by Drizzle Kit
- Development uses in-memory storage fallback
- Production requires PostgreSQL connection

This architecture provides a solid foundation for a luxury home renovation website with room for future enhancements like user authentication, project galleries, and booking systems.