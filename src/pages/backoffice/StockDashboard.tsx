// ==================== Alaa change for stock dashboard ====================
// src/pages/backoffice/StockDashboard.tsx
import { useState, useEffect } from 'react';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Package, AlertTriangle, Tag, TrendingUp, Wallet, RefreshCw, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
} from 'recharts';
import StockCard from '../../components/stock/StockCard';
import { stockDashboardApi, StockDashboardResponse } from '../../api/stock-dashboard.api';
import { productReservationsApi } from '../../api/product-reservations.api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Supplier {
  id: string;
  name: string;
}

export default function StockDashboard() {
  const { user } = useAuth();
  const { businessId, loading: loadingBusinessId, error: businessIdError } = useBusinessId();
  const navigate = useNavigate();
  const [data, setData] = useState<StockDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingProductId, setReservingProductId] = useState<string | null>(null);
  const [reservationQuantities, setReservationQuantities] = useState<Record<string, number>>({});
  const [reservationSuppliers, setReservationSuppliers] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchDashboard = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, suppliersData] = await Promise.all([
        stockDashboardApi.getDashboard(businessId),
        axios.get(`${API_URL}/businesses/${businessId}/suppliers?is_active=true&limit=100`, { withCredentials: true }),
      ]);
      setData(dashboardData);
      setSuppliers(suppliersData.data.data || []);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [businessId]);

  const handleReserve = async (productId: string) => {
    if (!businessId) return;
    
    const quantity = reservationQuantities[productId];
    const supplierId = reservationSuppliers[productId];
    
    if (!quantity || quantity <= 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    if (!supplierId) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }

    console.log('Creating reservation with:', { product_id: productId, quantity, supplier_id: supplierId });

    try {
      setReservingProductId(productId);
      await productReservationsApi.create(businessId, {
        product_id: productId,
        quantity,
        supplier_id: supplierId,
      });
      toast.success('Réservation créée avec succès');
      setReservationQuantities((prev) => ({ ...prev, [productId]: 0 }));
      setReservationSuppliers((prev) => ({ ...prev, [productId]: '' }));
      fetchDashboard(); // Refresh data
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la réservation');
    } finally {
      setReservingProductId(null);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'ENTREE_ACHAT':
        return 'Entrée';
      case 'SORTIE_VENTE':
        return 'Sortie';
      case 'AJUSTEMENT_POSITIF':
        return 'Ajustement +';
      case 'AJUSTEMENT_NEGATIF':
        return 'Ajustement -';
      case 'IN':
        return 'Entrée';
      case 'OUT':
        return 'Sortie';
      case 'ADJUSTMENT':
        return 'Ajustement';
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'ENTREE_ACHAT':
      case 'IN':
        return 'bg-green-100 text-green-700';
      case 'SORTIE_VENTE':
      case 'OUT':
        return 'bg-red-100 text-red-700';
      case 'AJUSTEMENT_POSITIF':
        return 'bg-blue-100 text-blue-700';
      case 'AJUSTEMENT_NEGATIF':
        return 'bg-orange-100 text-orange-700';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStockBarColor = (percentage: number) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-900 font-medium">Erreur de chargement</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Stock</h1>
          <p className="text-gray-500">Vue d'ensemble de votre inventaire</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StockCard
          title="Total Produits"
          value={data.summary.total_products}
          icon={Package}
          color="indigo"
          subtitle="actifs"
        />
        <StockCard
          title="Stock Faible"
          value={data.summary.low_stock_count}
          icon={AlertTriangle}
          color="red"
          subtitle="produits"
        />
        <StockCard
          title="Catégories"
          value={data.summary.total_categories}
          icon={Tag}
          color="green"
          subtitle="actives"
        />
        <StockCard
          title="Mouvements"
          value={data.summary.total_movements}
          icon={TrendingUp}
          color="yellow"
          subtitle="total"
        />
        <StockCard
          title="Valeur du stock"
          value={formatCurrency(data.summary.total_stock_value)}
          icon={Wallet}
          color="emerald"
          subtitle="inventaire"
        />
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Stock Faible</h2>
                <p className="text-sm text-gray-500">Produits nécessitant un réapprovisionnement</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.low_stock_products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun produit en stock faible
              </div>
            ) : (
              data.low_stock_products.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {product.quantity} / {product.min_quantity}
                      </p>
                      <p className="text-xs text-gray-500">En stock / Min</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${getStockBarColor(product.stock_percentage)}`}
                      style={{ width: `${Math.min(product.stock_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={reservationSuppliers[product.id] || ''}
                      onChange={(e) =>
                        setReservationSuppliers((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Sélectionner fournisseur</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={reservationQuantities[product.id] || ''}
                        onChange={(e) =>
                          setReservationQuantities((prev) => ({
                            ...prev,
                            [product.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleReserve(product.id)}
                        disabled={reservingProductId === product.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => navigate('/app/stock/products?low_stock=true')}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir tous les produits
            </button>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mouvements Récents</h2>
                <p className="text-sm text-gray-500">Dernières opérations de stock</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recent_movements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun mouvement récent
              </div>
            ) : (
              data.recent_movements.map((movement) => (
                <div key={movement.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{movement.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(movement.created_at), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(movement.type)}`}>
                      {getMovementTypeLabel(movement.type)}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {movement.quantity} {movement.product_sku}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => navigate('/app/stock/movements')}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir tous les mouvements
            </button>
          </div>
        </div>
      </div>

      {/* Stock Movements Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activité du stock — 30 derniers jours
        </h2>
        {data.movements_chart.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Aucun mouvement ces 30 derniers jours
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.movements_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'dd/MM')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })}
                formatter={(value: number) => [value, '']}
              />
              <Legend />
              <Bar dataKey="entrees" fill="#10b981" name="Entrées" />
              <Bar dataKey="sorties" fill="#ef4444" name="Sorties" />
              <Bar dataKey="ajustements" fill="#f59e0b" name="Ajustements" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stock Forecast */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Prévision de rupture de stock</h2>
          <p className="text-sm text-gray-500">Basé sur la consommation moyenne des 30 derniers jours</p>
        </div>
        {data.stock_forecast.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Aucun produit en risque de rupture détecté
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(400, data.stock_forecast.length * 60)}>
              <BarChart
                data={data.stock_forecast}
                layout="vertical"
                margin={{ left: 120, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  label={{ value: 'Jours restants estimés', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
                          <p className="text-sm text-gray-600">Stock actuel: {data.current_quantity} {data.unit}</p>
                          <p className="text-sm text-gray-600">
                            Consommation moyenne: {data.avg_daily_consumption.toFixed(2)} {data.unit}/jour
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            Jours restants: {data.days_remaining !== null ? data.days_remaining : 'N/A'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="days_remaining"
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    let fill = '#10b981'; // green for OK
                    if (payload.risk_level === 'CRITICAL') fill = '#ef4444'; // red
                    else if (payload.risk_level === 'WARNING') fill = '#f59e0b'; // amber
                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Critique (≤ 7 jours)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Attention (≤ 30 jours)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">OK (&gt; 30 jours)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// ====================================================================
