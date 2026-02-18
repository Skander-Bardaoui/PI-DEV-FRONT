import { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserPlus,
  X,
  Check,
  Clock
} from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean@entreprise.tn',
    role: 'owner',
    roleLabel: 'Propriétaire',
    department: 'Direction',
    status: 'active',
    avatar: 'JD',
    joinedAt: '01 Jan 2023'
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie@entreprise.tn',
    role: 'admin',
    roleLabel: 'Administrateur',
    department: 'Finance',
    status: 'active',
    avatar: 'MM',
    joinedAt: '15 Mar 2023'
  },
  {
    id: 3,
    name: 'Pierre Bernard',
    email: 'pierre@entreprise.tn',
    role: 'accountant',
    roleLabel: 'Comptable',
    department: 'Comptabilité',
    status: 'active',
    avatar: 'PB',
    joinedAt: '01 Jun 2023'
  },
  {
    id: 4,
    name: 'Sophie Lefebvre',
    email: 'sophie@entreprise.tn',
    role: 'member',
    roleLabel: 'Membre',
    department: 'Commercial',
    status: 'active',
    avatar: 'SL',
    joinedAt: '15 Aug 2023'
  },
  {
    id: 5,
    name: 'Lucas Moreau',
    email: 'lucas@entreprise.tn',
    role: 'member',
    roleLabel: 'Membre',
    department: 'Marketing',
    status: 'pending',
    avatar: 'LM',
    joinedAt: 'En attente'
  }
];

const roles = [
  { value: 'admin', label: 'Administrateur', description: 'Accès complet sauf suppression entreprise' },
  { value: 'accountant', label: 'Comptable', description: 'Gestion financière, factures, dépenses' },
  { value: 'member', label: 'Membre', description: 'Accès limité selon permissions' }
];

const roleColors = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  accountant: 'bg-green-100 text-green-700',
  member: 'bg-gray-100 text-gray-700'
};

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const pendingInvites = teamMembers.filter(m => m.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
          <p className="text-gray-500">Gérez les membres de votre équipe et leurs permissions</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Inviter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total membres</p>
          <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Membres actifs</p>
          <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Invitations en attente</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingInvites}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Membre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Département</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date d'ajout</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      roleColors[member.role as keyof typeof roleColors]
                    }`}>
                      <Shield className="h-3.5 w-3.5" />
                      {member.roleLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member.department}</td>
                  <td className="px-6 py-4 text-gray-600">{member.joinedAt}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {member.status === 'active' ? (
                        <><Check className="h-3.5 w-3.5" /> Actif</>
                      ) : (
                        <><Clock className="h-3.5 w-3.5" /> En attente</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {member.role !== 'owner' && (
                        <>
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {member.status === 'pending' && (
                        <button className="px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          Renvoyer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rôles et permissions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-900">{role.label}</span>
              </div>
              <p className="text-sm text-gray-500">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Inviter un membre</h2>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Finance, Commercial..."
                />
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  Un email d'invitation sera envoyé à l'adresse indiquée. Le membre devra créer un compte ou se connecter pour rejoindre l'équipe.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modifier le membre</h2>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-medium">
                  {selectedMember.avatar}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{selectedMember.name}</p>
                  <p className="text-gray-500">{selectedMember.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  defaultValue={selectedMember.role}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <input
                  type="text"
                  defaultValue={selectedMember.department}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
