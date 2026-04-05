# 🔧 Guide d'Intégration - Modal de Résolution de Litiges

## Vue d'ensemble

Ce guide explique comment intégrer le nouveau modal de résolution de litiges dans vos pages existantes.

---

## 📦 Fichiers Créés

### 1. Hook: `src/hooks/useDisputeResolution.ts`
- Gère les appels API pour la résolution de litiges
- Exporte les types et enums nécessaires
- Fournit des helpers pour les labels et couleurs

### 2. Composant: `src/components/purchases/DisputeResolutionModal.tsx`
- Modal complet de résolution de litiges
- Interface user-friendly avec actions suggérées
- Formulaires adaptatifs selon l'action choisie

---

## 🚀 Intégration dans PurchaseInvoicesPage

### Étape 1: Importer le Modal et le Hook

```typescript
// Ajouter ces imports en haut du fichier
import { DisputeResolutionModal } from '@/components/purchases/DisputeResolutionModal';
import { useState } from 'react';
```

### Étape 2: Ajouter l'État pour le Modal

```typescript
// Dans le composant, ajouter cet état
const [resolveDisputeInvoiceId, setResolveDisputeInvoiceId] = useState<string | null>(null);
```

### Étape 3: Ajouter le Bouton "Résoudre le Litige"

Dans la section où vous affichez les actions pour chaque facture, ajouter:

```typescript
{/* Pour les factures en litige */}
{invoice.status === 'DISPUTED' && (
  <button
    onClick={() => setResolveDisputeInvoiceId(invoice.id)}
    className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
  >
    <Scale className="w-4 h-4" />
    Résoudre le Litige
  </button>
)}
```

### Étape 4: Ajouter le Modal en Bas du Composant

```typescript
{/* À la fin du return, avant la fermeture */}
<DisputeResolutionModal
  businessId={businessId}
  invoiceId={resolveDisputeInvoiceId || ''}
  isOpen={!!resolveDisputeInvoiceId}
  onClose={() => setResolveDisputeInvoiceId(null)}
  onSuccess={() => {
    // Rafraîchir la liste des factures
    // La query sera invalidée automatiquement par le hook
    setResolveDisputeInvoiceId(null);
  }}
/>
```

---

## 🎨 Exemple Complet d'Intégration

Voici un exemple complet de la section des actions pour une facture:

```typescript
<div className="flex items-center gap-2">
  {/* Voir les détails */}
  <button
    onClick={() => setDetailInvoice(invoice)}
    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
    title="Voir les détails"
  >
    <Eye className="w-5 h-5" />
  </button>

  {/* Actions selon le statut */}
  {invoice.status === 'PENDING' && (
    <>
      <button
        onClick={() => approve.mutate(invoice.id)}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        <Check className="w-4 h-4" />
        Approuver
      </button>
      <button
        onClick={() => setDisputeInvoice(invoice)}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
      >
        <AlertTriangle className="w-4 h-4" />
        Litige
      </button>
    </>
  )}

  {invoice.status === 'DISPUTED' && (
    <>
      {/* NOUVEAU: Bouton de résolution de litige */}
      <button
        onClick={() => setResolveDisputeInvoiceId(invoice.id)}
        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm"
      >
        <Scale className="w-4 h-4" />
        Résoudre le Litige
      </button>
      
      {/* Ancien bouton de résolution simple (optionnel, peut être supprimé) */}
      <button
        onClick={() => resolveDisp.mutate(invoice.id)}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        <CheckCircle className="w-4 h-4" />
        Résolution Simple
      </button>
    </>
  )}

  {(invoice.status === 'APPROVED' || invoice.status === 'PARTIALLY_PAID') && (
    <button
      onClick={() => setPaymentInvoice(invoice)}
      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
    >
      <CreditCard className="w-4 h-4" />
      Paiement
    </button>
  )}

  {/* Export PDF */}
  <PDFButton
    invoice={invoice}
    onExport={() => exportFacture(invoice)}
    loading={pdfLoading}
  />
</div>
```

---

## 🔗 Intégration dans ThreeWayMatchingPage

Pour la page de rapprochement 3 voies, l'intégration est similaire:

