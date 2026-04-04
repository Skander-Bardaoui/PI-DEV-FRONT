// src/pages/frontoffice/AcceptInvitationPage.tsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  XCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../api/axiosInstance';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  business: {
    id: string;
    name: string;
    logo?: string;
  };
  inviter: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const roleLabels: Record<string, string> = {
  BUSINESS_ADMIN: 'Administrateur',
  ACCOUNTANT: 'Comptable',
  TEAM_MEMBER: 'Membre de l\'équipe',
};

const roleColors: Record<string, string> = {
  BUSINESS_ADMIN: 'bg-blue-100 text-blue-700',
  ACCOUNTANT: 'bg-green-100 text-green-700',
  TEAM_MEMBER: 'bg-gray-100 text-gray-700',
};

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  // Add custom animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.6s ease-out;
      }
      .delay-1000 {
        animation-delay: 1s;
      }
      .delay-500 {
        animation-delay: 0.5s;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load invitation details
  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) {
      setError('Token d\'invitation manquant');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/invitations/${token}`);
      setInvitation(response.data);
      setError('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invitation invalide ou expirée';
      setError(errorMsg);
      console.error('Error loading invitation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      setError('Le prénom doit contenir au moins 2 caractères');
      return;
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsSubmitting(true);

      // Accept invitation with user details
      await axiosInstance.post(`/invitations/${token}/accept`, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la création du compte';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error accepting invitation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-6">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
            <Sparkles className="h-6 w-6 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Chargement de l'invitation...</p>
          <p className="text-gray-400 text-sm mt-2">Veuillez patienter un instant</p>
        </div>
      </div>
    );
  }

  // Error state (expired or invalid)
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NovEntra
            </span>
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="relative inline-block mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Invitation expirée</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Retour à l'accueil
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invitation already accepted
  if (invitation && invitation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NovEntra
            </span>
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="relative inline-block mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Invitation déjà utilisée</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Cette invitation a déjà été {invitation.status === 'accepted' ? 'acceptée' : 'rejetée'}.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Se connecter
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NovEntra
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Bienvenue ! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Créez votre compte pour rejoindre l'équipe
            </p>
          </div>

          {/* Invitation Details Card - Enhanced */}
          {invitation && (
            <div className="relative mb-6 group">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      {invitation.business.logo ? (
                        <img
                          src={`http://localhost:3001${invitation.business.logo}`}
                          alt={invitation.business.name}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{invitation.business.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Invité par <span className="font-medium text-gray-900">{invitation.inviter.firstName} {invitation.inviter.lastName}</span>
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                          roleColors[invitation.role] || roleColors.TEAM_MEMBER
                        }`}
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {roleLabels[invitation.role] || invitation.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message - Enhanced */}
          {error && (
            <div className="mb-6 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl opacity-50 group-hover:opacity-75 blur transition duration-300"></div>
              <div className="relative p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-lg">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={invitation?.email || ''}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium transition-all"
                  disabled
                  readOnly
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Votre adresse email (non modifiable)
              </p>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Jean"
                    required
                    minLength={2}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Dupont"
                    required
                    minLength={2}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone (optionnel)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="+216 XX XXX XXX"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-red-500'
                              : passwordStrength === 2
                              ? 'bg-orange-500'
                              : passwordStrength === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength === 1
                      ? 'text-red-600'
                      : passwordStrength === 2
                      ? 'text-orange-600'
                      : passwordStrength === 3
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    {passwordStrength === 0 && 'Entrez un mot de passe'}
                    {passwordStrength === 1 && 'Faible'}
                    {passwordStrength === 2 && 'Moyen'}
                    {passwordStrength === 3 && 'Bon'}
                    {passwordStrength === 4 && 'Excellent'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Confirmez votre mot de passe"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Les mots de passe ne correspondent pas
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full group overflow-hidden rounded-xl font-semibold py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
              
              {/* Animated shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center gap-2 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Enhanced */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600"></div>
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center p-12 w-full">
          <div className="max-w-lg w-full">
            {/* Floating badges */}
            <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-white text-sm font-semibold shadow-xl animate-bounce">
              🎉 Nouveau membre
            </div>

            {/* Main card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl border border-white/20">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                  Rejoignez l'équipe
                </h2>
                <p className="text-indigo-100 text-lg">
                  Commencez votre aventure avec nous
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: '🤝',
                    title: 'Collaboration simplifiée',
                    desc: 'Travaillez ensemble sur les mêmes projets en temps réel'
                  },
                  {
                    icon: '🔒',
                    title: 'Accès sécurisé',
                    desc: 'Vos données sont protégées et chiffrées de bout en bout'
                  },
                  {
                    icon: '⚡',
                    title: 'Rôles personnalisés',
                    desc: 'Permissions adaptées à votre fonction dans l\'équipe'
                  },
                  {
                    icon: '💬',
                    title: 'Support dédié',
                    desc: 'Une équipe à votre écoute 24/7 pour vous accompagner'
                  }
                ].map((item, index) => (
                  <div 
                    key={item.title} 
                    className="flex gap-4 group hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-indigo-100 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats section */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold mb-1">500+</div>
                    <div className="text-indigo-100 text-xs">Entreprises</div>
                  </div>
                  <div className="group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold mb-1">10K+</div>
                    <div className="text-indigo-100 text-xs">Utilisateurs</div>
                  </div>
                  <div className="group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold mb-1">99.9%</div>
                    <div className="text-indigo-100 text-xs">Uptime</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom floating element */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurisé et conforme RGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
