# 🧪 Guide de Test - Système de Résolution de Litiges

## Prérequis

1. Backend démarré sur `http://localhost:3000`
2. Frontend démarré sur `http://localhost:5173`
3. Utilisateur connecté avec rôle BUSINESS_OWNER ou ACCOUNTANT
4. Au moins une facture en statut DISPUTED dans la base de données

---

## 📋 Étapes de Test

### Test 1: Afficher les Informations d'un Litige

#### Objectif
Vérifier que les informations détaillées d'un litige s'affichent correctement.

#### Étapes
1. Aller sur la page des factures: `/backoffice/purchases/invoices`
2. Filtrer par statut "DISPUTED" (En litige)
3. Cliquer sur une facture en litige
4. Cliquer sur le bouton "Résoudre le litige"

#### Résultat Attendu
✅ Un modal s'ouvre avec:
- Numéro de facture et nom du fournisseur
- Catégorie du litige (ex: "Écart de Prix")
- Nombre de jours en litige
- Raison du litige
- Montants: Facturé, Attendu, Écart (avec %)
- Liste des actions suggérées par priorité

---

### Test 2: Actions Suggérées

#### Objectif
Vérifier que les actions suggérées sont pertinentes et cliquables.

#### Étapes
1. Ouvrir le modal de résolution (voir Test 1)
2. Observer la section "Actions Suggérées"
3. Cliquer sur différentes actions

#### Résultat Attendu
✅ Chaque action affiche:
- Un emoji de priorité (🔴 haute, 🟡 moyenne, 🟢 basse)
- Un label clair (ex: "Demander un avoir")
- Une description détaillée
- Un délai estimé (ex: "3-5 jours")
- Un badge de priorité coloré

✅ L'action sélectionnée:
- S'affiche avec un fond bleu clair
- Affiche une icône de validation (✓)
- Active le formulaire de résolution en dessous

---

### Test 3: Approuver Malgré l'Écart

#### Objectif
Tester l'action la plus simple: approuver la facture malgré l'écart.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Approuver malgré l'écart"
3. Ajouter une note: "Remise de 5% accordée par le fournisseur"
4. Décocher "Envoyer un email au fournisseur"
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Le modal affiche "Résolution en cours..."
✅ Le modal se ferme
✅ Un message de succès s'affiche
✅ La facture passe en statut APPROVED
✅ La liste des factures se rafraîchit automatiquement

---

### Test 4: Corriger les Montants

#### Objectif
Tester la correction des montants dans le système.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Corriger les montants"
3. Observer l'apparition des champs de saisie
4. Modifier le "Sous-total HT": entrer 1000.000
5. Modifier la "TVA": entrer 190.000
6. Laisser "Timbre Fiscal" vide (valeur par défaut: 1.000)
7. Ajouter une note: "Correction erreur de saisie"
8. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Les champs de montants s'affichent avec 3 inputs
✅ Les placeholders montrent les valeurs actuelles
✅ Après confirmation:
  - Les montants sont mis à jour
  - Le net_amount est recalculé (1000 + 190 + 1 = 1191 TND)
  - La facture passe en APPROVED
  - Le litige est résolu

---

### Test 5: Demander un Avoir

#### Objectif
Tester l'envoi d'une demande d'avoir au fournisseur.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Demander un avoir"
3. Ajouter une note: "Surfacturation de 200 TND. Prix convenu: 1000 TND/unité"
4. Vérifier que "Envoyer un email au fournisseur" est coché
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Après confirmation:
  - Un email est envoyé au fournisseur (vérifier les logs backend)
  - La facture reste en DISPUTED
  - La raison du litige est mise à jour: "[En attente d'avoir] ..."
  - Un message de succès confirme l'envoi de l'email

---

### Test 6: Demander Facture Rectificative

#### Objectif
Tester la demande de facture rectificative.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Demander facture rectificative"
3. Ajouter une note: "Quantité incorrecte. Reçu 80 unités, facturé 100 unités"
4. Cocher "Envoyer un email au fournisseur"
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Email envoyé au fournisseur
✅ Facture reste en DISPUTED
✅ Raison mise à jour: "[En attente de facture rectificative] ..."

---

### Test 7: Rejeter la Facture

#### Objectif
Tester le rejet d'une facture (ex: doublon).

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Rejeter la facture"
3. Ajouter une note: "Facture en double - déjà payée le 15/12/2024"
4. Cocher "Envoyer un email au fournisseur"
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Email envoyé au fournisseur
✅ Facture passe en statut PENDING (pour archivage)
✅ Raison mise à jour: "[Rejetée] ..."

---

### Test 8: Attendre la Livraison

#### Objectif
Tester la mise en attente pour livraison partielle.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Attendre la livraison"
3. Ajouter une note: "40 unités restantes en livraison - arrivée prévue le 25/01"
4. Décocher "Envoyer un email au fournisseur"
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Facture reste en DISPUTED
✅ Raison mise à jour: "[En attente de livraison] ..."
✅ Pas d'email envoyé

---

### Test 9: Contacter le Fournisseur

#### Objectif
Tester l'envoi d'un email de clarification.

#### Étapes
1. Ouvrir le modal de résolution
2. Cliquer sur "Contacter le fournisseur"
3. Ajouter une note: "Écart de 150 TND inexpliqué. Pouvez-vous nous fournir des détails?"
4. Vérifier que "Envoyer un email au fournisseur" est coché
5. Cliquer sur "Confirmer la Résolution"

