import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Building2,
  ChevronDown,
  MessageSquare,
  Package,
  Tag,
  TrendingUp,
  Box,
  ShoppingCart,
  ShoppingBag,
  FileCheck,
  Truck,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  {
    name: 'Ventes',
    href: '/app/sales',
    icon: ShoppingCart,
    subItems: [
      { name: 'Tableau de bord',   href: '/app/sales/dashboard',       icon: LayoutDashboard },
      { name: 'Devis',             href: '/app/sales/quotes',          icon: FileCheck   },
      { name: 'Commandes',         href: '/app/sales/orders',          icon: ClipboardList },
      { name: 'Bons de livraison', href: '/app/sales/delivery-notes',  icon: Truck      },
      { name: 'Factures',          href: '/app/sales/invoices',        icon: FileText    },
    ],
  },
  {
    name: 'Achats',
    href: '/app/purchases',
    icon: ShoppingBag,
    subItems: [
      { name: 'Tableau de bord',        href: '/app/purchases/dashboard',          icon: LayoutDashboard },
      { name: 'Fournisseurs',           href: '/app/purchases/suppliers',          icon: Building2     },
      { name: 'Commandes fournisseurs', href: '/app/purchases/orders',             icon: ClipboardList },
      { name: 'Réceptions',             href: '/app/purchases/goods-receipts',     icon: Truck         },
      { name: 'Factures fournisseurs',  href: '/app/purchases/invoices',           icon: FileText      },
      { name: 'Paiements fournisseurs', href: '/app/purchases/payments',           icon: Receipt       },
    ],
  },
  { name: 'Dépenses',     href: '/app/expenses',      icon: Receipt      },
  { name: 'Clients',      href: '/app/clients',        icon: Users        },
  {
    name: 'Stock',
    href: '/app/stock',
    icon: Package,
    subItems: [
      { name: "Vue d'ensemble", href: '/app/stock',            icon: LayoutDashboard },
      { name: 'Produits',       href: '/app/stock/products',   icon: Box             },
      { name: 'Catégories',     href: '/app/stock/categories', icon: Tag             },
      { name: 'Mouvements',     href: '/app/stock/movements',  icon: TrendingUp      },
    ],
  },
  { name: 'Équipe',        href: '/app/team',          icon: UserCircle   },
  { name: 'Collaboration', href: '/app/collaboration', icon: MessageSquare },
  { name: 'Rapports',      href: '/app/reports',       icon: BarChart3    },
  { name: 'Paramètres',    href: '/app/settings',      icon: Settings     },
];

export default function BackOfficeLayout() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [stockMenuOpen,     setStockMenuOpen]     = useState(false);
  const [salesMenuOpen,     setSalesMenuOpen]     = useState(false);
  const [purchasesMenuOpen, setPurchasesMenuOpen] = useState(false);

  const location = useLocation();
  const { user, logout } = useAuth();

  const isStockActive     = location.pathname.startsWith('/app/stock');
  const isSalesActive     = location.pathname.startsWith('/app/sales');
  const isPurchasesActive = location.pathname.startsWith('/app/purchases');

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) logout();
  };

  // ── Contenu de la nav (réutilisé mobile + desktop) ────────────────────────
  const NavContent = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const isActive         = location.pathname === item.href;
        const hasSubItems      = item.subItems && item.subItems.length > 0;
        const isSalesSection   = item.name === 'Ventes';
        const isPurchasesSection = item.name === 'Achats';
        const isStockSection   = item.name === 'Stock';

        // Handle Ventes section
        if (hasSubItems && isSalesSection) {
          return (
            <div key={item.name}>
              <button
                onClick={() => setSalesMenuOpen(!salesMenuOpen)}
                className={`sidebar-nav-item flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isSalesActive
                    ? 'active bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isSalesActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${salesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {salesMenuOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.href!}
                        className={`sidebar-submenu-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'active bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      >
                        <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Handle Achats section
        if (hasSubItems && isPurchasesSection) {
          return (
            <div key={item.name}>
              <button
                onClick={() => setPurchasesMenuOpen(!purchasesMenuOpen)}
                className={`sidebar-nav-item flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isPurchasesActive
                    ? 'active bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isPurchasesActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${purchasesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {purchasesMenuOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.href!}
                        className={`sidebar-submenu-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'active bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      >
                        <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Handle Stock section
        if (hasSubItems && isStockSection) {
          return (
            <div key={item.name}>
              <button
                onClick={() => setStockMenuOpen(!stockMenuOpen)}
                className={`sidebar-nav-item flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isStockActive
                    ? 'active bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isStockActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${stockMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {stockMenuOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.href!}
                        className={`sidebar-submenu-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'active bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      >
                        <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Regular menu items without subitems
        return (
          <Link
            key={item.name}
            to={item.href!}
            className={`sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'active bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile sidebar ─────────────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="sidebar-container fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col h-full">
          <div className="sidebar-header flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">BizManage</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto pb-6 min-h-0">
            <NavContent mobile />
          </nav>
          <div className="sidebar-footer p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="sidebar-logout-btn flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="sidebar-container flex flex-col h-full bg-white border-r border-gray-200">
          <div className="sidebar-header flex h-16 items-center gap-2 px-6 border-b border-gray-200 flex-shrink-0">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">BizManage</span>
          </div>

          <div className="p-4 flex-shrink-0">
            <div className="sidebar-user-card flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="sidebar-user-avatar h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.toLowerCase().replace(/_/g, ' ') || 'Membre'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 min-h-0">
            <NavContent />
          </nav>

          <div className="sidebar-footer p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="sidebar-logout-btn flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="lg:pl-72">
        <header className="top-header sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="search-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button className="header-icon-btn relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="user-avatar h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getUserInitials()}</span>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}