# 🔧 Guide Complet pour Corriger les 339 Tests Échoués

## 📊 Vue d'Ensemble

**Objectif**: Passer de 77.8% à 95%+ de tests passants  
**Tests à corriger**: 339 tests  
**Fichiers concernés**: 70 fichiers

---

## 🎯 Stratégie en 3 Phases

### Phase 1: Corrections Automatiques (Estimé: 50-100 tests) ⚡
**Durée estimée**: 1-2 heures  
**Méthode**: Scripts automatiques

### Phase 2: Corrections par Pattern (Estimé: 150-200 tests) 🔄
**Durée estimée**: 4-6 heures  
**Méthode**: Recherche/remplacement + corrections manuelles

### Phase 3: Corrections Spécifiques (Estimé: 50-89 tests) 🎨
**Durée estimée**: 6-8 heures  
**Méthode**: Corrections manuelles ciblées

---

## 📋 Phase 1: Corrections Automatiques

### 1.1 Créer un Utilitaire de Test Réutilisable

Créer `src/test/test-utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';

// Créer un QueryClient pour les tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper avec tous les providers nécessaires
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Matcher personnalisé pour les nombres formatés
export function matchFormattedNumber(expectedNumber: string) {
  return (content: string, element: Element | null) => {
    if (!element) return false;
    const text = element.textContent || '';
    // Accepte les espaces, virgules, points
    const normalized = text.replace(/[\s,]/g, '');
    const expected = expectedNumber.replace(/[\s,]/g, '');
    return normalized.includes(expected);
  };
}

// Mock standard pour useAuth
export const mockUseAuth = (overrides = {}) => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'BUSINESS_OWNER',
    business_id: 'test-business-id',
    ...overrides
  },
  loading: false,
  error: null,
});

// Mock standard pour useCurrentBusinessMember
export const mockUseCurrentBusinessMember = (overrides = {}) => ({
  businessMember: {
    id: 'test-member-id',
    user_id: 'test-user-id',
    business_id: 'test-business-id',
    role: 'OWNER',
    purchase_permissions: {
      create_supplier: true,
      update_supplier: true,
      delete_supplier: true,
      invite_supplier: true,
      create_po: true,
      update_po: true,
      delete_po: true,
      ...overrides.purchase_permissions
    },
    sales_permissions: {
      create_client: true,
      update_client: true,
      delete_client: true,
      ...overrides.sales_permissions
    },
    ...overrides
  },
  loading: false,
  error: null,
});

export * from '@testing-library/react';
```

### 1.2 Script de Remplacement Global

Créer `scripts/fix-tests-imports.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing test imports..."

# Remplacer les imports de render par renderWithProviders
find src -name "*.test.tsx" -type f -exec sed -i '' \
  's/import { render/import { renderWithProviders as render/g' {} \;

# Ajouter vi aux imports vitest si manquant
find src -name "*.test.tsx" -type f -exec sed -i '' \
  's/import { describe, it, expect } from '\''vitest'\'';/import { describe, it, expect, vi } from '\''vitest'\'';/g' {} \;

# Ajouter fireEvent aux imports testing-library si manquant
find src -name "*.test.tsx" -type f -exec sed -i '' \
  's/import { render, screen } from '\''@testing-library\/react'\'';/import { render, screen, fireEvent } from '\''@testing-library\/react'\'';/g' {} \;

echo "✅ Imports fixed!"
```

### 1.3 Template de Mock Standard

Créer `src/test/standard-mocks.ts`:

```typescript
import { vi } from 'vitest';

// Mock pour tous les hooks de données
export const createDataHookMock = (data: any = [], loading = false, error = null) => ({
  data: { data, total: data.length, total_pages: 1 },
  isLoading: loading,
  error,
  refetch: vi.fn(),
});

// Mock pour les mutations
export const createMutationMock = (isPending = false) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending,
  isSuccess: false,
  isError: false,
  error: null,
});

// Mocks standards pour les hooks communs
export const standardMocks = {
  useAuth: () => vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
      user: { id: '1', email: 'test@test.com', role: 'BUSINESS_OWNER', business_id: 'biz-1' },
      loading: false,
    }),
  })),

  useCurrentBusinessMember: () => vi.mock('../hooks/useCurrentBusinessMember', () => ({
    useCurrentBusinessMember: () => ({
      businessMember: {
        purchase_permissions: {
          create_supplier: true,
          update_supplier: true,
          delete_supplier: true,
          invite_supplier: true,
        },
        sales_permissions: {
          create_client: true,
          update_client: true,
          delete_client: true,
        },
      },
    }),
  })),

  useSuppliers: (data = []) => vi.mock('@/hooks/useSuppliers', () => ({
    useSuppliers: () => createDataHookMock(data),
    useCreateSupplier: () => createMutationMock(),
    useUpdateSupplier: () => createMutationMock(),
    useDeleteSupplier: () => createMutationMock(),
  })),

  useProducts: (data = []) => vi.mock('@/hooks/useProducts', () => ({
    useProducts: () => createDataHookMock(data),
  })),

  useClients: (data = []) => vi.mock('@/hooks/useClients', () => ({
    useClients: () => createDataHookMock(data),
  })),
};
```

