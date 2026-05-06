# Collaboration Components Spec

## Overview
Collaboration components enable real-time team collaboration features including task management, presence indicators, chat, and activity tracking.

## Components

### CollaborationSkeletonLoaders.tsx
Loading skeleton placeholders for collaboration UI elements.

### DailyCheckinBanner.tsx
Banner prompting users for daily check-ins.

### DraggableTaskCard.tsx
Draggable task card for kanban-style task boards.

### DroppableColumn.tsx
Droppable column container for task cards.

### MemberDetailModal.tsx
Modal displaying detailed member information and permissions.

### PresenceIndicator.tsx
Real-time presence indicator showing online/offline status.

### PresenceTest.tsx
Testing component for presence functionality.

### SubtaskList.tsx
List component displaying subtasks with completion status.

### SubtaskProgress.tsx
Progress bar for subtask completion.

### SubtaskViewModal.tsx
Modal for viewing and managing subtasks.

### TaskChat.tsx
Chat interface for task-specific discussions.

### TeamMembersList.tsx
List of team members with avatars and status.

### ThreadPanel.tsx
Side panel for viewing conversation threads.

### TodayCheckinsSection.tsx
Section displaying today's check-ins from team members.

## Key Features
- Real-time presence tracking
- Drag-and-drop task management
- Task chat and comments
- Subtask management
- Daily check-ins
- Team member visibility
- Activity notifications

## State Management
- PresenceContext for real-time presence
- React Query for data fetching
- Local state for UI interactions
- WebSocket for real-time updates

## API Calls
- GET /api/activities - Fetch activities
- POST /api/checkins - Create check-in
- GET /api/checkins/today - Get today's check-ins
- GET /api/subtasks/:taskId - Get subtasks
- POST /api/subtasks - Create subtask
- PATCH /api/subtasks/:id - Update subtask

## Dependencies
- react
- react-query
- react-dnd (drag and drop)
- socket.io-client (WebSocket)
- date-fns
- lucide-react (icons)

## Permissions
- view_all_tasks - View all team tasks
- create_task - Create new tasks
- update_task - Update existing tasks
- delete_task - Delete tasks
- create_subtask - Create subtasks
- assign_task - Assign tasks to members
