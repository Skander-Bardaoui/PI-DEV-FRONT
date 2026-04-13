skander
bardaoui
•
je reviens vite

Achraf_07 [HK],  — 28/03/2026 22:22
tesma3 fiya
skander — 28/03/2026 23:51
INSERT INTO clients (
    id,
    business_id,
    name,
    email,
    phone,
    address,
    billing_details,
    communication_history,
    payment_terms,
    created_at,
    updated_at,
    has_portal_access
) VALUES (
    uuid_generate_v4(),
    '580b934a-eac1-4415-bd8f-8b6ab74f2554', -- ✅ new business_id
    'Skander Bardaoui',
    'skonbardaoui@gmail.com', -- ✅ same email
    '+21612345678',
    '"Sousse, Tunisia"', -- JSON string
    '{"company": "Personal 2"}',
    '{"note": "second client same email"}',
    30,
    NOW(),
    NOW(),
    true
);
skander — 29/03/2026 12:50
NODE_TLS_REJECT_UNAUTHORIZED=0
.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=saas

JWT_ACCESS_SECRET=3a035305bb7a7bb7bc230fe83557d4cd5ab0c739698a0ccc44db38f598e288ff
JWT_REFRESH_SECRET=9f6c2e8a4b7d1f3a5c0e9b8d4a2f7c1e6b5d0a3f8e1c9b7a2d6e4f0b1c5a8
JWT_ACCESS_EXPIRY=60m
JWT_REFRESH_EXPIRY=7d
JWT_PORTAL_SECRET=9f3c1d8e5a7b4f2c6d0e9a3b8c1f7d4e6a2b5c9d3f8a1e0c7b4d6f2a9c3e1b
ADMIN_NOTIFICATION_EMAIL=novaentra2026@gmail.com  # reçoit les alertes critiques
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
TESSERACT_LANG=eng

GOOGLE_VISION_API_KEY=AIzaSyCH_JsRcE4hZGe6AFJtxVtoxd2OeKQcrCA
POPPLER_PATH=C:\poppler\poppler-25.12.0\Library\bin
Email Configuration
GMAIL_USER=novaentra2026@gmail.com
GMAIL_PASS=enrqztjhkqbryrar

#FRONTEND_URL=http://localhost:5173/

GEMINI_API_KEY=AIzaSyDkhhzGs1C1mZ6OPQiOB3wsHzeqGwAM73k
Email (used by Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

SMTP_USER=codingfamilycodefam@gmail.com
SMTP_PASS=zfvi dyjj sjvg igcl

SMTP_FROM="BizManage codingfamilycodefam@gmail.com"
FRONTEND_URL=http://localhost:5173/
Achraf_07 [HK],  — 29/03/2026 16:20
recurring invoices
Elaa — 07/04/2026 20:19
-- =============================================================================
-- STOCK MODULE SEED DATA — CLEAN SLATE (FULLY FIXED)
-- Business: 0d5c8643-d660-40e1-904c-5873fdfece17
-- This will CLEAR old demo data and insert fresh realistic stock data
-- =============================================================================
BEGIN;

message.txt
33 Ko
skander — 07/04/2026 20:42
494ae7d3-65c9-46dd-bb51-8d4049cbb8ed
Elaa — 08/04/2026 09:37
we fix laptops and phones, screen replacement keyboard repair etc, we charge around 150dt depends on the problem, takes usually 1 to 2 days
Elaa — 08/04/2026 10:03
Image
nouhaattafi — Hier à 18:06
Image
Achraf_07 [HK],  — Hier à 18:07
Achraf_07 [HK],  — 18:01
// src/components/treasury/InstallmentScheduleModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Plus, Trash2, CalendarDays, CreditCard,
  CheckCircle2, Clock, AlertCircle,
  Banknote, Loader2, MailCheck,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement,
  useStripe, useElements,
} from '@stripe/react-stripe-js';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { useAccounts }         from '@/hooks/useAccounts';
import { PurchaseInvoice, formatAmount, formatDate } from '@/types';
import { PaymentMethod }       from '@/types/PaymentMethod';
import axiosInstance           from '@/api/axiosInstance';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ── Types ─────────────────────────────────────────────────────────────────────

