/**
 * Page des prédictions ML - Recommandations d'achat intelligentes
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useMLRecommendations, useMLHealth } from '../../../hooks/useMLPredictions';
import { PredictionResponse } from '../../../types/ml-predictions';

const MLPredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [predictionDays, setPredictionDays] = useState(30);
  
  const { data: health, isLoading: healthLoading } = useMLHealth();
  const { data: recommendations, isLoading, error, refetch } = useMLRecommendations(predictionDays);

  // Filtrer par urgence
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'soon' | 'planned' | 'processed'>('all');

  const filteredRecommendations = recommendations?.recommendations.filter((rec) => {
    if (urgencyFilter === 'all') return true;
    if (urgencyFilter === 'processed') return rec.is_processed;
    if (rec.is_processed) return false; // Ne pas afficher les traitées dans les autres filtres
    return rec.urgency_level === urgencyFilter;
  });

  // Trier: urgent > soon > planned > processed
  const sortedRecommendations = filteredRecommendations?.sort((a, b) => {
    // Les traitées en dernier
    if (a.is_processed && !b.is_processed) return 1;
    if (!a.is_processed && b.is_processed) return -1;
    
    // Sinon trier par urgence
    const urgencyOrder = { urgent: 0, soon: 1, planned: 2 };
    return urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level];
  });

  // Icône de tendance
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ArrowRightIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Badge d'urgence
  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      soon: 'bg-orange-100 text-orange-800 border-orange-200',
      planned: 'bg-green-100 text-green-800 border-green-200',
    };

    const labels = {
      urgent: '🔴 URGENT',
      soon: '🟠 BIENTÔT',
      planned: '🟢 PLANIFIÉ',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[urgency]}`}>
        {labels[urgency]}
      </span>
    );
  };

  // Barre de confiance
  const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => {
    const percentage = Math.round(confidence * 100);
    const color = confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Confiance</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Fonction pour créer un BC à partir d'une prédiction
  const handleCreatePO = (prediction: PredictionResponse) => {
    // Stocker les données de la prédiction dans sessionStorage
    sessionStorage.setItem('mlPrediction', JSON.stringify({
      productId: prediction.product_id,
      productName: prediction.product_name,
      quantity: Math.ceil(prediction.predicted_quantity),
      estimatedValue: prediction.estimated_value,
      urgency: prediction.urgency_level,
      recommendation: prediction.recommendation,
    }));
    
    // Rediriger vers la page des bons de commande
    navigate('/app/purchases/orders');
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-indigo-600" />
            Prédictions ML - Besoins d'Achat
          </h1>
          <p className="text-gray-600 mt-2">
            Intelligence artificielle pour optimiser vos commandes
          </p>
        </div>

        {/* Status du service ML */}
        <div className="flex items-center gap-3">
          {healthLoading ? (
            <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg" />
          ) : health?.model_loaded ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">ML Actif</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">ML Inactif</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques globales */}
      {recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recommandations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {recommendations.recommendations.filter(r => !r.is_processed).length}
                </p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes Urgentes</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {recommendations.recommendations.filter(r => !r.is_processed && r.urgency_level === 'urgent').length}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur Estimée</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {recommendations.recommendations
                    .filter(r => !r.is_processed)
                    .reduce((sum, r) => sum + (r.estimated_value || 0), 0)
                    .toFixed(2)} TND
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horizon</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {predictionDays} jours
                </p>
              </div>
              <ClockIcon className="h-10 w-10 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres et contrôles */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Filtre d'urgence */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrer par urgence:</span>
            <div className="flex gap-2">
              {['all', 'urgent', 'soon', 'planned', 'processed'].map((level) => (
                <button
                  key={level}
                  onClick={() => setUrgencyFilter(level as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    urgencyFilter === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'Tous' : level === 'urgent' ? 'Urgent' : level === 'soon' ? 'Bientôt' : level === 'planned' ? 'Planifié' : 'Traités'}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon de prédiction */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Horizon:</label>
            <select
              value={predictionDays}
              onChange={(e) => setPredictionDays(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
              <option value={60}>60 jours</option>
              <option value={90}>90 jours</option>
            </select>
          </div>

          {/* Bouton rafraîchir */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isLoading ? 'Chargement...' : 'Rafraîchir'}
          </button>
        </div>
      </div>

      {/* Liste des recommandations */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-medium">Erreur lors du chargement des prédictions</p>
          <p className="text-red-600 text-sm mt-1">
            Vérifiez que le service ML est démarré
          </p>
        </div>
      ) : !sortedRecommendations || sortedRecommendations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Aucune recommandation disponible</p>
          <p className="text-gray-500 text-sm mt-1">
            Assurez-vous d'avoir un historique d'achat suffisant
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRecommendations.map((prediction: PredictionResponse) => (
            <div
              key={prediction.product_id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Informations produit */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {prediction.product_name}
                    </h3>
                    {prediction.is_processed ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
                        ✅ BC créé {prediction.supplier_po_number && `(${prediction.supplier_po_number})`}
                      </span>
                    ) : (
                      getUrgencyBadge(prediction.urgency_level)
                    )}
                    {getTrendIcon(prediction.trend)}
                  </div>

                  {/* Recommandation */}
                  <p className="text-gray-700 mb-4">{prediction.recommendation}</p>

                  {/* Métriques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Quantité prédite</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {prediction.predicted_quantity.toFixed(0)} unités
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date prédite</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(prediction.predicted_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jours restants</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prediction.days_until_order} jours
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valeur estimée</p>
                      <p className="text-lg font-bold text-green-600">
                        {prediction.estimated_value?.toFixed(2) || '0.00'} TND
                      </p>
                    </div>
                  </div>

                  {/* Barre de confiance */}
                  <ConfidenceBar confidence={prediction.confidence} />
                </div>

                {/* Actions */}
                <div className="ml-6">
                  {prediction.is_processed ? (
                    <div className="text-center">
                      <div className="text-green-600 text-sm font-medium mb-1">✓ Traité</div>
                      <div className="text-xs text-gray-500">
                        {new Date(prediction.processed_at!).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCreatePO(prediction)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Créer BC
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MLPredictionsPage;
