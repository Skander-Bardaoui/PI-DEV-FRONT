# Factures Récurrentes - Améliorations Frontend

## Modifications effectuées

### 1. Types TypeScript (src/types/recurring-invoice.ts)
- ✅ Enum `RecurringInvoiceStatus` (ACTIVE, PAUSED, INACTIVE)
- ✅ Enum `DiscountType` (PERCENTAGE, FIXED)
- ✅ Labels pour statuts et types de remise
- ✅ Interface `RecurringInvoiceStats`
- ✅ Interface `BulkUpdateRecurringInvoicesDto`
- ✅ Interface `InvoiceHistoryItem`
- ✅ Mise à jour `RecurringInvoice` avec nouveaux champs

### 2. API Client (src/api/recurring-invoices.ts)
- ✅ `getRecurringInvoiceStats()` - statistiques
- ✅ `pauseRecurringInvoice()` - mettre en pause
- ✅ `resumeRecurringInvoice()` - reprendre
- ✅ `bulkUpdateRecurringInvoices()` - actions en masse
- ✅ `getRecurringInvoiceHistory()` - historique

### 3. Hooks React Query (src/hooks/useRecurringInvoices.ts)
- ✅ `useRecurringInvoiceStats()` - hook pour statistiques
- ✅ `useRecurringInvoiceHistory()` - hook pour historique
- ✅ `usePauseRecurringInvoice()` - hook pause
- ✅ `useResumeRecurringInvoice()` - hook resume
- ✅ `useBulkUpdateRecurringInvoices()` - hook actions en masse
- ✅ Invalidation cache stats après chaque mutation

### 4. Hook Debounce (src/hooks/useDebounce.ts)
- ✅ Hook personnalisé pour debounce de recherche (300ms)

### 5. Modal RecurringInvoiceModal (src/components/sales/RecurringInvoiceModal.tsx)
- ✅ Prévisualisation des 5 prochaines dates
- ✅ Dates urgentes (< 7 jours) en orange
- ✅ Gestion des remises (pourcentage et fixe)
- ✅ Calcul en temps réel avec remise
- ✅ Affichage détaillé : Montant HT → Remise → Net HT → TVA → Timbre → Total TTC

## Prochaines étapes

### À implémenter:

1. **Stats Banner Component**
   - 4 metric cards au-dessus de la table
   - Revenu mensuel prévisionnel
   - Récurrences actives/total
   - Factures générées ce mois
   - Taux d'activation avec barre

2. **Page RecurringInvoicesPage - Améliorations**
   - Filtres avancés (status, frequency, search avec debounce)
   - Onglet "En pause" ajouté
   - Badge statut coloré (Active/En pause/Inactive)
   - Badge remise sur les lignes (-10% ou -50 DT)
   - Boutons contextuels (Pause/Resume selon statut)

3. **Actions en masse (Bulk)**
   - Checkbox header + checkbox par ligne
   - Bulk action bar quand ≥1 sélectionnée
   - Boutons: Activer, Mettre en pause, Supprimer
   - Dialog de confirmation pour suppression

4. **Drawer Historique**
   - Bouton "Historique" sur chaque ligne
   - Drawer latéral droit
   - Table des factures générées
   - Pagination si > 10 résultats
   - Lien vers chaque facture

## Structure des composants à créer

```
src/components/sales/
├── RecurringInvoiceModal.tsx ✅ (FAIT)
├── RecurringInvoiceStatsCards.tsx (À CRÉER)
├── RecurringInvoiceHistoryDrawer.tsx (À CRÉER)
└── RecurringInvoiceBulkActions.tsx (À CRÉER)

src/pages/backoffice/sales/
└── RecurringInvoicesPage.tsx (À METTRE À JOUR)
```

## Fonctionnalités par priorité

1. ✅ Prévisualisation dates (FAIT)
2. ✅ Types et API (FAIT)
3. ✅ Hooks (FAIT)
4. ✅ Modal avec remises (FAIT)
5. ⏳ Stats Banner
6. ⏳ Filtres avancés
7. ⏳ Actions en masse
8. ⏳ Drawer historique
9. ⏳ Mise à jour page principale
