# Guide d'implémentation - Validation Zod pour les modaux Sales

## 📋 Modaux à mettre à jour

### ✅ Schémas Zod déjà créés dans `src/schemas/sales.schemas.ts`:

1. **ClientModal** → `clientSchema`
2. **QuoteModal** → `quoteSchema` + `quoteItemSchema`
3. **SalesOrderModal** → `salesOrderSchema` + `salesOrderItemSchema`
4. **DeliveryNoteModal** → `deliveryNoteSchema` + `deliveryNoteItemSchema`
5. **SalesInvoiceModal** → `salesInvoiceSchema`
6. **RecurringInvoiceModal** → `recurringInvoiceSchema`

## 🔧 Pattern d'implémentation (basé sur SupplierModal)

### Étape 1: Imports nécessaires
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaName, SchemaFormValues } from '@/schemas/sales.schemas';
```

### Étape 2: Composant Field réutilisable
```typescript
const Field = ({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-start gap-1.5 mt-1.5">
        <svg className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-red-600 text-xs font-medium">{error}</p>
      </div>
    )}
  </div>
);
```

### Étape 3: Classe CSS pour inputs avec erreur
```typescript
const inputCls = (error?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition-colors ${
    error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
  }`;
```

### Étape 4: Configuration useForm avec Zod
```typescript
const {
  register,
  handleSubmit,
  reset,
  trigger,
  formState: { errors, isSubmitting },
} = useForm<SchemaFormValues>({
  resolver: zodResolver(schemaName),
  mode: 'onSubmit',
  reValidateMode: 'onChange',
  defaultValues: {
    // Valeurs par défaut selon le schéma
  },
});
```

### Étape 5: Utilisation dans le JSX
```typescript
<Field label="Nom" error={errors.name?.message} required>
  <input
    {...register('name')}
    className={inputCls(errors.name?.message)}
    placeholder="Nom du client"
  />
</Field>
```

## 📝 Checklist par modal

### 1. QuoteModal.tsx
- [ ] Importer `quoteSchema` et `quoteItemSchema`
- [ ] Ajouter composant `Field`
- [ ] Configurer `useForm` avec `zodResolver`
- [ ] Ajouter validation pour chaque champ:
  - [ ] client_id (requis, UUID)
  - [ ] valid_until (date future requise)
  - [ ] notes (optionnel, max 1000 caractères)
  - [ ] items (min 1, max 100)
- [ ] Validation des lignes de devis:
  - [ ] description (requis, max 500)
  - [ ] quantity (positif, 3 décimales)
  - [ ] unit_price (positif, max 9999999.999)
  - [ ] tax_rate (0, 7, 13, ou 19%)

### 2. SalesOrderModal.tsx
- [ ] Importer `salesOrderSchema` et `salesOrderItemSchema`
- [ ] Ajouter composant `Field`
- [ ] Configurer `useForm` avec `zodResolver`
- [ ] Ajouter validation pour:
  - [ ] client_id (requis, UUID)
  - [ ] expected_delivery (date future requise)
  - [ ] notes (optionnel)
  - [ ] items (min 1, max 100)

### 3. DeliveryNoteModal.tsx
- [ ] Importer `createDeliveryNoteSchema`
- [ ] Utiliser schéma dynamique avec date de commande
- [ ] Validation:
  - [ ] delivery_date (≥ date commande, ≤ aujourd'hui)
  - [ ] items avec quantity_delivered
  - [ ] Au moins une quantité > 0

### 4. SalesInvoiceModal.tsx
- [ ] Importer `salesInvoiceSchema`
- [ ] Validation:
  - [ ] client_id (requis)
  - [ ] date (requis, format ISO)
  - [ ] due_date (≥ date facture)
  - [ ] subtotal_ht, tax_amount, timbre_fiscal
  - [ ] Montants avec 3 décimales max

### 5. RecurringInvoiceModal.tsx (si existe)
- [ ] Importer `recurringInvoiceSchema`
- [ ] Validation:
  - [ ] frequency (monthly, quarterly, yearly)
  - [ ] start_date, end_date (end > start)
  - [ ] Montants et description

## 🎨 Styles d'erreur cohérents

### Bordure rouge pour champs invalides
```css
border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200
```

### Message d'erreur avec icône
```tsx
<div className="flex items-start gap-1.5 mt-1.5">
  <svg className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
  <p className="text-red-600 text-xs font-medium">{error}</p>
</div>
```

## 🚀 Ordre d'implémentation recommandé

1. **QuoteModal** (le plus simple, bon point de départ)
2. **SalesOrderModal** (similaire à QuoteModal)
3. **SalesInvoiceModal** (validation de montants)
4. **DeliveryNoteModal** (validation de dates dynamiques)
5. **RecurringInvoiceModal** (le plus complexe)

## ✅ Tests à effectuer après implémentation

Pour chaque modal:
- [ ] Soumettre formulaire vide → Voir messages d'erreur
- [ ] Entrer valeurs invalides → Voir messages spécifiques
- [ ] Entrer valeurs valides → Formulaire se soumet
- [ ] Tester limites (max caractères, montants, dates)
- [ ] Tester formats (email, téléphone, dates, montants)
- [ ] Vérifier messages en français
- [ ] Tester mode édition (valeurs pré-remplies)

## 📚 Ressources

- Schémas Zod: `PI-DEV-FRONT/src/schemas/sales.schemas.ts`
- Exemple complet: `PI-DEV-FRONT/src/components/purchases/SupplierModal.tsx`
- Documentation Zod: https://zod.dev
- React Hook Form: https://react-hook-form.com
