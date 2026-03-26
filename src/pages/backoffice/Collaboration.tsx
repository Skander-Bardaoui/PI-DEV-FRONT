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
} from 'lucide-react';

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

// ─── Mock data for tasks ───────────────────────────────────────────────────────

const initialTasks = [
  {
    id: 1,
    title: 'Design new landing page',
    priority: 'high',
    dueDate: '2024-01-20',
    assignedTo: { name: 'Ahmed', avatar: 'A', color: 'bg-indigo-500' },
    status: 'todo',
  },
  {
    id: 2,
    title: 'Update API documentation',
    priority: 'medium',
    dueDate: '2024-01-22',
    assignedTo: { name: 'Salma', avatar: 'S', color: 'bg-pink-500' },
    status: 'todo',
  },
  {
    id: 3,
    title: 'Fix authentication bug',
    priority: 'high',
    dueDate: '2024-01-18',
    assignedTo: { name: 'Mohamed', avatar: 'M', color: 'bg-green-500' },
    status: 'in-progress',
  },
  {
    id: 4,
    title: 'Implement payment gateway',
    priority: 'high',
    dueDate: '2024-01-25',
    assignedTo: { name: 'Fatma', avatar: 'F', color: 'bg-purple-500' },
    status: 'in-progress',
  },
  {
    id: 5,
    title: 'Write unit tests',
    priority: 'medium',
    dueDate: '2024-01-15',
    assignedTo: { name: 'Karim', avatar: 'K', color: 'bg-orange-500' },
    status: 'done',
  },
  {
    id: 6,
    title: 'Deploy to production',
    priority: 'low',
    dueDate: '2024-01-30',
    assignedTo: { name: 'Nadia', avatar: 'N', color: 'bg-blue-500' },
    status: 'done',
  },
  {
    id: 7,
    title: 'Database migration',
    priority: 'high',
    dueDate: '2024-01-19',
    assignedTo: { name: 'Ahmed', avatar: 'A', color: 'bg-indigo-500' },
    status: 'blocked',
  },
];

// ─── Mock data for activity ───────────────────────────────────────────────────

const activityData = [
  { id: 1, user: 'Ahmed Ben Ali', action: 'created task', target: 'Design new landing page', time: '2 hours ago', icon: Plus, color: 'text-indigo-600' },
  { id: 2, user: 'Salma Mansouri', action: 'completed task', target: 'Update user profile UI', time: '4 hours ago', icon: CheckCircle2, color: 'text-green-600' },
  { id: 3, user: 'Mohamed Trabelsi', action: 'commented on', target: 'Fix authentication bug', time: '5 hours ago', icon: MessageSquare, color: 'text-blue-600' },
  { id: 4, user: 'Fatma Khelifi', action: 'started working on', target: 'Implement payment gateway', time: '6 hours ago', icon: Clock, color: 'text-yellow-600' },
  { id: 5, user: 'Karim Bouazizi', action: 'uploaded file to', target: 'Test documentation', time: '1 day ago', icon: FileText, color: 'text-purple-600' },
  { id: 6, user: 'Nadia Hamdi', action: 'completed task', target: 'Deploy to production', time: '1 day ago', icon: CheckCircle2, color: 'text-green-600' },
  { id: 7, user: 'Ahmed Ben Ali', action: 'blocked task', target: 'Database migration', time: '2 days ago', icon: XCircle, color: 'text-red-600' },
];

// ─── Mock data for notifications ──────────────────────────────────────────────

