# Design Guidelines: Professional Task Management App

## Architecture Decisions

### Authentication
**Required** - Team collaboration app with multi-user features.

**Implementation:**
- Use Replit Auth with SSO (Google, GitHub, Apple Sign-In)
- Login/Signup screens with privacy policy & terms of service links
- Account screen features:
  - User avatar (uploadable)
  - Display name and email
  - Team membership display
  - Log out (with confirmation alert)
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation Structure
**Tab Bar Navigation** (5 tabs with center action button)

**Tabs:**
1. **Dashboard** - Project overview and recent activity
2. **Tasks** - Personal and team task lists
3. **Create** (Center FAB) - Quick task/project creation
4. **Team** - Team members and collaboration
5. **Profile** - User settings and preferences

**Modal Screens:**
- Task Detail (full-screen modal)
- Project Settings
- File Viewer
- Team Member Profile

## Screen Specifications

### 1. Dashboard Screen
**Purpose:** Overview of active projects and recent activity

**Layout:**
- Transparent header with greeting and notification bell (right button)
- Scrollable content area
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Welcome header with user name
- Project cards (horizontal scroll)
- "Recent Activity" feed with task updates
- Quick stats (tasks due today, in progress, completed this week)

### 2. Tasks Screen
**Purpose:** View and manage all tasks with filtering

**Layout:**
- Default navigation header with filter icon (right button)
- Search bar in header
- Scrollable list view
- Top inset: Spacing.xl (non-transparent header)
- Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Status filter chips (To Do, In Progress, In Review, Completed)
- Task cards with:
  - Task title
  - Project badge
  - Priority indicator (color-coded)
  - Assignee avatar(s)
  - Due date
  - Unread chat count badge

### 3. Create (FAB)
**Purpose:** Quick creation modal for tasks or projects

**Layout:**
- Native modal (bottom sheet style)
- Two large options: "New Task" and "New Project"
- Cancel button at bottom

### 4. Task Detail Screen
**Purpose:** Complete task information with chat and attachments

**Layout:**
- Custom header with back button (left), edit and menu icons (right)
- Scrollable content area
- Floating chat bubble button (bottom right)
- Top inset: headerHeight + Spacing.xl
- Bottom inset: insets.bottom + Spacing.xl

**Components:**
- Task title (large, bold)
- Status dropdown
- Priority selector
- Assignee selector (multi-select with avatars)
- Due date picker
- Description text area
- Attachments section (horizontal scroll of thumbnails)
- Chat thread (expandable section or modal)
- Attachment upload button

**Chat Modal:**
- Full-screen modal
- Message list with avatars
- Text input at bottom with attach and send buttons

### 5. Team Screen
**Purpose:** View team members and manage invitations

**Layout:**
- Default navigation header with invite icon (right button)
- Scrollable list view
- Top inset: Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Team member cards with:
  - Avatar
  - Name and role
  - Active tasks count
  - Online status indicator
- "Invite Member" button at top

### 6. Profile Screen
**Purpose:** User settings and app preferences

**Layout:**
- Transparent header
- Scrollable content
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- User avatar (large, uploadable)
- Display name and email
- Settings sections:
  - Notifications preferences
  - Theme selector (Light/Dark/Auto)
  - Language
- Account section with logout and delete account

### 7. Project Detail Screen
**Purpose:** Project overview with task breakdown

**Layout:**
- Custom header with back button and settings icon
- Scrollable content
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Components:**
- Project header with name and description
- Progress bar
- Task breakdown by status
- Team members assigned
- Recent updates

## Design System

### Color Palette
**Primary Colors:**
- Primary Blue: #2563EB (actions, interactive elements)
- Primary Dark: #1E40AF (pressed states)

**Status Colors:**
- To Do: #94A3B8 (gray)
- In Progress: #F59E0B (amber)
- In Review: #8B5CF6 (purple)
- Completed: #10B981 (green)

**Priority Colors:**
- High: #EF4444 (red)
- Medium: #F59E0B (amber)
- Low: #6B7280 (gray)

**Neutrals:**
- Background: #FFFFFF (light), #0F172A (dark)
- Surface: #F8FAFC (light), #1E293B (dark)
- Border: #E2E8F0 (light), #334155 (dark)
- Text Primary: #0F172A (light), #F1F5F9 (dark)
- Text Secondary: #64748B

### Typography
**Font Family:** System default (San Francisco for iOS, Roboto for Android)

**Scale:**
- Display: 32px, Bold
- Heading 1: 24px, Bold
- Heading 2: 20px, Semibold
- Body: 16px, Regular
- Caption: 14px, Regular
- Small: 12px, Regular

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

### Components

**Task Cards:**
- Background: Surface color
- Border radius: 12px
- Padding: lg
- Border: 1px solid Border color
- Press feedback: Scale 0.98, slight opacity reduction

**Floating Action Button (Create):**
- Size: 56x56px
- Border radius: 28px (circle)
- Background: Primary Blue
- Icon: Plus (white)
- Drop shadow:
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Press feedback: Scale 0.95

**Avatar:**
- Sizes: Small (32px), Medium (48px), Large (80px)
- Border radius: 50% (circle)
- Fallback: Initials on colored background

**Status Badges:**
- Padding: sm horizontal, xs vertical
- Border radius: 16px
- Color: Background matches status color at 10% opacity
- Text: Status color at full opacity

**Buttons:**
- Primary: Primary Blue background, white text, 12px border radius
- Secondary: Transparent background, Primary Blue border and text
- Height: 48px
- Press feedback: Opacity 0.7

**Icons:**
- Use Feather icons from @expo/vector-icons
- Standard size: 24px
- Navigation icons: 20px
- Never use emojis

### Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for text, 3:1 for UI elements
- Support Dynamic Type (iOS) and font scaling (Android)
- Provide text alternatives for icons
- Support screen readers with proper labels

### Critical Assets
**Generate these assets:**
1. Default user avatars (5 options):
   - Geometric patterns in brand colors
   - Abstract shapes representing teamwork
2. Empty state illustrations:
   - No tasks
   - No projects
   - No team members
3. Project category icons (6-8 options):
   - Development, Design, Marketing, Sales, etc.
   - Simple, line-based style matching Feather icons