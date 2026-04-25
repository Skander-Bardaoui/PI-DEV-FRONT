# 🔧 Améliorations Reliability & Réduction Duplications - Frontend

## 📊 État Actuel (SonarQube)

- **Reliability**: C (452 issues)
- **Duplications**: 9.5%
- **Objectif**: A (0 bugs) et < 3% duplications

## 🎯 Actions pour Améliorer la Reliability

### 1. Gestion des Erreurs dans les Hooks

**Problème**: Promesses non gérées, erreurs non catchées

**Solution**: Wrapper pour les hooks avec gestion d'erreurs

Créer `src/hooks/useErrorHandler.ts`:
```typescript
import { useCallback } from 'react';
import { toast } from 'sonner';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    toast.error(message);
  }, []);

  return { handleError };
}
```

### 2. Validation des Props dans les Composants

**Problème**: Props optionnelles non vérifiées

**Solution**: Utiliser des guards et valeurs par défaut

```typescript
// Avant (risqué)
function Component({ data }) {
  return <div>{data.name}</div>; // Crash si data est undefined
}

// Après (sûr)
function Component({ data }: { data?: Data }) {
  if (!data) return null;
  return <div>{data.name}</div>;
}
```

### 3. Gestion des Promesses

**Problème**: Promesses non awaited ou sans .catch()

**Solution**: Toujours gérer les erreurs

```typescript
// Avant (risqué)
const fetchData = () => {
  api.getData(); // Promesse non gérée
};

// Après (sûr)
const fetchData = async () => {
  try {
    await api.getData();
  } catch (error) {
    handleError(error, 'fetchData');
  }
};
```

### 4. Null Safety

**Problème**: Accès à des propriétés potentiellement null/undefined

**Solution**: Optional chaining et nullish coalescing

```typescript
// Avant (risqué)
const name = user.profile.name;

// Après (sûr)
const name = user?.profile?.name ?? 'Unknown';
```

### 5. Array Operations

**Problème**: Opérations sur arrays potentiellement vides

**Solution**: Vérifier la longueur avant

```typescript
// Avant (risqué)
const first = items[0];

// Après (sûr)
const first = items.length > 0 ? items[0] : null;
```

## 🔄 Actions pour Réduire les Duplications

### 1. Extraire les Composants Communs

**Problème**: Même JSX répété dans plusieurs composants

**Solution**: Créer des composants réutilisables

Créer `src/components/common/`:
- `LoadingSpinner.tsx`
- `ErrorMessage.tsx`
- `EmptyState.tsx`
- `ConfirmDialog.tsx`

```typescript
// src/components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
    </div>
  );
}
```

### 2. Créer des Hooks Personnalisés Réutilisables

**Problème**: Même logique répétée dans plusieurs composants

**Solution**: Extraire en hooks custom

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### 3. Utilitaires Communs

**Problème**: Même fonctions utilitaires copiées-collées

**Solution**: Centraliser dans `src/utils/`

```typescript
// src/utils/formatters.ts
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date, format = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format as any,
  }).format(d);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
```

### 4. Constantes Partagées

**Problème**: Mêmes valeurs hardcodées partout

**Solution**: Fichier de constantes

```typescript
// src/constants/index.ts
export const API_ENDPOINTS = {
  SUPPLIERS: '/suppliers',
  PURCHASE_ORDERS: '/purchase-orders',
  GOODS_RECEIPTS: '/goods-receipts',
  INVOICES: '/invoices',
} as const;

export const STATUS_COLORS = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  completed: 'blue',
  cancelled: 'red',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
```

### 5. Types Partagés

**Problème**: Mêmes interfaces/types dupliquées

**Solution**: Fichier de types centralisé

```typescript
// src/types/common.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
```

## 📝 Checklist d'Amélioration

### Reliability
- [ ] Ajouter try-catch dans tous les async functions
- [ ] Utiliser optional chaining (?.) partout
- [ ] Vérifier les arrays avant d'accéder aux éléments
- [ ] Ajouter des guards dans les composants
- [ ] Gérer tous les cas d'erreur dans les hooks
- [ ] Valider les props avec PropTypes ou TypeScript
- [ ] Ajouter des fallbacks pour les données manquantes

### Duplications
- [ ] Extraire les composants communs (Loading, Error, Empty)
- [ ] Créer des hooks réutilisables (useDebounce, useLocalStorage)
- [ ] Centraliser les utilitaires (formatters, validators)
- [ ] Créer un fichier de constantes
- [ ] Définir les types communs
- [ ] Refactoriser les formulaires similaires
- [ ] Utiliser des composants de layout réutilisables

## 🚀 Implémentation Prioritaire

### Phase 1: Quick Wins (1-2h)
1. Créer les composants communs (Loading, Error, Empty)
2. Créer le fichier de constantes
3. Créer les utilitaires de formatage

### Phase 2: Hooks & Utils (2-3h)
4. Créer useErrorHandler
5. Créer useDebounce
6. Créer useLocalStorage
7. Centraliser les types communs

### Phase 3: Refactoring (3-4h)
8. Refactoriser les composants avec duplications
9. Ajouter la gestion d'erreurs partout
10. Améliorer la null safety

## 📊 Résultats Attendus

**Avant:**
- Reliability: C (452 issues)
- Duplications: 9.5%

**Après:**
- Reliability: A (< 10 issues)
- Duplications: < 3%
- Maintainability: A
- Code plus robuste et maintenable

## 🔍 Commandes Utiles

### Trouver les duplications
```bash
# Dans SonarQube
Projects → Frontend React → Duplications
```

### Trouver les bugs
```bash
# Dans SonarQube
Projects → Frontend React → Issues → Type: Bug
```

### Lancer les tests
```bash
npm run test:coverage
```

## ✅ Validation

Après chaque amélioration:
1. Lancer les tests: `npm run test`
2. Vérifier le build: `npm run build`
3. Push et vérifier SonarQube
4. Confirmer l'amélioration des métriques

## 📚 Ressources

- [SonarQube Rules](https://rules.sonarsource.com/typescript/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
