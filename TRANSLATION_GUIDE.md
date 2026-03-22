# Guide de Traduction - NovEntra

## ✅ Fichiers Déjà Traduits

### Configuration i18n
- ✅ `src/i18n/index.ts` - Configuration complète
- ✅ `src/i18n/locales/fr.ts` - Traductions françaises complètes
- ✅ `src/i18n/locales/en.ts` - Traductions anglaises complètes

### Composants Traduits
- ✅ `src/components/LanguageSwitcher.tsx` - Switcher de langue
- ✅ `src/pages/frontoffice/LoginPage.tsx` - Page de connexion
- ✅ `src/pages/backoffice/Dashboard.tsx` - Tableau de bord (partiellement)
- ✅ `src/App.tsx` - Application principale (partiellement)

## 📋 Composants à Traduire

### Pages Front Office
- ⏳ `src/pages/frontoffice/LandingPage.tsx`
- ⏳ `src/pages/frontoffice/RegisterPage.tsx`
- ⏳ `src/pages/frontoffice/PricingPage.tsx`
- ⏳ `src/pages/frontoffice/ClientPortal.tsx`

### Pages Back Office - Achats
- ⏳ `src/pages/backoffice/purchases/SuppliersPage.tsx`
- ⏳ `src/pages/backoffice/purchases/SupplierPOsPage.tsx`
- ⏳ `src/pages/backoffice/purchases/PurchaseInvoicesPage.tsx`
- ⏳ `src/pages/backoffice/purchases/SupplierPaymentsPage.tsx`
- ⏳ `src/pages/backoffice/purchases/Purchasesdashboardpage.tsx`
- ⏳ `src/pages/backoffice/purchases/Goodsreceiptspage.tsx`
- ⏳ `src/pages/backoffice/purchases/SupplierPortalPage.tsx`
- ⏳ `src/pages/backoffice/purchases/SupplierRankingPage.tsx`

### Pages Back Office - Ventes
- ⏳ `src/pages/backoffice/sales/SalesDashboardPage.tsx`
- ⏳ `src/pages/backoffice/sales/QuotesPage.tsx`
- ⏳ `src/pages/backoffice/sales/SalesOrdersPage.tsx`
- ⏳ `src/pages/backoffice/sales/DeliveryNotesPage.tsx`
- ⏳ `src/pages/backoffice/sales/SalesInvoicesPage.tsx`

### Pages Back Office - Stock
- ⏳ `src/pages/backoffice/StockDashboard.tsx`
- ⏳ `src/pages/backoffice/Products.tsx`
- ⏳ `src/pages/backoffice/Categories.tsx`
- ⏳ `src/pages/backoffice/StockMovements.tsx`

### Pages Back Office - Autres
- ⏳ `src/pages/backoffice/Clients.tsx`
- ⏳ `src/pages/backoffice/Invoices.tsx`
- ⏳ `src/pages/backoffice/Expenses.tsx`
- ⏳ `src/pages/backoffice/Reports.tsx`
- ⏳ `src/pages/backoffice/Team.tsx`
- ⏳ `src/pages/backoffice/Collaboration.tsx`
- ⏳ `src/pages/backoffice/Settings.tsx`

### Composants - Achats
- ⏳ `src/components/purchases/AlertsBell.tsx`
- ⏳ `src/components/purchases/AlertsPanel.tsx`
- ⏳ `src/components/purchases/CorrectInvoiceModal.tsx`
- ⏳ `src/components/purchases/CreateInvoiceFromPOModal.tsx`
- ⏳ `src/components/purchases/Disputemodal .tsx`
- ⏳ `src/components/purchases/EditSupplierPOModal.tsx`
- ⏳ `src/components/purchases/GoodsReceiptModal.tsx`
- ⏳ `src/components/purchases/Invoicedetailmodal .tsx`
- ⏳ `src/components/purchases/OcrInvoiceModal.tsx`
- ⏳ `src/components/purchases/Paymentmodal.tsx`
- ⏳ `src/components/purchases/PDFButton.tsx`
- ⏳ `src/components/purchases/PurchaseInvoiceModal.tsx`
- ⏳ `src/components/purchases/SupplierModal.tsx`
- ⏳ `src/components/purchases/SupplierPODetailModal.tsx`
- ⏳ `src/components/purchases/SupplierPOModal.tsx`
- ⏳ `src/components/purchases/SupplierScoreModal.tsx`
- ⏳ `src/components/purchases/SupplierStatsCard.tsx`
- ⏳ `src/components/purchases/ThreeWayMatchBadge.tsx`
- ⏳ `src/components/purchases/ThreeWayMatchModal.tsx`
- ⏳ `src/components/purchases/UploadInvoiceScan.tsx`