```typescript
// 1. Importer
import { DisputeResolutionModal } from '@/components/purchases/DisputeResolutionModal';

// 2. Ajouter l'état
const [resolveDisputeInvoiceId, setResolveDisputeInvoiceId] = useState<string | null>(null);

// 3. Ajouter le bouton dans les actions du résultat de rapprochement
{matchResult?.should_auto_dispute && (
  <button
    onClick={() => setResolveDisputeInvoiceId(matchResult.invoice_id)}
    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
  >
    <Scale className="w-5 h-5" />
    Résoudre le Litige
  </button>
)}

// 4. Ajouter le modal
<DisputeResolutionModal
  businessId={businessId}
  invoiceId={resolveDisputeInvoiceId || ''}
  isOpen={!!resolveDisputeInvoiceId}
  onClose={() => setResolveDisputeInvoiceId(null)}
  onSuccess={() => {
    setResolveDisputeInvoiceId(null);
    // Rafraîchir l'analyse de rapprochement
  }}
/>
```

---

## 🎯 Points Clés

### 1. Gestion de l'État
```typescript
// Utiliser null pour indiquer "pas de modal ouvert"
const [resolveDisputeInvoiceId, setResolveDisputeInvoiceId] = useState<string | null>(null);

// Ouvrir le modal
setResolveDisputeInvoiceId(invoice.id);

// Fermer le modal
setResolveDisputeInvoiceId(null);
```

### 2. Rafraîchissement Automatique
Le hook `useResolveDispute` invalide automatiquement les queries suivantes:
- `dispute-info` (informations du litige)
- `purchase-invoices` (liste des factures)
- `three-way-match` (résultats de rapprochement)

Vous n'avez donc pas besoin de rafraîchir manuellement!

### 3. Callback onSuccess
```typescript
<DisputeResolutionModal
  onSuccess={() => {
    // Fermer le modal
    setResolveDisputeInvoiceId(null);
    
    // Actions supplémentaires (optionnel)
    // - Afficher un toast de succès
    // - Rediriger vers une autre page
    // - Mettre à jour un état local
  }}
/>
```

---

## 🎨 Personnalisation

### Changer les Couleurs du Bouton

```typescript
// Bouton orange (par défaut)
className="bg-orange-600 hover:bg-orange-700"

// Bouton bleu
className="bg-blue-600 hover:bg-blue-700"

// Bouton indigo
className="bg-indigo-600 hover:bg-indigo-700"
```

### Changer l'Icône

```typescript
import { Scale, AlertCircle, Settings } from 'lucide-react';

// Avec Scale (balance)
<Scale className="w-4 h-4" />

// Avec AlertCircle
<AlertCircle className="w-4 h-4" />

// Avec Settings
<Settings className="w-4 h-4" />
```

### Ajouter un Badge de Notification

```typescript
<button
  onClick={() => setResolveDisputeInvoiceId(invoice.id)}
  className="relative flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
>
  <Scale className="w-4 h-4" />
  Résoudre le Litige
  
  {/* Badge pour indiquer l'urgence */}
  {invoice.days_in_dispute > 5 && (
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
  )}
</button>
```

---

## 📱 Responsive Design

Le modal est déjà responsive, mais vous pouvez adapter le bouton:

```typescript
{/* Desktop */}
<button className="hidden md:flex items-center gap-1 px-3 py-1.5 ...">
  <Scale className="w-4 h-4" />
  <span>Résoudre le Litige</span>
</button>

{/* Mobile */}
<button className="md:hidden p-2 ...">
  <Scale className="w-5 h-5" />
</button>
```

---

## 🧪 Test Rapide

Pour tester rapidement l'intégration:

1. Créer une facture en litige (ou mettre une facture existante en litige)
2. Aller sur la page des factures
3. Cliquer sur "Résoudre le Litige"
4. Le modal devrait s'ouvrir avec toutes les informations
5. Choisir une action et confirmer
6. Vérifier que la facture est mise à jour

---

## 🐛 Dépannage

### Le modal ne s'ouvre pas
- Vérifier que `resolveDisputeInvoiceId` est bien défini
- Vérifier que `isOpen={!!resolveDisputeInvoiceId}` est correct
- Vérifier la console pour les erreurs

### Les données ne s'affichent pas
- Vérifier que le backend est démarré
- Vérifier l'URL de l'API dans `axiosInstance`
- Vérifier les logs backend pour les erreurs

### Le modal ne se ferme pas
- Vérifier que `onClose={() => setResolveDisputeInvoiceId(null)}` est bien défini
- Vérifier qu'il n'y a pas d'erreur dans le callback

---

## 📞 Support

Pour toute question:
- Consulter le guide de test: `GUIDE_TEST_LITIGES.md`
- Vérifier les logs backend
- Contacter l'équipe de développement

