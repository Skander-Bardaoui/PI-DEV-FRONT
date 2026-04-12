import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  Users,
  Bell,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  Mail,
  MessageSquare,
  FileText,
  Settings,
  Filter,
  Loader2,
  Trash2,
  Edit,
  Sparkles,
  Check,
  X,
  BarChart2,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import TaskChat from '../../components/TaskChat';
import DroppableColumn from '../../components/DroppableColumn';
import DraggableTaskCard from '../../components/DraggableTaskCard';
import SubtaskList from '../../components/SubtaskList';
import SubtaskViewModal from '../../components/SubtaskViewModal';
import DailyCheckinBanner from '../../components/DailyCheckinBanner';
import TodayCheckinsSection from '../../components/TodayCheckinsSection';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { activitiesApi, Activity } from '../../api/activities.api';
import StatisticsDashboard from '../../components/StatisticsDashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  is_active: boolean;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    role?: string;
  };
}

interface Business {
  id: string;
  name: string;
  tenant_id: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  assignedTo?: User[];
  dueDate?: string;
  businessId?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColors = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const priorityLabels = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// Avatar colors pool — assigned by index so each member gets a stable color
const avatarColors = [
  'bg-indigo-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
];

function ensureArray<T>(data: any, key?: string): T[] {
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data[key])) return data[key];
  return [];
}