### Composants - Ventes
- ⏳ `src/components/sales/ClientStatsCard.tsx`
- ⏳ `src/components/sales/DeliveryNoteDetailModal.tsx`
- ⏳ `src/components/sales/DeliveryNoteModal.tsx`
- ⏳ `src/components/sales/QuoteDetailModal.tsx`
- ⏳ `src/components/sales/QuoteModal.tsx`
- ⏳ `src/components/sales/SalesInvoiceDetailModal.tsx`
- ⏳ `src/components/sales/SalesInvoiceModal.tsx`
- ⏳ `src/components/sales/SalesOrderDetailModal.tsx`
- ⏳ `src/components/sales/SalesOrderModal.tsx`

### Composants - Stock
- ⏳ `src/components/stock/CategoryTable.tsx`
- ⏳ `src/components/stock/MovementTable.tsx`
- ⏳ `src/components/stock/ProductTable.tsx`
- ⏳ `src/components/stock/StockCard.tsx`

### Composants - UI
- ⏳ `src/components/ui/ConfirmModal.tsx`
- ⏳ `src/components/ui/Toast.tsx`

### Composants - Accessibilité
- ⏳ `src/components/AccessibilityButton.tsx`
- ⏳ `src/components/AccessibilityPanel.tsx`
- ⏳ `src/components/FingerScrollControl.tsx`

### Layouts
- ⏳ `src/layouts/BackOfficeLayout.tsx`

## 🔧 Comment Traduire un Composant

### Étape 1: Importer useTranslation
```typescript
import { useTranslation } from 'react-i18next';
```

