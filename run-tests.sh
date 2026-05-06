#!/bin/bash

# Script pour exécuter les tests du frontend
# Usage: ./run-tests.sh [option]

set -e

echo "🧪 Tests Frontend - Modules Purchases et Sales"
echo "=============================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les options
show_help() {
    echo "Options disponibles:"
    echo "  all              - Exécuter tous les tests"
    echo "  hooks            - Tests des hooks uniquement"
    echo "  purchases        - Tests des hooks Purchases"
    echo "  sales            - Tests des hooks Sales"
    echo "  components       - Tests des composants (si disponibles)"
    echo "  coverage         - Tests avec rapport de couverture"
    echo "  watch            - Mode watch (re-exécution automatique)"
    echo "  ui               - Interface graphique des tests"
    echo "  help             - Afficher cette aide"
    echo ""
}

# Fonction pour exécuter les tests
run_tests() {
    local pattern=$1
    local description=$2
    
    echo -e "${BLUE}▶ $description${NC}"
    echo ""
    
    if [ -z "$pattern" ]; then
        npm run test
    else
        npm run test -- "$pattern"
    fi
}

# Fonction pour exécuter les tests avec couverture
run_coverage() {
    echo -e "${BLUE}▶ Exécution des tests avec couverture${NC}"
    echo ""
    npm run test:coverage
    echo ""
    echo -e "${GREEN}✓ Rapport de couverture généré dans coverage/index.html${NC}"
}

# Fonction pour le mode watch
run_watch() {
    echo -e "${BLUE}▶ Mode watch activé${NC}"
    echo -e "${YELLOW}Les tests seront ré-exécutés automatiquement à chaque modification${NC}"
    echo ""
    npm run test:watch
}

# Fonction pour l'interface UI
run_ui() {
    echo -e "${BLUE}▶ Ouverture de l'interface graphique des tests${NC}"
    echo ""
    npm run test:ui
}

# Traitement des arguments
case "${1:-all}" in
    all)
        run_tests "" "Tous les tests"
        ;;
    hooks)
        run_tests "hooks" "Tests des hooks"
        ;;
    purchases)
        run_tests "usePurchaseInvoices" "Tests des hooks Purchases"
        ;;
    sales)
        run_tests "useSalesInvoices" "Tests des hooks Sales"
        ;;
    components)
        run_tests "components" "Tests des composants"
        ;;
    coverage)
        run_coverage
        ;;
    watch)
        run_watch
        ;;
    ui)
        run_ui
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}Option non reconnue: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✓ Terminé${NC}"