#### Résultat Attendu
✅ Email envoyé au fournisseur
✅ Facture reste en DISPUTED (pas de changement de statut)
✅ Message de succès confirmant l'envoi

---

## 🔍 Tests d'Intégration

### Test 10: Intégration avec la Page de Rapprochement 3 Voies

#### Objectif
Vérifier que le système de résolution s'intègre bien avec le rapprochement 3 voies.

#### Étapes
1. Aller sur `/backoffice/purchases/three-way-matching`
2. Sélectionner une facture
3. Cliquer sur "Analyser"
4. Observer les résultats du rapprochement
5. Si litige détecté, cliquer sur "Résoudre le litige"

#### Résultat Attendu
✅ Le modal de résolution s'ouvre avec les bonnes informations
✅ Les montants correspondent à l'analyse du rapprochement
✅ Les actions suggérées sont cohérentes avec le type d'écart

---

### Test 11: Workflow Complet

#### Objectif
Tester un workflow complet de bout en bout.

#### Scénario
Une facture de 12 000 TND est reçue alors que le BC était de 10 000 TND.

#### Étapes
1. **Création**: Créer une facture avec un écart de prix
2. **Détection**: Le système détecte automatiquement l'écart (rapprochement 3 voies)
3. **Mise en litige**: La facture passe en DISPUTED automatiquement
4. **Analyse**: Ouvrir le modal de résolution
5. **Action**: Choisir "Demander un avoir"
6. **Résolution**: Confirmer et envoyer l'email
7. **Suivi**: Vérifier que la facture reste en litige
8. **Finalisation**: Après réception de l'avoir, approuver la facture

#### Résultat Attendu
✅ Chaque étape fonctionne correctement
✅ Les statuts sont mis à jour automatiquement
✅ Les emails sont envoyés aux bons moments
✅ L'historique est tracé

---

## 🐛 Tests d'Erreurs

### Test 12: Facture Sans Email Fournisseur

#### Étapes
1. Créer une facture avec un fournisseur sans email
2. Mettre la facture en litige
3. Ouvrir le modal de résolution
4. Choisir une action qui nécessite un email

#### Résultat Attendu
✅ La checkbox "Envoyer un email" n'apparaît pas
✅ Un message indique que le fournisseur n'a pas d'email
✅ La résolution fonctionne quand même (sans email)

---

### Test 13: Facture Non en Litige

#### Étapes
1. Essayer d'ouvrir le modal de résolution sur une facture APPROVED

#### Résultat Attendu
✅ Le backend retourne une erreur 400
✅ Un message d'erreur s'affiche: "Cette facture n'est pas en litige"

---

### Test 14: Montants Invalides

#### Étapes
1. Choisir "Corriger les montants"
2. Entrer des valeurs négatives ou invalides
3. Essayer de confirmer

#### Résultat Attendu
✅ Le backend valide les montants
✅ Un message d'erreur s'affiche si invalide
✅ La résolution est bloquée jusqu'à correction

---

## 📊 Vérifications Backend

### Logs à Vérifier

Après chaque test, vérifier les logs backend:

```bash
# Logs de résolution
[DisputeResolutionService] Litige résolu: INV-2024-001 - Action: APPROVE_AS_IS

# Logs d'email
[PurchaseMailService] Email demande d'avoir envoyé pour INV-2024-001

# Logs d'erreur (si applicable)
[DisputeResolutionService] Erreur: Cette facture n'est pas en litige
```

### Base de Données

Vérifier dans la base de données:

```sql
-- Vérifier le statut de la facture
SELECT id, invoice_number_supplier, status, dispute_reason 
FROM purchase_invoices 
WHERE id = 'uuid-de-la-facture';

-- Vérifier les montants après correction
SELECT subtotal_ht, tax_amount, timbre_fiscal, net_amount
FROM purchase_invoices
WHERE id = 'uuid-de-la-facture';
```

---

## ✅ Checklist Complète

- [ ] Test 1: Affichage des informations
- [ ] Test 2: Actions suggérées
- [ ] Test 3: Approuver malgré l'écart
- [ ] Test 4: Corriger les montants
- [ ] Test 5: Demander un avoir
- [ ] Test 6: Demander facture rectificative
- [ ] Test 7: Rejeter la facture
- [ ] Test 8: Attendre la livraison
- [ ] Test 9: Contacter le fournisseur
- [ ] Test 10: Intégration rapprochement 3 voies
- [ ] Test 11: Workflow complet
- [ ] Test 12: Facture sans email
- [ ] Test 13: Facture non en litige
- [ ] Test 14: Montants invalides

---

## 🎯 Critères de Succès

Le système est considéré comme fonctionnel si:

1. ✅ Tous les tests passent sans erreur
2. ✅ Les emails sont envoyés correctement
3. ✅ Les statuts sont mis à jour automatiquement
4. ✅ L'interface est intuitive et claire
5. ✅ Les erreurs sont gérées gracieusement
6. ✅ Les performances sont acceptables (< 2s par action)

---

## 📞 Support

En cas de problème:
- Vérifier les logs backend
- Vérifier la console du navigateur
- Vérifier la base de données
- Contacter l'équipe de développement