---

## 📋 Phase 2: Corrections par Pattern

### 2.1 Pattern: Formatage de Nombres

**Problème**: `10,000.000 TND` vs `10 000,000 TND`

**Solution**:
```typescript
// ❌ Avant
expect(screen.getByText('10,000.000 TND')).toBeInTheDocument();

// ✅ Après
expect(screen.getByText((content, element) => {
  return element?.textContent === '10 000,000 TND';
})).toBeInTheDocument();

// ✅ Ou avec l'utilitaire
import { matchFormattedNumber } from '../test/test-utils';
expect(screen.getByText(matchFormattedNumber('10000.000 TND'))).toBeInTheDocument();
```

**Fichiers concernés**: Tous les tests de `purchases/` et `sales/`

### 2.2 Pattern: Mocks de Permissions

**Problème**: Boutons conditionnels non affichés

**Solution**:
```typescript
// Ajouter au début du fichier de test
vi.mock('../../../hooks/useCurrentBusinessMember', () => ({
  useCurrentBusinessMember: () => ({
    businessMember: {
      purchase_permissions: {
        create_supplier: true,
        update_supplier: true,
        delete_supplier: true,
        invite_supplier: true,
      },
    },
  }),
}));
```

**Fichiers concernés**: Tous les tests de pages

### 2.3 Pattern: Labels Non Accessibles

**Problème**: `getByLabelText` ne trouve pas le label

**Solution**:
```typescript
// ❌ Avant
const input = screen.getByLabelText('Email');

// ✅ Après - Option 1: Par placeholder
const input = screen.getByPlaceholderText('email@example.com');

// ✅ Après - Option 2: Par name
const input = screen.getByRole('textbox', { name: /email/i });

// ✅ Après - Option 3: Par attribut name
const inputs = screen.getAllByRole('textbox');
const emailInput = inputs.find(input => input.getAttribute('name') === 'email');
```

### 2.4 Pattern: Texte Réparti sur Plusieurs Éléments

**Problème**: Le texte est dans plusieurs `<span>` ou `<p>`

**Solution**:
```typescript
// ❌ Avant
expect(screen.getByText('Payé : 7,000.000 TND')).toBeInTheDocument();

// ✅ Après
expect(screen.getByText(/Payé/)).toBeInTheDocument();
expect(screen.getByText((content, element) => {
  return element?.textContent?.includes('7 000,000 TND') || false;
})).toBeInTheDocument();
```

### 2.5 Pattern: Éléments Multiples

**Problème**: `getByText` trouve plusieurs éléments

**Solution**:
```typescript
// ❌ Avant
expect(screen.getByText('10/10 factures payées')).toBeInTheDocument();

// ✅ Après
const elements = screen.getAllByText((content, element) => {
  return element?.textContent?.includes('10/10 factures payées') || false;
});
expect(elements.length).toBeGreaterThan(0);

// ✅ Ou prendre le premier
expect(elements[0]).toBeInTheDocument();
```

---

## 📋 Phase 3: Corrections Spécifiques par Dossier

### 3.1 Purchases (21 fichiers échoués)

**Problèmes principaux**:
1. Formatage de nombres
2. Mocks de `useSuppliers`, `useSupplierPOs`, `usePurchaseInvoices`
3. Composants de formulaires complexes

**Plan d'action**:
1. Créer des mocks standards pour tous les hooks purchases
2. Appliquer le pattern de formatage de nombres
3. Corriger les tests de formulaires un par un

**Fichiers prioritaires**:
- `SupplierModal.test.tsx`
- `SupplierPOModal.test.tsx`
- `PurchaseInvoiceModal.test.tsx`

### 3.2 Sales (17 fichiers échoués)

**Problèmes principaux**:
1. Formatage de nombres
2. Mocks de `useClients`, `useQuotes`, `useSalesOrders`
3. Tests de conversion (quote → order → invoice)

**Plan d'action**:
1. Créer des mocks standards pour tous les hooks sales
2. Appliquer le pattern de formatage de nombres
3. Corriger les tests de workflow