interface InstallmentLine {
  due_date:       string;
  amount:         number;
  payment_method: PaymentMethod;
  reference:      string;
  notes:          string;
}

interface Installment {
  id:                 string;
  installment_number: number;
  due_date:           string;
  amount:             number;
  status:             'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_method:     PaymentMethod;
  paid_at:            string | null;
  reference:          string | null;
}

type ScheduleStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';

interface Schedule {
  id:               string;
  total_amount:     number;
  status:           ScheduleStatus;
  rejection_reason: string | null;
  installments:     Installment[];
}

interface Props {
  businessId: string;
  invoice:    PurchaseInvoice;
  onClose:    () => void;
  onSuccess?: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  PENDING:   { label: 'En attente', classes: 'bg-amber-100 text-amber-700',  icon: <Clock        className="h-3 w-3" /> },
  PAID:      { label: 'Payée',      classes: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="h-3 w-3" /> },
  OVERDUE:   { label: 'En retard',  classes: 'bg-red-100   text-red-600',    icon: <AlertCircle  className="h-3 w-3" /> },
  CANCELLED: { label: 'Annulée',    classes: 'bg-gray-100  text-gray-500',   icon: <X            className="h-3 w-3" /> },
};

const PAYMENT_METHODS = [
  { value: PaymentMethod.VIREMENT, label: 'Virement' },
  { value: PaymentMethod.CHEQUE,   label: 'Chèque'   },
  { value: PaymentMethod.ESPECES,  label: 'Espèces'  },
  { value: PaymentMethod.CARTE,    label: 'Carte'    },
];

const emptyLine = (): InstallmentLine => ({
  due_date: '', amount: 0,
  payment_method: PaymentMethod.VIREMENT,
  reference: '', notes: '',
});

// ── Stripe card sub-form ──────────────────────────────────────────────────────

