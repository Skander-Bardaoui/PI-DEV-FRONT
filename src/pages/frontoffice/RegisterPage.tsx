// src/pages/frontoffice/RegisterPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: '',
    industry: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Validate step 1 fields
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      // Move to step 2
      setStep(2);
    } else {
      // Step 2: Submit registration
      if (!formData.acceptTerms) {
        setError('Vous devez accepter les conditions d\'utilisation');
        return;
      }

      setIsLoading(true);

      try {
        // Combine first and last name
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        await register({
          name: fullName,
          email: formData.email,
          password: formData.password,
        });
        
        // Navigation handled by AuthContext
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de l\'inscription');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">NovEntra</span>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Compte</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className={`h-full bg-indigo-600 transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Entreprise</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Créez votre compte' : 'Informations entreprise'}
          </h1>
          <p className="text-gray-600 mb-8">
            {step === 1
              ? 'Commencez votre essai gratuit de 14 jours.'
              : 'Dites-nous en plus sur votre entreprise.'
            }
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Jean"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Dupont"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="vous@exemple.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (optionnel)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+216 XX XXX XXX"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Minimum 8 caractères"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Confirmez votre mot de passe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ma Société SARL"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taille de l'entreprise</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">1 personne (Freelance)</option>
                    <option value="2-10">2-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="200+">200+ employés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner</option>
                    <option value="tech">Technologie / IT</option>
                    <option value="consulting">Consulting</option>
                    <option value="commerce">Commerce</option>
                    <option value="services">Services</option>
                    <option value="industrie">Industrie</option>
                    <option value="sante">Santé</option>
                    <option value="education">Éducation</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    required
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    J'accepte les{' '}
                    <a href="#" className="text-indigo-600 hover:underline">Conditions d'utilisation</a>
                    {' '}et la{' '}
                    <a href="#" className="text-indigo-600 hover:underline">Politique de confidentialité</a>
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  {step === 1 ? 'Continuer' : 'Créer mon compte'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="w-full text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Retour
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Pourquoi choisir NovEntra ?</h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Configuration en 5 minutes',
                  desc: 'Commencez à facturer vos clients immédiatement'
                },
                {
                  title: 'Données sécurisées en Tunisie',
                  desc: 'Vos données restent sur des serveurs tunisiens'
                },
                {
                  title: 'Support en français et arabe',
                  desc: 'Une équipe locale à votre écoute'
                },
                {
                  title: 'Essai gratuit 14 jours',
                  desc: 'Sans carte bancaire requise'
                }
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-indigo-200 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}