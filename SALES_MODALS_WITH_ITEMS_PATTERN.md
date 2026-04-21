# Pattern de validation pour modaux avec items (lignes)

## 🎯 Modaux concernés
- QuoteModal (lignes de devis)
- SalesOrderModal (lignes de commande)
- DeliveryNoteModal (lignes de livraison)
- SalesInvoiceModal (peut avoir des items)

## 📦 Pattern pour useFieldArray avec Zod

### 1. Imports nécessaires
```typescript
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaName, SchemaFormValues, itemSchemaName } from '@/schemas/sales.schemas';
```

### 2. Configuration useForm avec items
```typescript
const {
  register,
  control,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isSubmitting },
} = useForm<SchemaFormValues>({
  resolver: zodResolver(schemaName),
  mode: 'onSubmit',
  reValidateMode: 'onChange',
  defaultValues: {
    clientId: '',
    validUntil: '',
    notes: '',
    items: [
      { description: '', quantity: 1, unitPrice: 0, taxRate: 19 }
    ],
  },
});

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
});
```

### 3. Affichage des erreurs pour les items
```typescript
// Erreur globale sur le tableau items
{errors.items?.message && (
  <div className="text-red-600 text-sm mb-2">
    {errors.items.message}
  </div>
)}

// Erreur sur un item spécifique
{errors.items?.[index]?.description?.message && (
  <p className="text-red-600 text-xs mt-1">
    {errors.items[index].description.message}
  </p>
)}
```

### 4. Composant Field pour items
```typescript
const ItemField = ({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex-1">
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);
```

### 5. Exemple de ligne d'item avec validation
```typescript
{fields.map((field, index) => (
  <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
    <div className="flex items-start gap-3">
      {/* Description */}
      <ItemField
        label="Description"
        error={errors.items?.[index]?.description?.message}
        required
      >
        <input
          {...register(`items.${index}.description`)}
          className={`w-full px-3 py-2 text-sm border rounded-lg ${
            errors.items?.[index]?.description
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300'
          }`}
          placeholder="Description du produit"
        />
      </ItemField>

      {/* Quantity */}
      <ItemField
        label="Quantité"
        error={errors.items?.[index]?.quantity?.message}
        required
      >
        <input
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          type="number"
          step="0.001"
          min="0"
          className={`w-32 px-3 py-2 text-sm border rounded-lg ${
            errors.items?.[index]?.quantity
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300'
          }`}
        />
      </ItemField>

      {/* Unit Price */}
      <ItemField
        label="Prix unitaire"
        error={errors.items?.[index]?.unitPrice?.message}
        required
      >
        <input
          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
          type="number"
          step="0.001"
          min="0"
          className={`w-32 px-3 py-2 text-sm border rounded-lg ${
            errors.items?.[index]?.unitPrice
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300'
          }`}
        />
      </ItemField>

      {/* Tax Rate */}
      <ItemField
        label="TVA %"
        error={errors.items?.[index]?.taxRate?.message}
        required
      >
        <select
          {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
          className={`w-24 px-3 py-2 text-sm border rounded-lg ${
            errors.items?.[index]?.taxRate
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300'
          }`}
        >
          <option value={0}>0%</option>
          <option value={7}>7%</option>
          <option value={13}>13%</option>
          <option value={19}>19%</option>
        </select>
      </ItemField>

      {/* Delete button */}
      {fields.length > 1 && (
        <button
          type="button"
          onClick={() => remove(index)}
          className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
))}
```

### 6. Bouton d'ajout de ligne
```typescript
<button
  type="button"
  onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 19 })}
  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
>
  <Plus className="h-4 w-4" />
  Ajouter une ligne
</button>
```

### 7. Calculs automatiques avec watch
```typescript
const watchedItems = watch('items') || [];

const computed = watchedItems.map(item => {
  const qty = Number(item?.quantity) || 0;
  const price = Number(item?.unitPrice) || 0;
  const rate = Number(item?.taxRate) || 0;
  const total = Math.round(qty * price * 1000) / 1000;
  const tax = Math.round(total * (rate / 100) * 1000) / 1000;
  return { total, tax };
});

const subtotal = computed.reduce((sum, c) => sum + c.total, 0);
const taxAmount = computed.reduce((sum, c) => sum + c.tax, 0);
const netAmount = subtotal + taxAmount + TIMBRE_FISCAL;
```

## 🎨 Styles spécifiques pour items

### Conteneur de ligne
```css
border border-gray-200 rounded-lg p-4 bg-gray-50
```

### Input avec erreur dans item
```css
border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200
```

### Message d'erreur compact pour items
```css
text-red-600 text-xs mt-1 flex items-center gap-1
```

## ⚠️ Points d'attention

### 1. Validation du tableau items
Le schéma Zod valide automatiquement:
- Minimum 1 item
- Maximum 100 items
- Chaque champ de chaque item

### 2. Erreurs multiples
Un item peut avoir plusieurs erreurs simultanées (description vide, quantité négative, etc.)

### 3. Performance
Utiliser `watch` avec parcimonie pour éviter les re-renders excessifs

### 4. Suppression de ligne
Toujours garder au moins 1 ligne (désactiver le bouton supprimer si `fields.length === 1`)

### 5. Valeurs par défaut
Toujours fournir des valeurs par défaut valides pour les nouveaux items

## 📝 Checklist d'implémentation

Pour chaque modal avec items:
- [ ] Importer `useFieldArray` de react-hook-form
- [ ] Configurer le schéma Zod avec validation des items
- [ ] Créer le composant `ItemField` pour les champs d'items
- [ ] Implémenter `fields.map()` avec validation par index
- [ ] Ajouter les boutons Ajouter/Supprimer ligne
- [ ] Afficher les erreurs globales du tableau
- [ ] Afficher les erreurs spécifiques par item et par champ
- [ ] Implémenter les calculs automatiques avec `watch`
- [ ] Tester avec 0 items (doit afficher erreur)
- [ ] Tester avec items invalides (doit afficher erreurs spécifiques)
- [ ] Tester l'ajout/suppression de lignes
- [ ] Vérifier que les erreurs disparaissent après correction

## 🚀 Ordre d'implémentation recommandé

1. **QuoteModal** - Le plus simple, bon modèle de référence
2. **SalesOrderModal** - Très similaire à QuoteModal
3. **SalesInvoiceModal** - Ajoute la validation de montants
4. **DeliveryNoteModal** - Plus complexe (validation de dates dynamiques)
