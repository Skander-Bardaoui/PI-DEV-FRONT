# Plan de Correction Massive des 339 Tests Échoués

## 🎯 Objectif
Corriger les 339 tests échoués pour atteindre 95%+ de tests passants

## 📋 Stratégie

### Phase 1: Corrections Automatisables (Estimé: 100+ tests)
1. **Imports manquants** - Rechercher et ajouter `vi`, `fireEvent`, `waitFor`
2. **await manquants** - Ajouter `await` devant tous les `waitFor`
3. **Mocks Radix UI** - Corriger tous les mocks avec les bons noms d'exports

### Phase 2: Corrections par Pattern (Estimé: 150+ tests)
1. **Formatage de nombres** - Utiliser function matchers
2. **Mocks de permissions** - Ajouter `useCurrentBusinessMember`
3. **Mocks de hooks** - Ajouter tous les hooks manquants

### Phase 3: Corrections Spécifiques (Estimé: 89 tests)
1. **Tests de formulaires** - Adapter les sélecteurs
2. **Tests de composants complexes** - Corriger la logique
3. **Tests de pages** - Ajouter tous les mocks nécessaires

## 🚀 Exécution

Je vais procéder par ordre de priorité et d'impact.