function StripeInstallmentForm({
  businessId, installment, form, onPay, onError, loading,
}: {
  businessId:  string;
  installment: Installment;
  form:        any;
  onPay:       (data: any) => void;
  onError:     (msg: string) => void;
  loading:     boolean;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [stripeLoading, setStripeLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setStripeLoading(true);
... (685lignes restantes)

message.txt
34 Ko
Elaa — 18:06
import { useState, useEffect } from 'react';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Package, AlertTriangle, Tag, TrendingUp, Wallet, RefreshCw, ShoppingCart, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

message.txt
25 Ko
﻿
import { useState, useEffect } from 'react';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Package, AlertTriangle, Tag, TrendingUp, Wallet, RefreshCw, ShoppingCart, Briefcase } from 'lucide-react';
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
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Supplier {
  id: string;
  name: string;
}

type ViewMode = 'products' | 'services';

export default function StockDashboard() {
  const { businessId } = useBusinessId();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [data, setData] = useState<StockDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingProductId, setReservingProductId] = useState<string | null>(null);
  const [reservationQuantities, setReservationQuantities] = useState<Record<string, number>>({});
  const [reservationSuppliers, setReservationSuppliers] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchDashboard = async (mode?: ViewMode) => {
    if (!businessId) return;
    
    const currentMode = mode || viewMode;
    
    try {
      setLoading(true);
      setError(null);
      
      const dashboardPromise = currentMode === 'products' 
        ? stockDashboardApi.getProductsDashboard(businessId)
        : stockDashboardApi.getServicesDashboard(businessId);
      
      const [dashboardData, suppliersData] = await Promise.all([
        dashboardPromise,
        currentMode === 'products' 
          ? axios.get(`${API_URL}/businesses/${businessId}/suppliers?is_active=true&limit=100`, { withCredentials: true })
          : Promise.resolve({ data: { data: [] } }),
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
  }, [businessId, viewMode]);

  const handleViewModeChange = async (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    fetchDashboard(mode);
  };

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
      fetchDashboard();
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la réservation');
    } finally {
      setReservingProductId(null);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ENTREE_ACHAT': 'Entrée',
      'SORTIE_VENTE': 'Sortie',
      'AJUSTEMENT_POSITIF': 'Ajustement +',
      'AJUSTEMENT_NEGATIF': 'Ajustement -',
      'IN': 'Entrée',
      'OUT': 'Sortie',
      'ADJUSTMENT': 'Ajustement',
    };
    return labels[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ENTREE_ACHAT': 'bg-green-100 text-green-700',
      'IN': 'bg-green-100 text-green-700',
      'SORTIE_VENTE': 'bg-red-100 text-red-700',
      'OUT': 'bg-red-100 text-red-700',
      'AJUSTEMENT_POSITIF': 'bg-blue-100 text-blue-700',
      'AJUSTEMENT_NEGATIF': 'bg-orange-100 text-orange-700',
      'ADJUSTMENT': 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
          onClick={() => fetchDashboard()}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Stock</h1>
          <p className="text-gray-500">Vue d'ensemble de votre inventaire</p>
        </div>
        
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => handleViewModeChange('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'products'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Package className="h-4 w-4" />
            Produits
          </button>
          <button
            onClick={() => handleViewModeChange('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'services'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Services
          </button>
        </div>
      </div>

      <div key={viewMode} className="animate-fadeIn">
        {viewMode === 'products' ? (
          <ProductsView
            data={data}
            suppliers={suppliers}
            reservingProductId={reservingProductId}
            reservationQuantities={reservationQuantities}
            reservationSuppliers={reservationSuppliers}
            setReservationQuantities={setReservationQuantities}
            setReservationSuppliers={setReservationSuppliers}
            handleReserve={handleReserve}
            getMovementTypeLabel={getMovementTypeLabel}
            getMovementTypeColor={getMovementTypeColor}
            getStockBarColor={getStockBarColor}
            formatCurrency={formatCurrency}
            navigate={navigate}
          />
        ) : (
          <ServicesView
            data={data}
            formatCurrency={formatCurrency}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

interface ProductsViewProps {
  data: StockDashboardResponse;
  suppliers: Supplier[];
  reservingProductId: string | null;
  reservationQuantities: Record<string, number>;
  reservationSuppliers: Record<string, string>;
  setReservationQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setReservationSuppliers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleReserve: (productId: string) => void;
  getMovementTypeLabel: (type: string) => string;
  getMovementTypeColor: (type: string) => string;
  getStockBarColor: (percentage: number) => string;
  formatCurrency: (value: number) => string;
  navigate: any;
}

function ProductsView({
  data,
  suppliers,
  reservingProductId,
  reservationQuantities,
  reservationSuppliers,
  setReservationQuantities,
  setReservationSuppliers,
  handleReserve,
  getMovementTypeLabel,
  getMovementTypeColor,
  getStockBarColor,
  formatCurrency,
  navigate,
}: ProductsViewProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StockCard title="Total Produits" value={data.summary.total_products} icon={Package} color="indigo" subtitle="actifs" />
        <StockCard title="Stock Faible" value={data.summary.low_stock_count} icon={AlertTriangle} color="red" subtitle="produits" />
        <StockCard title="Catégories" value={data.summary.total_categories} icon={Tag} color="green" subtitle="actives" />
        <StockCard title="Mouvements" value={data.summary.total_movements} icon={TrendingUp} color="yellow" subtitle="total" />
        <StockCard title="Valeur du stock" value={formatCurrency(data.summary.total_stock_value)} icon={Wallet} color="emerald" subtitle="inventaire" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
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
              <div className="p-8 text-center text-gray-500">Aucun produit en stock faible</div>
            ) : (
              data.low_stock_products.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{product.quantity} / {product.min_quantity}</p>
                      <p className="text-xs text-gray-500">En stock / Min</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${getStockBarColor(product.stock_percentage)}`} style={{ width: `${Math.min(product.stock_percentage, 100)}%` }}></div>
                  </div>
                  <div className="space-y-2">
                    <select value={reservationSuppliers[product.id] || ''} onChange={(e) => setReservationSuppliers((prev) => ({ ...prev, [product.id]: e.target.value }))} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Sélectionner fournisseur</option>
                      {suppliers.map((supplier) => (<option key={supplier.id} value={supplier.id}>{supplier.name}</option>))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" placeholder="Qté" value={reservationQuantities[product.id] || ''} onChange={(e) => setReservationQuantities((prev) => ({ ...prev, [product.id]: parseFloat(e.target.value) || 0 }))} className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <button onClick={() => handleReserve(product.id)} disabled={reservingProductId === product.id} className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ShoppingCart className="h-3 w-3" />Réserver
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button onClick={() => navigate('/app/stock/products?low_stock=true')} className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">Voir tous les produits</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
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
              <div className="p-8 text-center text-gray-500">Aucun mouvement récent</div>
            ) : (
              data.recent_movements.map((movement) => (
                <div key={movement.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{movement.product_name}</p>
                    <p className="text-sm text-gray-500">{format(new Date(movement.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(movement.type)}`}>{getMovementTypeLabel(movement.type)}</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{movement.quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button onClick={() => navigate('/app/stock/movements')} className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">Voir tous les mouvements</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité du stock — 30 derniers jours</h2>
        {data.movements_chart.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Aucun mouvement ces 30 derniers jours</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.movements_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'dd/MM')} />
              <YAxis />
              <Tooltip labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })} formatter={(value: number) => [value, '']} />
              <Legend />
              <Bar dataKey="entrees" fill="#10b981" name="Entrées" />
              <Bar dataKey="sorties" fill="#ef4444" name="Sorties" />
              <Bar dataKey="ajustements" fill="#f59e0b" name="Ajustements" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Prévision de rupture de stock</h2>
          <p className="text-sm text-gray-500">Basé sur la consommation moyenne des 30 derniers jours</p>
        </div>
        {data.stock_forecast.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Aucun produit en risque de rupture détecté</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(400, data.stock_forecast.length * 60)}>
              <BarChart data={data.stock_forecast} layout="vertical" margin={{ left: 120, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'Jours restants estimés', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const itemData = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-1">{itemData.name}</p>
                        <p className="text-sm text-gray-600">Stock actuel: {itemData.current_quantity} {itemData.unit}</p>
                        <p className="text-sm text-gray-600">Consommation moyenne: {itemData.avg_daily_consumption.toFixed(2)} {itemData.unit}/jour</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">Jours restants: {itemData.days_remaining !== null ? itemData.days_remaining : 'N/A'}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="days_remaining" fill="#8884d8" radius={[0, 4, 4, 0]} shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  let fill = '#10b981';
                  if (payload.risk_level === 'CRITICAL') fill = '#ef4444';
                  else if (payload.risk_level === 'WARNING') fill = '#f59e0b';
                  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-gray-600">Critique (≤ 7 jours)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-gray-600">Attention (≤ 30 jours)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-600">OK (&gt; 30 jours)</span></div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface ServicesViewProps {
  data: StockDashboardResponse;
  formatCurrency: (value: number) => string;
  navigate: any;
}

function ServicesView({ data, formatCurrency, navigate }: ServicesViewProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StockCard title="Total Services" value={data.summary.total_services} icon={Briefcase} color="indigo" subtitle="actifs" />
        <StockCard title="Catégories" value={data.summary.total_categories} icon={Tag} color="green" subtitle="services" />
        <StockCard title="Activités" value={data.summary.total_movements} icon={TrendingUp} color="yellow" subtitle="total" />
        <StockCard title="Valeur Services" value={formatCurrency(data.summary.total_stock_value)} icon={Wallet} color="emerald" subtitle="catalogue" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activités Récentes</h2>
              <p className="text-sm text-gray-500">Dernières opérations sur les services</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recent_movements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucune activité récente</div>
          ) : (
            data.recent_movements.slice(0, 8).map((movement) => (
              <div key={movement.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{movement.product_name}</p>
                  <p className="text-sm text-gray-500">{format(new Date(movement.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">Service</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button onClick={() => navigate('/app/stock/services')} className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">Voir tous les services</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance des Services — 30 derniers jours</h2>
        {data.movements_chart.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Aucune activité ces 30 derniers jours</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.movements_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'dd/MM')} />
              <YAxis />
              <Tooltip labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })} formatter={(value: number) => [value, 'Services']} />
              <Legend />
              <Bar dataKey="entrees" fill="#6366f1" name="Nouveaux" />
              <Bar dataKey="sorties" fill="#8b5cf6" name="Complétés" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}