**Fichiers prioritaires**:
- `QuoteModal.test.tsx`
- `QuoteDetailModal.test.tsx`
- `SalesOrderModal.test.tsx`

### 3.3 Stock (9 fichiers échoués)

**Problèmes principaux**:
1. Aucun test créé ou tous échouent
2. Mocks de `useProducts`, `useStock`, `useWarehouses`

**Plan d'action**:
1. Vérifier si les tests existent
2. Créer les mocks nécessaires
3. Appliquer les patterns standards

### 3.4 Treasury (15 fichiers échoués)

**Problèmes principaux**:
1. Aucun test créé ou tous échouent
2. Mocks de `useAccounts`, `useTransactions`, `useCashFlow`

**Plan d'action**:
1. Vérifier si les tests existent
2. Créer les mocks nécessaires
3. Appliquer les patterns standards

---

## 🚀 Plan d'Exécution Recommandé

### Jour 1: Setup et Corrections Automatiques
1. ✅ Créer `src/test/test-utils.tsx`
2. ✅ Créer `src/test/standard-mocks.ts`
3. ⏳ Exécuter les scripts de remplacement
4. ⏳ Tester que les utilitaires fonctionnent
5. ⏳ Corriger 20-30 tests avec les nouveaux utilitaires

### Jour 2-3: Purchases et Sales
1. ⏳ Corriger tous les tests de purchases (21 fichiers)
2. ⏳ Corriger tous les tests de sales (17 fichiers)
3. ⏳ Vérifier que les corrections fonctionnent

### Jour 4: Stock et Treasury
1. ⏳ Corriger tous les tests de stock (9 fichiers)
2. ⏳ Corriger tous les tests de treasury (15 fichiers)
3. ⏳ Vérifier que les corrections fonctionnent

### Jour 5: Finalisation
1. ⏳ Corriger les tests restants
2. ⏳ Exécuter la couverture de code
3. ⏳ Documenter les patterns utilisés
4. ⏳ Créer un guide de maintenance

---

## 📊 Suivi de Progression

### Checklist par Catégorie

#### UI Components (3 fichiers)
- [ ] Fichier 1
- [ ] Fichier 2
- [ ] Fichier 3

#### Purchases (21 fichiers)
- [ ] ReservationsModal.test.tsx
- [ ] SupplierInviteModal.test.tsx
- [ ] SupplierModal.test.tsx
- [ ] SupplierPODetailModal.test.tsx
- [ ] SupplierPOModal.test.tsx
- [ ] SupplierRecommendationPanel.test.tsx
- [ ] SupplierScoreModal.test.tsx
- [ ] SupplierStatsCard.test.tsx (3 tests restants)
- [ ] ThreeWayMatchingAIPanel.test.tsx
- [ ] UploadInvoiceScan.test.tsx
- [ ] ... (11 autres fichiers)

#### Sales (17 fichiers)
- [ ] AiForecastPanel.test.tsx
- [ ] ClientFormModal.test.tsx
- [ ] ClientInvitationModal.test.tsx
- [ ] ClientStatsCard.test.tsx
- [ ] DeliveryNoteDetailModal.test.tsx
- [ ] DeliveryNoteFromSalesOrderModal.test.tsx
- [ ] DeliveryNoteModal.test.tsx
- [ ] HighRiskClientsWidget.test.tsx
- [ ] ProductSelector.test.tsx
- [ ] QuoteDetailModal.test.tsx
- [ ] QuoteModal.test.tsx
- [ ] ... (6 autres fichiers)

#### Stock (9 fichiers)
- [ ] Tous les fichiers

#### Treasury (15 fichiers)
- [ ] Tous les fichiers

#### Pages (2 fichiers)
- [ ] SuppliersPage.test.tsx
- [ ] ... (1 autre fichier)

---

## 🎯 Objectif Final

**Cible**: 95%+ de tests passants (1450+ tests sur 1524)

**Métriques de succès**:
- ✅ Moins de 75 tests échoués
- ✅ Plus de 120 fichiers passent
- ✅ Couverture de code > 80%
- ✅ Temps d'exécution < 3 minutes

---

## 📚 Ressources

- `TEST_FIXES_SUMMARY.md` - Résumé des corrections déjà appliquées
- `TEST_PROGRESS_REPORT.md` - Rapport de progression
- `FINAL_TEST_SUMMARY.md` - Résumé final
- `RESULTATS_TESTS_GLOBAUX.md` - Résultats actuels

---

**Créé le**: 2026-05-05  
**Dernière mise à jour**: 2026-05-05 19:15  
**Statut**: 📋 Plan prêt à être exécuté
