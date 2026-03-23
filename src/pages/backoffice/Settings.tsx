import { useState, useEffect, useRef } from 'react';
import {
  Building2,
  User,
  Shield,
  Settings as SettingsIcon,
  Save,
  Upload,
  Plus,
  Trash2,
  Edit2,
  X,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMyTenant, updateTenant } from '../../api/tenant.api';
import {
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessSettings,
  updateBusinessSettings,
} from '../../api/business.api';
import { updateProfile, changePassword } from '../../api/auth.api';
import { Tenant } from '../../types/tenant.types';
import { Business, BusinessSettings, CreateBusinessDto, UpdateBusinessDto } from '../../types/business.types';
import { showToast } from '../../utils/toast';
import ImageCropModal from '../../components/ImageCropModal';

const tabs = [
  { id: 'profile', label: 'Mon Profil', icon: User },
  { id: 'tenant', label: 'Tenant', icon: Building2 },
  { id: 'businesses', label: 'Entreprises', icon: SettingsIcon },
  { id: 'security', label: 'Sécurité', icon: Shield },
];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // File input refs
  const tenantLogoInputRef = useRef<HTMLInputElement>(null);
  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  // Image crop modal state
  const [showTenantCropModal, setShowTenantCropModal] = useState(false);
  const [showBusinessCropModal, setShowBusinessCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // User profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Tenant form
  const [tenantForm, setTenantForm] = useState({
    name: '',
    domain: '',
    contactEmail: '',
    description: '',
    billingPlan: '',
    logoUrl: '',
  });

  // Business form
  const [businessForm, setBusinessForm] = useState<CreateBusinessDto>({
    tenant_id: '',
    name: '',
    logo: '',
    tax_id: '',
    currency: 'TND',
    address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'Tunisie',
    },
  });

  // Load tenant and businesses on mount
  useEffect(() => {
    loadTenantData();
    loadBusinesses();
  }, []);

  const loadTenantData = async () => {
    try {
      const tenantData = await getMyTenant();
      setTenant(tenantData);
      setTenantForm({
        name: tenantData.name,
        domain: tenantData.domain || '',
        contactEmail: tenantData.contactEmail || '',
        description: tenantData.description || '',
        billingPlan: tenantData.billingPlan || '',
        logoUrl: tenantData.logoUrl || '',
      });
    } catch (error) {
      console.error('Failed to load tenant:', error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const { businesses: businessList } = await getBusinesses();
      setBusinesses(businessList);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  };

  const loadBusinessSettings = async (businessId: string) => {
    try {
      const settings = await getBusinessSettings(businessId);
      setBusinessSettings(settings);
    } catch (error) {
      console.error('Failed to load business settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = await updateProfile(profileForm);
      showToast.success('Profil mis à jour avec succès');
      // Update auth context
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTenant = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      await updateTenant(tenant.id, tenantForm);
      showToast.success('Tenant mis à jour avec succès');
      loadTenantData();
    } catch (error: any) {
      console.error('Failed to update tenant:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      await createBusiness({ ...businessForm, tenant_id: tenant.id });
      showToast.success('Entreprise créée avec succès');
      setShowBusinessModal(false);
      resetBusinessForm();
      loadBusinesses();
    } catch (error: any) {
      console.error('Failed to create business:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors de la création de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!editingBusiness) return;
    setLoading(true);
    try {
      // Remove tenant_id from update payload (it shouldn't be updated)
      const { tenant_id, ...updateData } = businessForm;
      await updateBusiness(editingBusiness.id, updateData as UpdateBusinessDto);
      showToast.success('Entreprise mise à jour avec succès');
      setShowBusinessModal(false);
      setEditingBusiness(null);
      resetBusinessForm();
      loadBusinesses();
    } catch (error: any) {
      console.error('Failed to update business:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    setLoading(true);
    try {
      await deleteBusiness(id);
      showToast.success('Entreprise supprimée avec succès');
      loadBusinesses();
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(null);
        setBusinessSettings(null);
      }
    } catch (error: any) {
      console.error('Failed to delete business:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (business: Business) => {
    setEditingBusiness(business);
    setBusinessForm({
      tenant_id: business.tenant_id,
      name: business.name,
      logo: business.logo || '',
      tax_id: business.tax_id || '',
      currency: business.currency,
      address: business.address || {
        street: '',
        city: '',
        postal_code: '',
        country: 'Tunisie',
      },
    });
    setShowBusinessModal(true);
  };

  const resetBusinessForm = () => {
    setBusinessForm({
      tenant_id: tenant?.id || '',
      name: '',
      logo: '',
      tax_id: '',
      currency: 'TND',
      address: {
        street: '',
        city: '',
        postal_code: '',
        country: 'Tunisie',
      },
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showToast.success('Mot de passe modifié avec succès');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      showToast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // Handle tenant logo upload
  const handleTenantLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Veuillez sélectionner une image');
      return;
    }

    // Open crop modal
    setSelectedImageFile(file);
    setShowTenantCropModal(true);
  };

  // Handle business logo upload
  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Veuillez sélectionner une image');
      return;
    }

    // Open crop modal
    setSelectedImageFile(file);
    setShowBusinessCropModal(true);
  };

  // Save cropped tenant logo
  const handleSaveTenantLogo = (croppedImage: string) => {
    setTenantForm({ ...tenantForm, logoUrl: croppedImage });
    showToast.success('Logo ajouté avec succès');
  };

  // Save cropped business logo
  const handleSaveBusinessLogo = (croppedImage: string) => {
    setBusinessForm({ ...businessForm, logo: croppedImage });
    showToast.success('Logo ajouté avec succès');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Gérez votre profil, tenant et entreprises</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* User Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mon profil utilisateur</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Tenant Tab */}
          {activeTab === 'tenant' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration du Tenant</h2>
              <p className="text-sm text-gray-500 mb-6">
                Le tenant représente votre organisation principale qui contient toutes vos entreprises
              </p>

              {/* Logo Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-indigo-700 mb-3">Logo du Tenant</label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                      {tenantForm.logoUrl ? (
                        <img src={tenantForm.logoUrl} alt="Tenant logo" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-12 w-12 text-indigo-600" />
                      )}
                    </div>
                    {/* Hover overlay with pencil icon */}
                    <button
                      type="button"
                      onClick={() => tenantLogoInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <Pencil className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={tenantLogoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTenantLogoChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">Cliquez sur le logo pour le modifier</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF. Max 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Nom du Tenant</label>
                  <input
                    type="text"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Domaine</label>
                  <input
                    type="text"
                    value={tenantForm.domain}
                    onChange={(e) => setTenantForm({ ...tenantForm, domain: e.target.value })}
                    placeholder="example.noventra.tn"
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Email de contact</label>
                  <input
                    type="email"
                    value={tenantForm.contactEmail}
                    onChange={(e) => setTenantForm({ ...tenantForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Plan de facturation</label>
                  <select
                    value={tenantForm.billingPlan}
                    onChange={(e) => setTenantForm({ ...tenantForm, billingPlan: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                  >
                    <option value="">Sélectionner un plan</option>
                    <option value="free">Gratuit</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Statut</label>
                  <input
                    type="text"
                    value={tenant?.status || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={tenantForm.description}
                    onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveTenant}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === 'businesses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Mes Entreprises</h2>
                    <p className="text-sm text-gray-500">Gérez toutes vos entreprises sous ce tenant</p>
                  </div>
                  <button
                    onClick={() => {
                      resetBusinessForm();
                      setEditingBusiness(null);
                      setShowBusinessModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle Entreprise
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="border-2 border-green-200 rounded-xl p-4 bg-green-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                            {business.logo ? (
                              <img src={business.logo} alt={business.name} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{business.name}</h3>
                            <p className="text-sm text-gray-500">{business.currency}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(business)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        {business.tax_id && (
                          <p className="text-gray-600">
                            <span className="font-medium">Matricule Fiscal:</span> {business.tax_id}
                          </p>
                        )}
                        {business.address && (
                          <p className="text-gray-600">
                            <span className="font-medium">Ville:</span> {business.address.city}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {businesses.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune entreprise créée</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBusiness ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </h3>
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setEditingBusiness(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Logo Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Logo de l'entreprise</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200">
                      {businessForm.logo ? (
                        <img src={businessForm.logo} alt="Business logo" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-green-600" />
                      )}
                    </div>
                    {/* Hover overlay with pencil icon */}
                    <button
                      type="button"
                      onClick={() => businessLogoInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <Pencil className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={businessLogoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBusinessLogoChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">Cliquez sur le logo pour le modifier</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF. Max 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                <input
                  type="text"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matricule Fiscal</label>
                  <input
                    type="text"
                    value={businessForm.tax_id}
                    onChange={(e) => setBusinessForm({ ...businessForm, tax_id: e.target.value })}
                    placeholder="1234567/A/P/M/000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <select
                    value={businessForm.currency}
                    onChange={(e) => setBusinessForm({ ...businessForm, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="TND">Dinar Tunisien (TND)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={businessForm.address?.street}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      address: { ...businessForm.address!, street: e.target.value },
                    })
                  }
                  placeholder="Rue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={businessForm.address?.city}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        address: { ...businessForm.address!, city: e.target.value },
                      })
                    }
                    placeholder="Ville"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={businessForm.address?.postal_code}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        address: { ...businessForm.address!, postal_code: e.target.value },
                      })
                    }
                    placeholder="Code postal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setEditingBusiness(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={editingBusiness ? handleUpdateBusiness : handleCreateBusiness}
                disabled={loading || !businessForm.name}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {editingBusiness ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modals */}
      <ImageCropModal
        isOpen={showTenantCropModal}
        imageFile={selectedImageFile}
        onClose={() => {
          setShowTenantCropModal(false);
          setSelectedImageFile(null);
        }}
        onSave={handleSaveTenantLogo}
        title="Ajuster le logo du tenant"
      />

      <ImageCropModal
        isOpen={showBusinessCropModal}
        imageFile={selectedImageFile}
        onClose={() => {
          setShowBusinessCropModal(false);
          setSelectedImageFile(null);
        }}
        onSave={handleSaveBusinessLogo}
        title="Ajuster le logo de l'entreprise"
      />
    </div>
  );
}
