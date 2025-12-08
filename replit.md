# TaskFlow - Team Task Management App

## Overview
TaskFlow is a professional task management mobile application built with Expo (React Native) for team collaboration. Users can manage projects, tasks, team members, and collaborate through task-specific chat functionality.

## Current State
The app is fully implemented with:
- User authentication (register/login with JWT)
- Project management (create, view, delete projects)
- Task management (CRUD operations with status and priority)
- Team collaboration (invite members, view team)
- Task chat with comments and file attachments
- Professional UI with iOS-style design

## Tech Stack
- **Frontend**: Expo (React Native) with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **State Management**: TanStack React Query

## Project Structure
```
client/
  App.tsx                 - Main app entry with providers
  lib/
    auth-context.tsx      - Authentication context and hooks
    query-client.ts       - API request helpers and React Query setup
  navigation/
    RootStackNavigator.tsx - Main navigation with auth flow
    MainTabNavigator.tsx   - Bottom tab navigator
  screens/
    AuthScreen.tsx        - Login/register screen
    DashboardScreen.tsx   - Home screen with overview
    TasksScreen.tsx       - Task list with filters
    TeamScreen.tsx        - Team members list
    ProfileScreen.tsx     - User profile settings
    TaskDetailScreen.tsx  - Task details and editing
    ProjectDetailScreen.tsx - Project details
    CreateModal.tsx       - Create project/task modal
    TaskChatScreen.tsx    - Task comments/chat
  components/
    Avatar.tsx            - User avatar component
    StatusBadge.tsx       - Task status indicator
    PriorityBadge.tsx     - Task priority indicator
    TaskCard.tsx          - Task list item card
  constants/
    theme.ts              - Design tokens and colors

server/
  index.ts               - Express server entry
  routes.ts              - API route handlers
  auth.ts                - Authentication middleware
  prisma.ts              - Prisma client instance

prisma/
  schema.prisma          - Database schema
  prisma.config.ts       - Prisma configuration
```

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Update profile
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `GET /api/tasks` - List user tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `POST /api/tasks/:id/attachments` - Upload attachment
- `GET /api/team` - List team members

## Database Schema
- **User**: id, email, username, password, displayName, avatarUrl
- **Project**: id, name, description, color, createdById
- **ProjectMember**: id, projectId, userId, role
- **Task**: id, title, description, status, priority, dueDate, projectId, creatorId, assigneeId
- **Comment**: id, content, taskId, userId
- **Attachment**: id, filename, url, size, mimeType, taskId

## Design System
- Primary color: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Spacing scale: 4-48px
- Border radius: 8-32px

## User Preferences
- Using Prisma ORM (not Drizzle) as specified by user
- Professional blue color scheme
- iOS-style liquid glass design principles