function getMemberName(member: TeamMember): string {
  if (member.user.firstName || member.user.lastName) {
    return `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim();
  }
  return member.user.name ?? member.user.email ?? 'Unknown';
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// ─── API calls ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function fetchMyBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_BASE}/businesses/my`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch businesses');
  const data = await res.json();
  return ensureArray<Business>(data, 'businesses');
}

async function fetchBusinessMembers(businessId: string): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/members`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();
  return ensureArray<TeamMember>(data, 'members');
}

async function fetchTasks(businessId: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks/business/${businessId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return ensureArray<Task>(data, 'tasks');
}

async function createTask(taskData: Partial<Task>): Promise<Task> {
  const payload = {
    ...taskData,
    assignedToIds: taskData.assignedTo?.map(u => u.id) || [],
  };
  delete (payload as any).assignedTo;
  
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const payload = {
    ...updates,
    assignedToIds: updates.assignedTo?.map(u => u.id),
  };
  delete (payload as any).assignedTo;
  
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

async function fetchActivities(businessId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/activities/business/${businessId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null); // Pour TEAM_MEMBER

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Chat state
  const [chatTask, setChatTask] = useState<Task | null>(null);

  // Drag and drop state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    assignedToIds: [] as string[],
    dueDate: '',
  });

  // AI Priority Detection state
  const [aiSuggestedPriority, setAiSuggestedPriority] = useState<Task['priority'] | null>(null);
  const [detectingPriority, setDetectingPriority] = useState(false);

  // AI Description Improvement state
  const [improvingDescription, setImprovingDescription] = useState(false);
  const [aiImprovedDescription, setAiImprovedDescription] = useState<string | null>(null);

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Daily check-in state
  const [refreshCheckins, setRefreshCheckins] = useState(0);

  // Check if user can manage tasks
  const canManageTasks = currentUser?.role === 'BUSINESS_OWNER' || currentUser?.role === 'BUSINESS_ADMIN';

  // Filter tasks assigned to current user
  const myAssignedTasks = tasks.filter(
    (task) => task.assignedTo?.some((u) => u.id === currentUser?.id)
  );

  // ── Load current user, businesses, members, and tasks on mount ─────────────
  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch (err: any) {
        console.error('Failed to load user:', err);
      }

      setLoadingMembers(true);
      setMembersError(null);
      try {
        const fetchedBusinesses = await fetchMyBusinesses();
        if (fetchedBusinesses.length === 0) {
          setMembersError('Aucun business trouvé pour votre compte.');
          return;
        }
        setBusinesses(fetchedBusinesses);
        const business = fetchedBusinesses[0];
        setCurrentBusiness(business);
        const members = await fetchBusinessMembers(business.id);
        setTeamMembers(members);

        // Load tasks
        setLoadingTasks(true);
        setTasksError(null);
        try {
          const fetchedTasks = await fetchTasks(business.id);
          setTasks(fetchedTasks);
        } catch (err: any) {
          setTasksError(err.message ?? 'Failed to load tasks');
        } finally {
          setLoadingTasks(false);
        }
      } catch (err: any) {
        setMembersError(err.message ?? 'Erreur lors du chargement des membres.');
      } finally {
        setLoadingMembers(false);
      }
    }
    loadData();
  }, []);

  // ── Redirect to tasks tab if user doesn't have permission for current tab ──
  useEffect(() => {
    if (!currentUser) return;
    
    // If user is TEAM_MEMBER or ACCOUNTANT and trying to access activity or statistics
    if (
      (currentUser.role === 'TEAM_MEMBER' || currentUser.role === 'ACCOUNTANT') &&
      (activeTab === 'activity' || activeTab === 'statistics')
    ) {
      setActiveTab('tasks');
    }
  }, [currentUser, activeTab]);

  // ── WebSocket connection for real-time updates ────────────────────────────
  useEffect(() => {
    if (!currentBusiness) return;

    const newSocket = io(API_BASE, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('joinBusiness', currentBusiness.id);
    });

    newSocket.on('taskMoved', (data: {
      taskId: string;
      newStatus: string;
      newOrder: number;
      movedBy: string;
    }) => {
      // Update task in local state if moved by another user
      if (data.movedBy !== currentUser?.id) {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((t) => t.id === data.taskId);
          if (taskIndex === -1) return prevTasks;

          const updatedTasks = [...prevTasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: data.newStatus as Task['status'],
          };

          return updatedTasks;
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveBusiness', currentBusiness.id);
      newSocket.disconnect();
    };
  }, [currentBusiness, currentUser]);

  // ── Load activities when business changes or tab switches to 'activity' ────
  useEffect(() => {
    if (!currentBusiness || activeTab !== 'activity') return;

    async function loadActivities() {
      console.log('🔄 Loading activities for business:', currentBusiness.id);
      setLoadingActivities(true);
      setActivitiesError(null);
      try {
        const fetchedActivities = await activitiesApi.getByBusiness(currentBusiness.id);
        console.log('✅ Received activities:', fetchedActivities.length, fetchedActivities);
        setActivities(fetchedActivities);
      } catch (err: any) {
        console.error('❌ Failed to load activities:', err);
        setActivitiesError(err.message ?? 'Failed to load activities');
      } finally {
        setLoadingActivities(false);
      }
    }

    loadActivities();
  }, [currentBusiness, activeTab]);

  // ── Filtered members by search ────────────────────────────────────────────
  const filteredMembers = teamMembers.filter((m) => {
    const name = getMemberName(m).toLowerCase();
    const email = (m.user.email ?? '').toLowerCase();
    const role = m.role.toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  // ── Tasks by status ────────────────────────────────────────────────────────
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
    BLOCKED: tasks.filter((t) => t.status === 'BLOCKED'),
  };

  // ── Handle create task ─────────────────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!newTaskForm.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    if (!currentBusiness) {
      alert('No business selected');
      return;
    }

    try {
      const assignedUsers = newTaskForm.assignedToIds
        .map(id => teamMembers.find(m => m.user_id === id)?.user)
        .filter(Boolean) as User[];

      const taskData: Partial<Task> = {
        title: newTaskForm.title,
        description: newTaskForm.description || undefined,
        priority: newTaskForm.priority,
        assignedTo: assignedUsers,
        dueDate: newTaskForm.dueDate || undefined,
        status: 'TODO',
        businessId: currentBusiness.id,
      };
      const created = await createTask(taskData);
      setTasks([...tasks, created]);
      setShowNewTask(false);
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignedToIds: [],
        dueDate: '',
      });
    } catch (err: any) {
      alert(err.message ?? 'Failed to create task');
    }
  };

  // ── Handle update task status ──────────────────────────────────────────────
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err: any) {
      alert(err.message ?? 'Failed to update task');
    }
  };

  // ── Handle delete task ─────────────────────────────────────────────────────
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete task');
    }
  };

  // ── Handle edit task ───────────────────────────────────────────────────────
  const handleEditTask = (task: Task) => {
    // Si TEAM_MEMBER, ouvrir le modal de vue des subtasks
    if (currentUser?.role === 'TEAM_MEMBER' || currentUser?.role === 'ACCOUNTANT') {
      setViewingTask(task);
      return;
    }

    // Sinon, ouvrir le modal d'édition complet
    setEditingTask(task);
    setNewTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedToIds: task.assignedTo?.map(u => u.id) || [],
      dueDate: task.dueDate || '',
    });
    setShowNewTask(true);
  };

  // ── Handle update task ─────────────────────────────────────────────────────
  const handleUpdateTask = async () => {
    if (!editingTask) return;
    if (!newTaskForm.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const assignedUsers = newTaskForm.assignedToIds
        .map(id => teamMembers.find(m => m.user_id === id)?.user)
        .filter(Boolean) as User[];

      const updates: Partial<Task> = {
        title: newTaskForm.title,
        description: newTaskForm.description || undefined,
        priority: newTaskForm.priority,
        assignedTo: assignedUsers,
        dueDate: newTaskForm.dueDate || undefined,
      };
      const updated = await updateTask(editingTask.id, updates);
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)));
      setShowNewTask(false);
      setEditingTask(null);
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignedToIds: [],
        dueDate: '',
      });
    } catch (err: any) {
      alert(err.message ?? 'Failed to update task');
    }
  };

  // ── Close modal ────────────────────────────────────────────────────────────
  const handleCloseTaskModal = () => {
    setShowNewTask(false);
    setEditingTask(null);
    setAiSuggestedPriority(null);
    setDetectingPriority(false);
    setImprovingDescription(false);
    setAiImprovedDescription(null);
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToIds: [],
      dueDate: '',
    });
  };

  // ── Toggle assigned member ─────────────────────────────────────────────────
  const toggleAssignedMember = (userId: string) => {
    setNewTaskForm(prev => ({
      ...prev,
      assignedToIds: prev.assignedToIds.includes(userId)
        ? prev.assignedToIds.filter(id => id !== userId)
        : [...prev.assignedToIds, userId],
    }));
  };

  // ── Detect priority with AI ────────────────────────────────────────────────
  const handleDetectPriority = async () => {
    // Ne pas détecter si on édite une tâche existante
    if (editingTask) {
      console.log('⏭️  Skipping AI detection - editing existing task');
      return;
    }

    const description = newTaskForm.description.trim();
    const title = newTaskForm.title.trim();

    console.log('🔍 handleDetectPriority called');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Description length:', description.length);

    // Only trigger if description has more than 10 characters
    if (description.length <= 10 || !title) {
      console.log('❌ Skipping AI detection - conditions not met');
      console.log('- Description length > 10:', description.length > 10);
      console.log('- Title exists:', !!title);
      return;
    }

    console.log('✅ Calling AI detection API...');
    setDetectingPriority(true);
    try {
      const response = await fetch(`${API_BASE}/tasks/detect-priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description }),
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI detected priority:', data.priority);
        setAiSuggestedPriority(data.priority);
        setNewTaskForm(prev => ({ ...prev, priority: data.priority }));
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
      }
    } catch (error) {
      // Silently ignore errors
      console.error('❌ Failed to detect priority:', error);
    } finally {
      setDetectingPriority(false);
      console.log('🏁 Detection finished');
    }
  };

  // ── Improve description with AI ────────────────────────────────────────────
  const handleImproveDescription = async () => {
    const description = newTaskForm.description.trim();
    const title = newTaskForm.title.trim();

    // Only trigger if description has more than 15 characters
    if (description.length <= 15) {
      toast.error('Description must be at least 16 characters');
      return;
    }

    setImprovingDescription(true);
    try {
      const response = await fetch(`${API_BASE}/tasks/improve-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title || undefined, description }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiImprovedDescription(data.improved);
      } else {
        toast.error('AI unavailable, try again');
      }
    } catch (error) {
      console.error('Failed to improve description:', error);
      toast.error('AI unavailable, try again');
    } finally {
      setImprovingDescription(false);
    }
  };

  // ── Apply AI improved description ──────────────────────────────────────────
  const handleApplyImprovedDescription = () => {
    if (aiImprovedDescription) {
      setNewTaskForm(prev => ({ ...prev, description: aiImprovedDescription }));
      setAiImprovedDescription(null);
      toast.success('AI suggestion applied');
    }
  };

  // ── Dismiss AI improved description ────────────────────────────────────────
  const handleDismissImprovedDescription = () => {
    setAiImprovedDescription(null);
  };

  // ── Handle business change ─────────────────────────────────────────────────
  const handleBusinessChange = async (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business) return;

    setCurrentBusiness(business);
    setLoadingMembers(true);
    setLoadingTasks(true);
    setMembersError(null);
    setTasksError(null);

    try {
      const members = await fetchBusinessMembers(businessId);
      setTeamMembers(members);
    } catch (err: any) {
      setMembersError(err.message ?? 'Failed to load members');
    } finally {
      setLoadingMembers(false);
    }

    try {
      const fetchedTasks = await fetchTasks(businessId);
      setTasks(fetchedTasks);
    } catch (err: any) {
      setTasksError(err.message ?? 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  // ── Drag and Drop Handlers ─────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find active and over tasks
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if over a column (status)
    const overColumn = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].includes(overId as string);
    
    if (overColumn) {
      const newStatus = overId as Task['status'];
      if (activeTask.status !== newStatus) {
        // Optimistically update UI
        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.map((t) =>
            t.id === activeId ? { ...t, status: newStatus } : t
          );
          return updatedTasks;
        });
      }
    } else {
      // Over another task - handle reordering
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask || activeTask.status !== overTask.status) return;

      setTasks((prevTasks) => {
        const oldIndex = prevTasks.findIndex((t) => t.id === activeId);
        const newIndex = prevTasks.findIndex((t) => t.id === overId);
        return arrayMove(prevTasks, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !currentUser) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine new status and order
    let newStatus: Task['status'] = activeTask.status;
    let newOrder = 0;

    // Check if dropped on a column
    const overColumn = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].includes(overId as string);
    
    if (overColumn) {
      newStatus = overId as Task['status'];
      // Get tasks in the new column
      const tasksInColumn = tasks.filter((t) => t.id !== activeId && t.status === newStatus);
      newOrder = tasksInColumn.length;
    } else {
      // Dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        const tasksInColumn = tasks.filter((t) => t.status === newStatus);
        const overIndex = tasksInColumn.findIndex((t) => t.id === overId);
        newOrder = overIndex >= 0 ? overIndex : 0;
      }
    }

    // Determine new priority based on status
    let newPriority: Task['priority'] = activeTask.priority;
    if (newStatus !== activeTask.status) {
      // Map status to priority
      const statusToPriority: Record<Task['status'], Task['priority']> = {
        TODO: 'LOW',
        IN_PROGRESS: 'MEDIUM',
        DONE: 'HIGH',
        BLOCKED: 'HIGH',
      };
      newPriority = statusToPriority[newStatus];
    }

    // Only make API call if something changed
    if (activeTask.status !== newStatus || activeTask.priority !== newPriority || activeId !== overId) {
      try {
        // Update both status and priority
        const updates: Partial<Task> = {
          status: newStatus,
          priority: newPriority,
        };

        const payload = { 
          status: newStatus, 
          priority: newPriority,
          order: newOrder 
        };
        
        console.log('Sending to backend:', payload);

        const response = await fetch(`${API_BASE}/tasks/${activeId}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to move task');
        }

        const updatedTask = await response.json();
        console.log('Received from backend:', updatedTask);

        // Update local state with the response from backend
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === activeId ? updatedTask : t
          )
        );

        toast.success(`Task moved to ${newStatus.replace('_', ' ')} with ${newPriority} priority`);
      } catch (err: any) {
        // Rollback on error
        toast.error('Failed to move task');
        console.error('Move task error:', err);
        // Reload tasks to get correct state
        if (currentBusiness) {
          const fetchedTasks = await fetchTasks(currentBusiness.id);
          setTasks(fetchedTasks);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Check-in Banner - Only for TEAM_MEMBER and ACCOUNTANT */}
      {currentUser && 
       (currentUser.role === 'TEAM_MEMBER' || currentUser.role === 'ACCOUNTANT') && 
       currentBusiness && (
        <DailyCheckinBanner
          businessId={currentBusiness.id}
          userFirstName={currentUser.firstName}
          assignedTasks={myAssignedTasks}
          onCheckinComplete={() => setRefreshCheckins(prev => prev + 1)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-500">
            {currentBusiness ? `Business : ${currentBusiness.name}` : 'Manage tasks, activity and teamwork'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {businesses.length > 1 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={currentBusiness?.id || ''}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm font-medium text-gray-700 appearance-none cursor-pointer min-w-[200px]"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {canManageTasks && (
            <button
              onClick={() => setShowNewTask(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['tasks', 'team', 'activity', 'statistics']
              .filter((tab) => {
                // Hide Activity and Statistics tabs for TEAM_MEMBER and ACCOUNTANT
                if (tab === 'activity' || tab === 'statistics') {
                  return currentUser?.role === 'BUSINESS_OWNER' || currentUser?.role === 'BUSINESS_ADMIN';
                }
                return true;
              })
              .map((tab) => {
                const icons = {
                  tasks: null,
                  team: null,
                  activity: null,
                  statistics: <BarChart2 className="h-4 w-4" />,
                };
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {icons[tab as keyof typeof icons]}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* ── Tasks Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {loadingTasks && (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span>Loading tasks...</span>
                </div>
              )}

              {!loadingTasks && tasksError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{tasksError}</span>
                </div>
              )}

              {!loadingTasks && !tasksError && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid lg:grid-cols-4 gap-4">
                    <DroppableColumn
                      label="TODO"
                      icon={<Circle className="h-5 w-5 text-gray-400" />}
                      status="TODO"
                      tasks={tasksByStatus.TODO}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onOpenChat={setChatTask}
                      canManage={canManageTasks}
                      teamMembers={teamMembers}
                    />
                    <DroppableColumn
                      label="IN PROGRESS"
                      icon={<Clock className="h-5 w-5 text-blue-500" />}
                      status="IN_PROGRESS"
                      tasks={tasksByStatus.IN_PROGRESS}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onOpenChat={setChatTask}
                      canManage={canManageTasks}
                      teamMembers={teamMembers}
                    />
                    <DroppableColumn
                      label="DONE"
                      icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                      status="DONE"
                      tasks={tasksByStatus.DONE}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onOpenChat={setChatTask}
                      canManage={canManageTasks}
                      teamMembers={teamMembers}
                    />
                    <DroppableColumn
                      label="BLOCKED"
                      icon={<XCircle className="h-5 w-5 text-red-500" />}
                      status="BLOCKED"
                      tasks={tasksByStatus.BLOCKED}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onOpenChat={setChatTask}
                      canManage={canManageTasks}
                      teamMembers={teamMembers}
                    />
                  </div>
                  <DragOverlay>
                    {activeTask ? (
                      <div className="rotate-3">
                        <DraggableTaskCard
                          task={activeTask}
                          onUpdateStatus={handleUpdateTaskStatus}
                          onDelete={handleDeleteTask}
                          onEdit={handleEditTask}
                          onOpenChat={setChatTask}
                          canManage={canManageTasks}
                          teamMembers={teamMembers}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          )}

          {/* ── Team Tab ────────────────────────────────────────────────────── */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setShowInviteMember(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" />
                  Invite Member
                </button>
              </div>

              {/* Loading state */}
              {loadingMembers && (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span>Chargement des membres...</span>
                </div>
              )}

              {/* Error state */}
              {!loadingMembers && membersError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{membersError}</span>
                </div>
              )}

              {/* Empty state */}
              {!loadingMembers && !membersError && filteredMembers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                  <Users className="h-12 w-12" />
                  <p className="text-lg font-medium text-gray-500">
                    {searchQuery ? 'Aucun membre ne correspond à votre recherche.' : 'Aucun membre dans ce business.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowInviteMember(true)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Inviter le premier membre
                    </button>
                  )}
                </div>
              )}

              {/* Members table */}
              {!loadingMembers && !membersError && filteredMembers.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nom</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Rôle</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Statut</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Rejoint le</th>
                        <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMembers.map((member, index) => {
                        const name = getMemberName(member);
                        const initials = getInitials(name);
                        const color = avatarColors[index % avatarColors.length];
                        const joinedDate = member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString('fr-TN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—';

                        return (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                                >
                                  {initials}
                                </div>
                                <span className="font-medium text-gray-900">{name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {formatRole(member.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {member.user.email}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                                  member.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    member.is_active ? 'bg-green-500' : 'bg-gray-400'
                                  }`}
                                />
                                {member.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {joinedDate}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                    {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} au total
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Activity Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Today's Check-ins Section - Only for OWNER and ADMIN */}
              {currentBusiness && 
               (currentUser?.role === 'BUSINESS_OWNER' || currentUser?.role === 'BUSINESS_ADMIN') && (
                <TodayCheckinsSection 
                  businessId={currentBusiness.id} 
                  key={refreshCheckins}
                />
              )}

              {loadingActivities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : activitiesError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">{activitiesError}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {activitiesError.includes('Only business owners') 
                      ? 'Activity feed is only visible to Business Owners and Admins'
                      : 'Please try again later'}
                  </p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No activities yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Team member actions will appear here
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {activities.map((activity, index) => {
                    const userName = activity.user.firstName && activity.user.lastName
                      ? `${activity.user.firstName} ${activity.user.lastName}`
                      : activity.user.email;
                    
                    let actionText = '';
                    let targetText = '';
                    let icon = CheckCircle2;
                    let color = 'text-green-600';
                    let bgColor = 'bg-gray-50';
                    let borderColor = 'border-gray-200';

                    if (activity.type === 'SUBTASK_COMPLETED' || activity.type === 'SUBTASK_COMPLETED_OVERDUE' || activity.type === 'SUBTASK_COMPLETED_ON_TIME') {
                      const isOverdue = activity.type === 'SUBTASK_COMPLETED_OVERDUE' || activity.isOverdue;
                      const isOnTime = activity.type === 'SUBTASK_COMPLETED_ON_TIME' || activity.isOnTime;
                      
                      if (isOverdue) {
                        actionText = 'completed subtask OVERDUE';
                        icon = AlertCircle;
                        color = 'text-orange-600';
                        bgColor = 'bg-orange-50';
                        borderColor = 'border-orange-200';
                      } else if (isOnTime) {
                        actionText = 'completed subtask ON TIME';
                        icon = CheckCircle2;
                        color = 'text-green-600';
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-200';
                      } else {
                        actionText = 'completed subtask';
                        icon = CheckCircle2;
                        color = 'text-green-600';
                      }
                      
                      targetText = activity.subtask?.title || 'Unknown subtask';
                      if (activity.task) {
                        targetText += ` in "${activity.task.title}"`;
                      }
                    } else if (activity.type === 'TASK_BLOCKED') {
                      actionText = 'moved task to BLOCKED';
                      targetText = activity.task?.title || 'Unknown task';
                      icon = XCircle;
                      color = 'text-red-600';
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-200';
                    } else if (activity.type === 'TASK_CREATED') {
                      actionText = 'created task';
                      targetText = activity.task?.title || 'Unknown task';
                      icon = Plus;
                      color = 'text-indigo-600';
                    } else if (activity.type === 'TASK_UPDATED') {
                      actionText = 'updated task';
                      targetText = activity.task?.title || 'Unknown task';
                      icon = Edit;
                      color = 'text-blue-600';
                    } else if (activity.type === 'TASK_DELETED') {
                      actionText = 'deleted task';
                      targetText = activity.task?.title || 'Unknown task';
                      icon = Trash2;
                      color = 'text-red-600';
                    }

                    const timeAgo = formatTimeAgo(new Date(activity.createdAt));
                    const ActivityIcon = icon;

                    return (
                      <div key={activity.id} className="relative pl-8 pb-8 last:pb-0">
                        {index !== activities.length - 1 && (
                          <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        <div className={`absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-2 ${borderColor} flex items-center justify-center`}>
                          <ActivityIcon className={`h-3 w-3 ${color}`} />
                        </div>
                        <div className={`${bgColor} rounded-lg p-4 hover:opacity-90 transition-all border ${borderColor}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-900 flex-1">
                              <span className="font-medium">{userName}</span>{' '}
                              {actionText}{' '}
                              <span className="font-medium text-indigo-600">{targetText}</span>
                            </p>
                            {activity.isOverdue && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 flex-shrink-0">
                                <AlertCircle className="h-3 w-3" />
                                Overdue
                              </span>
                            )}
                            {activity.isOnTime && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                                <CheckCircle2 className="h-3 w-3" />
                                On Time
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Statistics Tab ─────────────────────────────────────────────── */}
          {activeTab === 'statistics' && currentBusiness && (
            <StatisticsDashboard businessId={currentBusiness.id} />
          )}
        </div>
      </div>

      {/* ── New/Edit Task Modal ─────────────────────────────────────────────────────── */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={handleCloseTaskModal} className="text-gray-400 hover:text-gray-500">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Description</span>
                  <button
                    type="button"
                    onClick={handleImproveDescription}
                    disabled={improvingDescription || newTaskForm.description.trim().length <= 15}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {improvingDescription ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Improve with AI
                      </>
                    )}
                  </button>
                </label>
                <textarea
                  rows={3}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  onBlur={handleDetectPriority}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Task description (min 16 characters for AI improvement)"
                />
                
                {/* AI Improved Description Preview */}
                {aiImprovedDescription && (
                  <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-purple-900 mb-1">AI Suggestion</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiImprovedDescription}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleApplyImprovedDescription}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={handleDismissImprovedDescription}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Priority
                    {detectingPriority && (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    )}
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => {
                      setNewTaskForm({ ...newTaskForm, priority: e.target.value as Task['priority'] });
                      setAiSuggestedPriority(null); // Clear suggestion when manually changed
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  {aiSuggestedPriority && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                        <span className="text-base">✨</span>
                        AI suggested: {aiSuggestedPriority}
                      </span>
                      <button
                        onClick={() => setAiSuggestedPriority(null)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Dismiss suggestion"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Assign To (Multiple)</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No team members available</p>
                  ) : (
                    teamMembers.map((member) => {
                      const name = getMemberName(member);
                      const initials = getInitials(name);
                      const isChecked = newTaskForm.assignedToIds.includes(member.user_id);
                      
                      return (
                        <label
                          key={member.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAssignedMember(member.user_id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                {newTaskForm.assignedToIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {newTaskForm.assignedToIds.length} member{newTaskForm.assignedToIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Subtasks Section - Only show when editing existing task */}
              {editingTask && (
                <div className="pt-4 border-t border-gray-200">
                  <SubtaskList
                    taskId={editingTask.id}
                    taskTitle={newTaskForm.title}
                    taskDescription={newTaskForm.description}
                    userRole={currentUser?.role}
                    onProgressUpdate={() => {
                      // Rafraîchir les tâches pour mettre à jour la progression visible
                      if (currentBusiness) {
                        fetchTasks(currentBusiness.id).then(setTasks).catch(console.error);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleCloseTaskModal}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleCreateTask}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Member Modal ───────────────────────────────────────────────── */}
      {showInviteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button onClick={() => setShowInviteMember(false)} className="text-gray-400 hover:text-gray-500">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select role</option>
                  <option value="BUSINESS_ADMIN">Business Admin</option>
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowInviteMember(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Chat Modal ────────────────────────────────────────────────────── */}
      {chatTask && currentUser && currentBusiness && (
        <TaskChat
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          currentUserId={currentUser.id}
          businessId={currentBusiness.id}
          onClose={() => setChatTask(null)}
        />
      )}

      {/* ── Subtask View Modal (TEAM_MEMBER) ──────────────────────────────────── */}
      {viewingTask && currentBusiness && (
        <SubtaskViewModal
          task={viewingTask}
          businessId={currentBusiness.id}
          onClose={() => setViewingTask(null)}
          onProgressUpdate={() => {
            if (currentBusiness) {
              fetchTasks(currentBusiness.id).then(setTasks).catch(console.error);
            }
          }}
        />
      )}
    </div>
  );
}

