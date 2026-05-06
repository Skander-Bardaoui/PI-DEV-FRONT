# Tests des Hooks - Modules Purchases et Sales

## 📋 Vue d'ensemble

Ce document liste les tests unitaires créés pour les hooks React des modules Purchases et Sales.

## ✅ Hooks Testés

### 1. usePurchaseInvoices.test.ts

**Localisation**: `src/hooks/usePurchaseInvoices.test.ts`

#### Fonctionnalités Testées

##### Chargement des Données
- ✅ Chargement réussi des factures
- ✅ Gestion des erreurs de chargement
- ✅ État de chargement (loading)
- ✅ Pagination

##### Filtres
- ✅ Filtrage par statut (PENDING, APPROVED, etc.)
- ✅ Filtrage par fournisseur (supplier_id)
- ✅ Filtrage par dates

##### Opérations CRUD
- ✅ Création de facture
- ✅ Mise à jour de facture
- ✅ Suppression de facture
- ✅ Gestion des erreurs pour chaque opération

##### Opérations Métier
- ✅ Approbation de facture
- ✅ Mise en litige
- ✅ Résolution de litige
- ✅ Mise à jour des paiements

**Total**: ~15 tests

### 2. useSalesInvoices.test.ts

**Localisation**: `src/hooks/useSalesInvoices.test.ts`

#### Fonctionnalités Testées

##### Chargement des Données
- ✅ Chargement réussi des factures
- ✅ Gestion des erreurs de chargement
- ✅ État de chargement (loading)
- ✅ Pagination

##### Filtres
- ✅ Filtrage par statut (DRAFT, SENT, PAID, etc.)
- ✅ Filtrage par client (client_id)
- ✅ Recherche par terme (search)
- ✅ Filtrage par type de facture

##### Opérations CRUD
- ✅ Création de facture avec items
- ✅ Mise à jour de facture
- ✅ Suppression de facture
- ✅ Gestion des erreurs pour chaque opération

##### Opérations Métier
- ✅ Envoi de facture (simple)
- ✅ Envoi par email (avec données personnalisées)
- ✅ Génération de brouillon d'email (FR/AR)
- ✅ Envoi de rappel de paiement
- ✅ Marquage comme payée
- ✅ Marquage comme partiellement payée
- ✅ Marquage comme en retard
- ✅ Annulation de facture

**Total**: ~20 tests

## 📊 Statistiques

- **Fichiers de tests**: 2
- **Total de tests**: ~35
- **Framework**: Vitest + React Testing Library
- **Couverture**: Hooks principaux des modules Purchases et Sales

## 🚀 Exécution des Tests

### Tous les tests
```bash
npm run test
```

### Tests spécifiques
```bash
# Hook des factures d'achat
npm run test -- usePurchaseInvoices

# Hook des factures de vente
npm run test -- useSalesInvoices
```

### Avec couverture
```bash
npm run test:coverage
```

### Mode watch
```bash
npm run test:watch
```

### Mode UI (interface graphique)
```bash
npm run test:ui
```

## 🎯 Patterns de Test Utilisés

### 1. Mocking des API

```typescript
vi.mock('../api/purchase-invoices');

// Dans le test
vi.mocked(purchaseInvoicesApi.getPurchaseInvoices).mockResolvedValue(mockResponse);
```

### 2. Testing des Hooks

```typescript
const { result } = renderHook(() => usePurchaseInvoices(businessId));

await waitFor(() => {
  expect(result.current.invoices).toEqual(mockInvoices);
  expect(result.current.loading).toBe(false);
});
```

### 3. Testing des Opérations Asynchrones

```typescript
await result.current.createInvoice(newInvoice);

await waitFor(() => {
  expect(result.current.invoices).toHaveLength(2);
});
```

### 4. Testing des Erreurs

```typescript
const mockError = new Error('Failed to fetch invoices');
vi.mocked(api.getInvoices).mockRejectedValue(mockError);

await waitFor(() => {
  expect(result.current.error).toBe('Failed to fetch invoices');
});
```

## 📝 Structure d'un Test Type

```typescript
describe('usePurchaseInvoices', () => {
  const businessId = 'business-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchInvoices', () => {
    it('should fetch invoices successfully', async () => {
      // Arrange
      const mockResponse = { data: mockInvoices, total: 2 };
      vi.mocked(api.getInvoices).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useHook(businessId));

      // Assert
      await waitFor(() => {
        expect(result.current.invoices).toEqual(mockInvoices);
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
```

## 🔧 Configuration Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
      ],
    },
  },
});
```

## 📚 Hooks Additionnels à Tester

### Module Purchases
- [ ] `useSuppliers.ts`
- [ ] `useSupplierPOs.ts`
- [ ] `useGoodsReceipts.ts`
- [ ] `useThreeWayMatching.ts`
- [ ] `usePurchaseAlerts.ts`

### Module Sales
- [ ] `useClients.ts`
- [ ] `useSalesOrders.ts`
- [ ] `useQuotes.ts`
- [ ] `useDeliveryNotes.ts`
- [ ] `useRecurringInvoices.ts`

### Hooks Utilitaires
- [x] `useDebounce.test.ts` (existe déjà)
- [x] `useToggle.test.ts` (existe déjà)
- [ ] `useFormValidation.ts`
- [ ] `useErrorHandler.ts`

## 🎓 Bonnes Pratiques

### 1. Isolation des Tests
- Chaque test est indépendant
- Utilisation de `beforeEach` pour réinitialiser les mocks
- Pas de dépendances entre les tests

### 2. Nomenclature Claire
- Descriptions en français
- Structure `describe` / `it` cohérente
- Noms de tests explicites

### 3. Couverture Complète
- Tests des cas nominaux
- Tests des cas d'erreur
- Tests des cas limites
- Tests de la pagination

### 4. Assertions Précises
- Vérification des valeurs retournées
- Vérification des appels API
- Vérification des états (loading, error)

### 5. Gestion des Async
- Utilisation de `waitFor` pour les opérations asynchrones
- Gestion correcte des promesses
- Tests des états intermédiaires

## ✅ Checklist de Validation

- [x] Tests du hook usePurchaseInvoices créés
- [x] Tests du hook useSalesInvoices créés
- [x] Mocking des API configuré
- [x] Tests des opérations CRUD
- [x] Tests des opérations métier
- [x] Tests de la pagination
- [x] Tests de la gestion d'erreurs
- [x] Documentation complète
- [ ] Tests des autres hooks (à faire)
- [ ] Tests des composants (à faire)

## 🎉 Résultat

Les hooks principaux des modules Purchases et Sales sont maintenant **testés et validés** avec:

- **~35 tests unitaires**
- **Couverture complète** des fonctionnalités
- **Gestion des erreurs** testée
- **Pagination** validée
- **Opérations métier** couvertes

Les tests sont **prêts à être intégrés** dans le pipeline CI/CD!
