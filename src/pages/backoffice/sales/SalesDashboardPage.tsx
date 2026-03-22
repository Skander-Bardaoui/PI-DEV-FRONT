import { useAuth } from '../../../hooks/useAuth';
import { FileText, ShoppingCart, Truck, Receipt, TrendingUp, DollarSign } from 'lucide-react';

export default function SalesDashboardPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const stats = [
    {
      title: 'Devis en attente',
      value: '0',
      icon: FileText,
      color: 'bg-blue-500',
      change: '+0%',
    },
    {
      title: 'Commandes en cours',
      value: '0',
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      change: '+0%',
    },
    {
      title: 'Livraisons du jour',
      value: '0',
      icon: Truck,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      title: 'Factures impayées',
      value: '0',
      icon: Receipt,
      color: 'bg-red-500',
      change: '+0%',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord - Ventes</h1>
        <p className="text-gray-600">Vue d'ensemble de vos ventes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Chiffre d'affaires mensuel
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Graphique à venir
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Top clients
          </h2>
          <div className="space-y-3">
            <div className="text-center text-gray-400 py-8">
              Aucune donnée disponible
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <div className="text-center text-gray-400 py-8">
          Aucune activité récente
        </div>
      </div>
    </div>
  );
}
