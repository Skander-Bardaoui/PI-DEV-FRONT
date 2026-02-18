import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const stats = [
  {
    title: 'Revenus ce mois',
    value: '45,200 TND',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'indigo'
  },
  {
    title: 'Dépenses ce mois',
    value: '12,800 TND',
    change: '-3.2%',
    trend: 'down',
    icon: Receipt,
    color: 'red'
  },
  {
    title: 'Factures en attente',
    value: '23',
    change: '+5',
    trend: 'up',
    icon: FileText,
    color: 'yellow'
  },
  {
    title: 'Clients actifs',
    value: '127',
    change: '+8',
    trend: 'up',
    icon: Users,
    color: 'green'
  }
];

const revenueData = [
  { month: 'Jan', revenus: 32000, depenses: 12000 },
  { month: 'Fév', revenus: 38000, depenses: 14000 },
  { month: 'Mar', revenus: 35000, depenses: 11000 },
  { month: 'Avr', revenus: 42000, depenses: 15000 },
  { month: 'Mai', revenus: 48000, depenses: 13000 },
  { month: 'Jun', revenus: 45200, depenses: 12800 }
];

const invoiceStatusData = [
  { name: 'Payées', value: 65, color: '#22C55E' },
  { name: 'En attente', value: 23, color: '#EAB308' },
  { name: 'En retard', value: 12, color: '#EF4444' }
];

const recentInvoices = [
  { id: 'INV-2024-089', client: 'Tech Solutions', amount: 3500, status: 'paid', date: '15 Jan' },
  { id: 'INV-2024-090', client: 'Digital Agency', amount: 2800, status: 'pending', date: '14 Jan' },
  { id: 'INV-2024-091', client: 'StartUp Inc', amount: 5200, status: 'pending', date: '13 Jan' },
  { id: 'INV-2024-092', client: 'Consulting Pro', amount: 1900, status: 'overdue', date: '10 Jan' },
  { id: 'INV-2024-093', client: 'Media Group', amount: 4100, status: 'paid', date: '09 Jan' }
];

const recentExpenses = [
  { id: 1, description: 'Fournitures de bureau', category: 'Bureau', amount: 450, date: '15 Jan' },
  { id: 2, description: 'Abonnement logiciels', category: 'IT', amount: 1200, date: '14 Jan' },
  { id: 3, description: 'Déjeuner client', category: 'Repas', amount: 85, date: '13 Jan' },
  { id: 4, description: 'Transport', category: 'Déplacement', amount: 120, date: '12 Jan' }
];

const statusColors = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700'
};

const statusLabels = {
  paid: 'Payée',
  pending: 'En attente',
  overdue: 'En retard'
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue ! Voici un aperçu de votre activité.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4" />
            Ce mois
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                stat.color === 'indigo' ? 'bg-indigo-100' :
                stat.color === 'red' ? 'bg-red-100' :
                stat.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenus vs Dépenses</h2>
              <p className="text-sm text-gray-500">Évolution sur les 6 derniers mois</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} TND`]}
                />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenus)"
                  name="Revenus"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDepenses)"
                  name="Dépenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Statut des factures</h2>
              <p className="text-sm text-gray-500">Répartition actuelle</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            {invoiceStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Factures récentes</h2>
            <a href="/app/invoices" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Voir tout
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.client}</p>
                    <p className="text-sm text-gray-500">{invoice.id} • {invoice.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{invoice.amount.toLocaleString()} TND</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    statusColors[invoice.status as keyof typeof statusColors]
                  }`}>
                    {statusLabels[invoice.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dépenses récentes</h2>
            <a href="/app/expenses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Voir tout
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">-{expense.amount} TND</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
