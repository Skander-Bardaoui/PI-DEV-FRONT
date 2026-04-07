// src/pages/backoffice/sales/ClientsPage.tsx
import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import ClientInvitationModal from '@/components/sales/ClientInvitationModal';
import ClientFormModal from '@/components/sales/ClientFormModal';

export default function ClientsPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const { data, isLoading } = useClients(businessId, { page, limit: 20, search });
  const deleteClient = useDeleteClient(businessId);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name || 'ce client'}" ?`)) {
      await deleteClient.mutateAsync(id);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Gérez vos clients et envoyez des invitations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Ajouter manuellement
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Inviter un client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : !data?.clients?.length ? (
          <div className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Aucun client trouvé</p>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Inviter votre premier client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conditions de paiement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {client.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name || 'Sans nom'}</p>
                          {client.has_portal_access && (
                            <span className="text-xs text-green-600 font-medium">Accès portail</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.address ? (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="line-clamp-2">{client.address}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Non renseignée</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {client.payment_terms || <span className="text-gray-400">Non renseigné</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {data.clients.length} sur {data.total} clients
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {inviteModalOpen && (
        <ClientInvitationModal
          businessId={businessId}
          onClose={() => setInviteModalOpen(false)}
        />
      )}

      {/* Create/Edit Modal */}
      {createModalOpen && (
        <ClientFormModal
          businessId={businessId}
          client={editingClient}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
