# 📋 Plan de Création des Tests Manquants

## 🎯 Objectif
Créer tous les tests unitaires manquants pour atteindre 95%+ de couverture

---

## 📊 État Actuel

| Module | Fichiers à Tester | Tests Manquants | Priorité |
|--------|------------------|-----------------|----------|
| **Stock** | 9 fichiers | 9 tests | 🔴 Critique |
| **Treasury** | 15 fichiers | 15 tests | 🔴 Critique |
| **Sales** | 25 fichiers | ~14 tests manquants | 🟡 Haute |
| **Purchases** | 36 fichiers | ~3 tests manquants | 🟢 Moyenne |
| **Pages** | 3 fichiers | ~2 tests manquants | 🟡 Haute |

**Total à créer**: ~43 nouveaux fichiers de tests

---

## 🚀 Plan d'Exécution

### Phase 1: Stock (9 fichiers) - Priorité 🔴
1. ✅ StockCard.test.tsx
2. ✅ CategoryFormModal.test.tsx
3. ✅ CategoryTable.test.tsx
4. ✅ MovementTable.test.tsx
5. ✅ ProductFormModal.test.tsx
6. ✅ ProductTable.test.tsx
7. ✅ StockMovementFormModal.test.tsx
8. ✅ StockSkeletonLoaders.test.tsx
9. ✅ WarehouseFormModal.test.tsx

### Phase 2: Treasury (15 fichiers) - Priorité 🔴
1. ✅ TreasuryWidget.test.tsx
2. ✅ AccountModal.test.tsx
3. ✅ CashFlowForecast.test.tsx
4. ✅ Clientpaymentmodal.test.tsx
5. ✅ DepositModal.test.tsx
6. ✅ ExpensesToPayPage.test.tsx
7. ✅ InstallmentScheduleModal.test.tsx
8. ✅ RecurringInvoices.test.tsx
9. ✅ SalaryToPayPage.test.tsx
10. ✅ SendSalarycomponent.test.tsx
11. ✅ SkeletonLoaders.test.tsx
12. ✅ Supplierpaymentmodal.test.tsx
13. ✅ Transactions.test.tsx
14. ✅ TransferModal.test.tsx
15. ✅ TreasuryInvoicesPage.test.tsx

### Phase 3: Sales Manquants (~14 fichiers) - Priorité 🟡
1. ✅ RecurringInvoiceBulkActions.test.tsx
2. ✅ RecurringInvoiceHistoryDrawer.test.tsx
3. ✅ RecurringInvoiceModal.test.tsx
4. ✅ RecurringInvoiceStatsCards.test.tsx
5. ✅ SalesForecastWidget.test.tsx
6. ✅ SalesInvoiceDetailModal.test.tsx
7. ✅ SalesInvoiceModal.test.tsx
8. ✅ SalesMatchingModal.test.tsx
9. ✅ SalesOcrInvoiceModal.test.tsx
10. ✅ SalesOcrModal.test.tsx
11. ✅ SalesOrderDetailModal.test.tsx
12. ✅ SalesOrderModal.test.tsx
13. ✅ SendInvoiceEmailModal.test.tsx
14. ✅ (Autres si nécessaire)

### Phase 4: Purchases Manquants (~3 fichiers) - Priorité 🟢
1. ✅ (Fichiers identifiés lors de l'analyse)

### Phase 5: Pages Manquantes (~2 fichiers) - Priorité 🟡
1. ✅ (Fichiers identifiés lors de l'analyse)

---

## 📝 Template Standard pour Chaque Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentName from './ComponentName';

// Mocks
vi.mock('../../hooks/useHook', () => ({
  useHook: vi.fn(() => ({ data: [], loading: false })),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockFn = vi.fn();
    render(<ComponentName onAction={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    // Mock loading state
    render(<ComponentName />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle errors', () => {
    // Mock error state
    render(<ComponentName />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## 🎯 Objectifs de Couverture par Phase

### Après Phase 1 (Stock)
- Stock: 0% → 70%+
- Global: 45-50% → 50-55%

### Après Phase 2 (Treasury)
- Treasury: 0% → 70%+
- Global: 50-55% → 60-65%

### Après Phase 3 (Sales)
- Sales: 25-30% → 70%+
- Global: 60-65% → 75-80%

### Après Phase 4-5 (Purchases + Pages)
- Purchases: 35-40% → 80%+
- Pages: 25-30% → 80%+
- Global: 75-80% → 85-90%+

---

**Début**: 2026-05-05 19:30  
**Statut**: 🚀 En cours d'exécution