const initialNotifications = [
  { id: 1, title: 'New task assigned', message: 'Ahmed assigned you to "Design new landing page"', time: '10 min ago', read: false },
  { id: 2, title: 'Task completed', message: 'Salma completed "Update user profile UI"', time: '1 hour ago', read: false },
  { id: 3, title: 'Comment added', message: 'Mohamed commented on your task', time: '2 hours ago', read: false },
  { id: 4, title: 'Deadline approaching', message: 'Task "Fix authentication bug" is due tomorrow', time: '3 hours ago', read: true },
  { id: 5, title: 'Team member joined', message: 'Nadia Hamdi joined the team', time: '1 day ago', read: true },
  { id: 6, title: 'Task blocked', message: 'Database migration is blocked', time: '2 days ago', read: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
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

// ─── API calls ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function fetchMyBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_BASE}/businesses/my`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch businesses');
  const data = await res.json();
  // The endpoint may return an array directly or { businesses: [] }
  return Array.isArray(data) ? data : data.businesses ?? [];
}

async function fetchBusinessMembers(businessId: string): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/members`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();
  return Array.isArray(data) ? data : data.members ?? [];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks] = useState(initialTasks);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Load businesses then members on mount ─────────────────────────────────
  useEffect(() => {
    async function loadTeam() {
      setLoadingMembers(true);
      setMembersError(null);
      try {
        const businesses = await fetchMyBusinesses();
        if (businesses.length === 0) {
          setMembersError('Aucun business trouvé pour votre compte.');
          return;
        }
        const business = businesses[0]; // Use the first business
        setCurrentBusiness(business);
        const members = await fetchBusinessMembers(business.id);
        setTeamMembers(members);
      } catch (err: any) {
        setMembersError(err.message ?? 'Erreur lors du chargement des membres.');
      } finally {
        setLoadingMembers(false);
      }
    }
    loadTeam();
  }, []);

  // ── Filtered members by search ────────────────────────────────────────────
  const filteredMembers = teamMembers.filter((m) => {
    const name = getMemberName(m).toLowerCase();
    const email = (m.user.email ?? '').toLowerCase();
    const role = m.role.toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
    blocked: tasks.filter((t) => t.status === 'blocked'),
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-500">
            {currentBusiness ? `Business : ${currentBusiness.name}` : 'Manage tasks, activity and teamwork'}
          </p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['tasks', 'team', 'activity', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors relative ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'notifications' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* ── Tasks Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-4">
                {/* TODO */}
                <KanbanColumn
                  label="TODO"
                  icon={<Circle className="h-5 w-5 text-gray-400" />}
                  tasks={tasksByStatus.todo}
                />
                {/* IN PROGRESS */}
                <KanbanColumn
                  label="IN PROGRESS"
                  icon={<Clock className="h-5 w-5 text-blue-500" />}
                  tasks={tasksByStatus['in-progress']}
                />
                {/* DONE */}
                <KanbanColumn
                  label="DONE"
                  icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                  tasks={tasksByStatus.done}
                />
                {/* BLOCKED */}
                <KanbanColumn
                  label="BLOCKED"
                  icon={<XCircle className="h-5 w-5 text-red-500" />}
                  tasks={tasksByStatus.blocked}
                />
              </div>
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
                            {/* Name + avatar */}
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

                            {/* Role */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {formatRole(member.role)}
                              </span>
                            </td>

                            {/* Email */}
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {member.user.email}
                            </td>

                            {/* Status */}
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

                            {/* Joined date */}
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {joinedDate}
                            </td>

                            {/* Actions */}
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

                  {/* Footer — member count */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                    {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} au total
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Activity Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="relative">
                {activityData.map((activity, index) => (
                  <div key={activity.id} className="relative pl-8 pb-8 last:pb-0">
                    {index !== activityData.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      <activity.icon className={`h-3 w-3 ${activity.color}`} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium text-indigo-600">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notifications Tab ─────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">
                  {unreadCount > 0
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Tout est lu !'}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.read ? 'bg-white border-gray-200' : 'bg-indigo-50 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${notification.read ? 'bg-gray-100' : 'bg-indigo-100'}`}>
                          <Bell className={`h-5 w-5 ${notification.read ? 'text-gray-400' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Task Modal ─────────────────────────────────────────────────────── */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <button onClick={() => setShowNewTask(false)} className="text-gray-400 hover:text-gray-500">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.user_id}>
                      {getMemberName(member)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowNewTask(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                Create Task
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
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KanbanColumn({
  label,
  icon,
  tasks,
}: {
  label: string;
  icon: React.ReactNode;
  tasks: typeof initialTasks;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
        <span className="text-sm text-gray-500">({tasks.length})</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: (typeof initialTasks)[0] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}
        >
          {priorityLabels[task.priority as keyof typeof priorityLabels]}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div
            className={`h-7 w-7 rounded-full ${task.assignedTo.color} flex items-center justify-center text-white text-xs font-medium`}
          >
            {task.assignedTo.avatar}
          </div>
        </div>
      </div>
    </div>
  );
}