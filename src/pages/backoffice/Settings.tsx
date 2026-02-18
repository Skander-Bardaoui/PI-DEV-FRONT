import { useState } from 'react';
import {
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Mail,
  Save,
  Upload
} from 'lucide-react';

const tabs = [
  { id: 'business', label: 'Entreprise', icon: Building2 },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'billing', label: 'Facturation', icon: CreditCard },
  { id: 'integrations', label: 'Intégrations', icon: Globe }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Configurez votre compte et votre entreprise</p>
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
          {activeTab === 'business' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de l'entreprise</h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Logo de l'entreprise</label>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-indigo-600" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Changer le logo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG. Max 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                  <input
                    type="text"
                    defaultValue="Tech Solutions SARL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matricule fiscale</label>
                  <input
                    type="text"
                    defaultValue="1234567/A/P/M/000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="contact@techsolutions.tn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    defaultValue="+216 71 234 567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    rows={2}
                    defaultValue="123 Rue de la Liberté, Tunis 1000, Tunisie"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="TND">Dinar Tunisien (TND)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taux TVA par défaut</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="19">19%</option>
                    <option value="13">13%</option>
                    <option value="7">7%</option>
                    <option value="0">0% (Exonéré)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mon profil</h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Photo de profil</label>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-white font-bold">JD</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Changer la photo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG. Max 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    defaultValue="Jean"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    defaultValue="Dupont"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="jean@techsolutions.tn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    defaultValue="+216 55 123 456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="africa/tunis">Tunis (GMT+1)</option>
                    <option value="europe/paris">Paris (GMT+1)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Préférences de notifications</h2>

              <div className="space-y-6">
                {[
                  { title: 'Nouvelles factures', desc: 'Recevoir une notification quand une facture est créée' },
                  { title: 'Paiements reçus', desc: 'Être notifié des paiements reçus' },
                  { title: 'Factures en retard', desc: 'Alertes pour les factures impayées' },
                  { title: 'Nouveaux membres', desc: 'Notification quand un membre rejoint l\'équipe' },
                  { title: 'Rapports hebdomadaires', desc: 'Recevoir un résumé chaque semaine' },
                  { title: 'Mises à jour produit', desc: 'Être informé des nouvelles fonctionnalités' }
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                        <span className="text-sm text-gray-600">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                        <span className="text-sm text-gray-600">Push</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Mettre à jour
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentification à deux facteurs</h2>
                <p className="text-gray-500 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Activer 2FA
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessions actives</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Chrome sur Windows</p>
                      <p className="text-sm text-gray-500">Tunis, Tunisie • Actif maintenant</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Session actuelle
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Safari sur iPhone</p>
                      <p className="text-sm text-gray-500">Tunis, Tunisie • Il y a 2 heures</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Plan actuel</h2>
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl mb-6">
                  <div>
                    <p className="text-lg font-semibold text-indigo-900">Plan Pro</p>
                    <p className="text-indigo-600">79 TND/mois • Factures illimitées</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Changer de plan
                  </button>
                </div>

                <h3 className="font-medium text-gray-900 mb-4">Utilisation ce mois</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Factures créées</span>
                      <span className="text-gray-900">89 / Illimitées</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilisateurs</span>
                      <span className="text-gray-900">5 / 10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Stockage</span>
                      <span className="text-gray-900">2.4 Go / 10 Go</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Moyen de paiement</h2>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                  <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expire 12/26</p>
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Modifier
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Historique des factures</h2>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Montant</th>
                      <th className="pb-3">Statut</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '01 Jan 2024', amount: '79 TND', status: 'Payée' },
                      { date: '01 Déc 2023', amount: '79 TND', status: 'Payée' },
                      { date: '01 Nov 2023', amount: '79 TND', status: 'Payée' }
                    ].map((invoice, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{invoice.date}</td>
                        <td className="py-3 text-gray-900">{invoice.amount}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Intégrations disponibles</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Gmail', desc: 'Envoyez des factures directement depuis Gmail', connected: true },
                  { name: 'Google Drive', desc: 'Sauvegardez vos documents automatiquement', connected: true },
                  { name: 'Slack', desc: 'Recevez des notifications dans Slack', connected: false },
                  { name: 'Zapier', desc: 'Automatisez vos workflows', connected: false },
                  { name: 'QuickBooks', desc: 'Synchronisez vos données comptables', connected: false },
                  { name: 'Stripe', desc: 'Acceptez les paiements en ligne', connected: false }
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.desc}</p>
                      </div>
                    </div>
                    {integration.connected ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        Connecté
                      </span>
                    ) : (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Connecter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
