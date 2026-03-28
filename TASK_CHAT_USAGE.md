# Task Chat - Frontend Usage Guide

## 📦 Component: TaskChat

Location: `src/components/TaskChat.tsx`

### Props:
```typescript
interface TaskChatProps {
  taskId: string;        // ID of the task
  taskTitle: string;     // Title to display in header
  currentUserId: string; // Current user's ID
  onClose: () => void;   // Callback to close modal
}
```

### Features:
- ✅ Real-time messaging with Socket.io
- ✅ Auto-scroll to latest message
- ✅ Message grouping (own vs others)
- ✅ Sender name display
- ✅ Relative timestamps (e.g., "2m ago", "1h ago")
- ✅ Empty state UI
- ✅ Loading state
- ✅ Enter to send (Shift+Enter for new line)
- ✅ Responsive design

### Usage in Collaboration.tsx:

```tsx
// 1. Import the component
import TaskChat from '../../components/TaskChat';

// 2. Add state for chat
const [chatTask, setChatTask] = useState<Task | null>(null);

// 3. Add chat button to TaskCard
<button
  onClick={() => onOpenChat(task)}
  className="text-gray-400 hover:text-indigo-600"
>
  <MessageSquare className="h-4 w-4" />
</button>

// 4. Render the modal
{chatTask && currentUser && (
  <TaskChat
    taskId={chatTask.id}
    taskTitle={chatTask.title}
    currentUserId={currentUser.id}
    onClose={() => setChatTask(null)}
  />
)}
```

## 🎨 UI/UX Details:

### Message Display:
- **Own messages**: Right-aligned, indigo background
- **Other messages**: Left-aligned, gray background
- **Sender name**: Shown above message (for others only)
- **Timestamp**: Below message, relative format

### Interactions:
- Click chat icon on task card → Opens modal
- Type message → Press Enter to send
- Shift+Enter → New line in message
- Click X or outside → Close modal
- Auto-scroll → Latest message always visible

### States:
1. **Loading**: Spinner while fetching messages
2. **Empty**: "No messages yet" with icon
3. **Messages**: Scrollable list with input

## 🔌 Socket.io Integration:

### Connection:
```typescript
const socket = io(API_BASE, {
  withCredentials: true,
});
```

### Events:
```typescript
// Join task room
socket.emit('joinTask', taskId);

// Listen for new messages
socket.on('newMessage', (message) => {
  setMessages(prev => [...prev, message]);
});

// Leave room on unmount
socket.emit('leaveTask', taskId);
socket.disconnect();
```

## 🎯 Best Practices:

1. **Always pass currentUserId** - Required for message ownership
2. **Clean up socket** - Disconnect on component unmount
3. **Handle errors** - Show user-friendly error messages
4. **Validate input** - Don't send empty messages
5. **Auto-scroll** - Keep latest message visible

## 🐛 Troubleshooting:

### Messages not appearing in real-time:
- Check Socket.io connection in browser console
- Verify backend is running
- Check CORS settings in backend

### Can't send messages:
- Verify user is authenticated
- Check task access permissions
- Verify API endpoint is correct

### Scroll not working:
- Check `messagesEndRef` is properly set
- Verify `scrollToBottom()` is called on message update

## 🚀 Future Enhancements:

- [ ] Message editing
- [ ] Message deletion
- [ ] File attachments
- [ ] Emoji picker
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Search messages
- [ ] Message notifications