### Étape 2: Utiliser le hook dans le composant
```typescript
export default function MonComposant() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### Étape 3: Remplacer les textes en dur
Avant:
```typescript
<button>Enregistrer</button>
```

Après:
```typescript
<button>{t('common.save')}</button>
```

### Étape 4: Utiliser defaultValue pour les textes non encore traduits
```typescript
<p>{t('mySection.myKey', { defaultValue: 'Texte par défaut' })}</p>
```

## 📚 Clés de Traduction Disponibles

### Navigation (nav)
- `nav.dashboard`, `nav.sales`, `nav.purchases`, `nav.expenses`
- `nav.clients`, `nav.stock`, `nav.team`, `nav.collaboration`
- `nav.reports`, `nav.settings`, `nav.logout`
- `nav.quotes`, `nav.orders`, `nav.deliveries`, `nav.invoices`
- `nav.suppliers`, `nav.supplierOrders`, `nav.goodsReceipts`
- `nav.supplierInvoices`, `nav.supplierPayments`, `nav.supplierRanking`
- `nav.overview`, `nav.products`, `nav.categories`, `nav.movements`

### Authentification (auth)
- `auth.login`, `auth.logout`, `auth.register`
- `auth.email`, `auth.password`, `auth.confirmPassword`
- `auth.forgotPassword`, `auth.rememberMe`
- `auth.loginButton`, `auth.registerButton`
- `auth.noAccount`, `auth.hasAccount`, `auth.loading`

### Commun (common)
- `common.save`, `common.cancel`, `common.delete`, `common.edit`
- `common.create`, `common.search`, `common.filter`, `common.reset`
- `common.confirm`, `common.close`, `common.back`, `common.next`
- `common.loading`, `common.noData`, `common.total`, `common.status`
- `common.date`, `common.actions`, `common.yes`, `common.no`
- `common.add`, `common.remove`, `common.export`, `common.import`
- `common.print`, `common.all`, `common.active`, `common.archived`
- `common.viewAll`, `common.pending`

### Fournisseurs (suppliers)
- `suppliers.title`, `suppliers.new`, `suppliers.name`
- `suppliers.email`, `suppliers.phone`, `suppliers.address`
- `suppliers.taxId`, `suppliers.rib`, `suppliers.bank`
- `suppliers.paymentTerms`, `suppliers.category`, `suppliers.notes`
- `suppliers.active`, `suppliers.archived`, `suppliers.archive`
- `suppliers.restore`, `suppliers.totalSuppliers`
- `suppliers.score`, `suppliers.ranking`

### Bons de Commande (purchaseOrders)
- `purchaseOrders.title`, `purchaseOrders.new`, `purchaseOrders.number`
- `purchaseOrders.supplier`, `purchaseOrders.date`, `purchaseOrders.delivery`
- `purchaseOrders.status`, `purchaseOrders.subtotalHt`, `purchaseOrders.tax`
- `purchaseOrders.stamp`, `purchaseOrders.total`, `purchaseOrders.notes`
- `purchaseOrders.items`, `purchaseOrders.description`
- `purchaseOrders.quantity`, `purchaseOrders.unitPrice`
- `purchaseOrders.taxRate`, `purchaseOrders.lineTotal`
- `purchaseOrders.send`, `purchaseOrders.confirm`, `purchaseOrders.cancel`
- Statuts: `draft`, `sent`, `confirmed`, `partiallyReceived`, `fullyReceived`, `cancelled`

### Factures Fournisseurs (purchaseInvoices)
- `purchaseInvoices.title`, `purchaseInvoices.new`, `purchaseInvoices.importOcr`
- `purchaseInvoices.number`, `purchaseInvoices.supplier`
- `purchaseInvoices.date`, `purchaseInvoices.dueDate`
- `purchaseInvoices.subtotalHt`, `purchaseInvoices.tax`
- `purchaseInvoices.stamp`, `purchaseInvoices.total`
- `purchaseInvoices.remaining`, `purchaseInvoices.approve`
- `purchaseInvoices.dispute`, `purchaseInvoices.resolve`
- `purchaseInvoices.pay`, `purchaseInvoices.scan`
- `purchaseInvoices.overdueAlert`
- Statuts: `pending`, `approved`, `partiallyPaid`, `paid`, `overdue`, `disputed`

### Paiements (payments)
- `payments.title`, `payments.new`, `payments.amount`
- `payments.date`, `payments.method`, `payments.reference`
- `payments.bank`, `payments.invoice`
- Méthodes: `transfer`, `check`, `cash`, `draft`, `card`

### Bons de Réception (goodsReceipts)
- `goodsReceipts.title`, `goodsReceipts.new`, `goodsReceipts.number`
- `goodsReceipts.date`, `goodsReceipts.po`, `goodsReceipts.items`
- `goodsReceipts.quantity`, `goodsReceipts.ordered`

### Scoring (scoring)
- `scoring.title`, `scoring.score`, `scoring.grade`, `scoring.rank`
- `scoring.excellent`, `scoring.good`, `scoring.average`
- `scoring.poor`, `scoring.bad`
- `scoring.confirmationSpeed`, `scoring.deliveryRate`
- `scoring.onTimeDelivery`, `scoring.disputeRate`
- `scoring.paymentHistory`, `scoring.recalculate`
- `scoring.details`, `scoring.noDisputes`, `scoring.computedAt`

### OCR (ocr)
- `ocr.title`, `ocr.upload`, `ocr.review`, `ocr.success`
- `ocr.drop`, `ocr.dropHint`, `ocr.analyzing`, `ocr.extracting`
- `ocr.confidence.high`, `ocr.confidence.medium`
- `ocr.confidence.low`, `ocr.confidence.not_found`
- `ocr.howItWorks`, `ocr.howItWorksDesc`
- `ocr.excellent`, `ocr.correct`, `ocr.partial`
- `ocr.mismatch`, `ocr.createInvoice`, `ocr.creating`, `ocr.createdMsg`

### Alertes (alerts)
- `alerts.title`, `alerts.unread`, `alerts.all`
- `alerts.warning`, `alerts.urgent`, `alerts.markRead`
- `alerts.markAllRead`, `alerts.snooze`, `alerts.resolve`
- `alerts.noAlerts`, `alerts.allUnderControl`, `alerts.scan`
- Types: `invoiceDueSoon`, `invoiceOverdue`, `poNotReceived`
- `supplierHighDebt`, `poAwaitingConfirm`

### Portail Fournisseur (supplierPortal)
- `supplierPortal.title`, `supplierPortal.subtitle`
- `supplierPortal.confirmPO`, `supplierPortal.refusePO`
- `supplierPortal.refuseReason`, `supplierPortal.uploadInvoice`
- `supplierPortal.history`, `supplierPortal.pos`
- `supplierPortal.invoices`, `supplierPortal.payments`
- `supplierPortal.totalBilled`, `supplierPortal.totalPaid`
- `supplierPortal.remaining`, `supplierPortal.confirmed`
- `supplierPortal.refused`, `supplierPortal.linkValid`
- `supplierPortal.invalidLink`

### Accessibilité (accessibility)
- `accessibility.title`, `accessibility.fontSize`, `accessibility.contrast`
- `accessibility.lineHeight`, `accessibility.letterSpacing`
- `accessibility.cursorSize`, `accessibility.dyslexiaFont`
- `accessibility.highlightLinks`, `accessibility.reduceMotion`
- `accessibility.gestureControl`, `accessibility.zoom`
- `accessibility.scrollToZoom`, `accessibility.reset`
- `accessibility.normal`, `accessibility.high`, `accessibility.dark`
- `accessibility.large`, `accessibility.extraLarge`

### Rapprochement 3 Voies (matching)
- `matching.title`, `matching.subtitle`, `matching.matched`
- `matching.partial`, `matching.mismatch`, `matching.missingPo`
- `matching.missingGr`, `matching.overInvoiced`
- `matching.poTotal`, `matching.receivedTotal`, `matching.invoicedTotal`
- `matching.discrepancy`, `matching.issues`, `matching.recommendations`
- `matching.autoApprove`, `matching.autoDispute`, `matching.applying`
- `matching.lineDetail`, `matching.conform`, `matching.priceMismatch`
- `matching.qtyMismatch`, `matching.notReceived`, `matching.overInvoicedLine`

### Clients (clients)
- `clients.title`, `clients.new`, `clients.name`
- `clients.email`, `clients.phone`, `clients.address`
- `clients.taxId`, `clients.totalClients`
- `clients.revenue`, `clients.orders`

### Ventes (sales)
- `sales.dashboard`, `sales.totalRevenue`, `sales.pendingOrders`
- `sales.delivered`, `sales.pending`

### Devis (quotes)
- `quotes.title`, `quotes.new`, `quotes.number`
- `quotes.client`, `quotes.date`, `quotes.validUntil`
- `quotes.status`, `quotes.subtotalHt`, `quotes.tax`
- `quotes.total`, `quotes.items`, `quotes.convert`
- Statuts: `draft`, `sent`, `accepted`, `rejected`, `expired`

### Commandes Ventes (salesOrders)
- `salesOrders.title`, `salesOrders.new`, `salesOrders.number`
- `salesOrders.client`, `salesOrders.date`, `salesOrders.delivery`
- `salesOrders.status`, `salesOrders.subtotalHt`, `salesOrders.tax`
- `salesOrders.total`
- Statuts: `draft`, `confirmed`, `partiallyDelivered`, `delivered`, `cancelled`

### Bons de Livraison (deliveryNotes)
- `deliveryNotes.title`, `deliveryNotes.new`, `deliveryNotes.number`
- `deliveryNotes.client`, `deliveryNotes.date`, `deliveryNotes.order`
- `deliveryNotes.items`, `deliveryNotes.quantity`

### Factures Ventes (salesInvoices)
- `salesInvoices.title`, `salesInvoices.new`, `salesInvoices.number`
- `salesInvoices.client`, `salesInvoices.date`, `salesInvoices.dueDate`
- `salesInvoices.subtotalHt`, `salesInvoices.tax`, `salesInvoices.total`
- `salesInvoices.remaining`
- Statuts: `draft`, `sent`, `partiallyPaid`, `paid`, `overdue`

### Stock (stock)
- `stock.dashboard`, `stock.totalValue`, `stock.lowStock`
- `stock.outOfStock`, `stock.movements`, `stock.lastMovements`
- `stock.in`, `stock.out`, `stock.adjustment`

### Produits (products)
- `products.title`, `products.new`, `products.name`
- `products.reference`, `products.category`, `products.price`
- `products.cost`, `products.stock`, `products.minStock`
- `products.description`, `products.barcode`, `products.unit`

### Catégories (categories)
- `categories.title`, `categories.new`, `categories.name`
- `categories.description`, `categories.products`

### Dashboard (dashboard)
- `dashboard.welcome`, `dashboard.overview`, `dashboard.recentActivity`
- `dashboard.quickActions`, `dashboard.statistics`
- `dashboard.thisMonth`, `dashboard.lastMonth`, `dashboard.thisYear`
- `dashboard.revenue`, `dashboard.expenses`, `dashboard.profit`
- `dashboard.growth`

### Erreurs (errors)
- `errors.generic`, `errors.network`, `errors.notFound`
- `errors.unauthorized`, `errors.forbidden`, `errors.serverError`
- `errors.tryAgain`, `errors.goBack`, `errors.goHome`

### Messages (messages)
- `messages.saveSuccess`, `messages.deleteSuccess`
- `messages.updateSuccess`, `messages.createSuccess`
- `messages.confirmDelete`, `messages.unsavedChanges`
- `messages.processing`

## 💡 Conseils

1. **Toujours utiliser `t()` pour les textes affichés**
2. **Utiliser `defaultValue` pour les textes non encore traduits**
3. **Grouper les traductions par contexte** (nav, auth, common, etc.)
4. **Tester dans les deux langues** après chaque modification
5. **Ne jamais modifier la logique** - seulement les textes

## 🚀 Prochaines Étapes

1. Traduire les layouts (BackOfficeLayout)
2. Traduire les pages principales (Clients, Invoices, etc.)
3. Traduire les modals et composants UI
4. Traduire les composants d'accessibilité
5. Tester l'application complète dans les deux langues

## 📝 Notes

- Les traductions sont automatiquement sauvegardées dans localStorage
- Le changement de langue est instantané
- Le LanguageSwitcher peut être utilisé partout avec 3 variants: `navbar`, `page`, `minimal`
