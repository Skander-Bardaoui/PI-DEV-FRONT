// src/components/sales/DeliveryNoteDetailModal.tsx
import { X, Package, ChevronDown, ChevronUp, Edit, Trash2, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DeliveryNote, DELIVERY_NOTE_STATUS_COLORS, DELIVERY_NOTE_STATUS_LABELS, DeliveryNoteStatus } from '@/types/delivery-note';
import {
  useMarkDelivered,
  useCancelDeliveryNote,
  useDeliveryNote,
} from '@/hooks/useDeliveryNotes';
import DeliveryNoteModal from './DeliveryNoteModal';
import ConfirmModal from '../ui/ConfirmModal';
import PDFButton from '../purchases/PDFButton';
import { printDeliveryNote } from '@/utils/delivery-note-print';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  note: DeliveryNote;
  businessId: string;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function DeliveryNoteDetailModal({ note: initialNote, businessId, onClose, onDelete }: Props) {
  const [showItems, setShowItems] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { user } = useAuth();

  // Fetch full note details with items
  const { data: fullNote, isLoading } = useDeliveryNote(businessId, initialNote.id);
  const note = fullNote || initialNote;

  const markDelivered = useMarkDelivered(businessId);
  const cancel = useCancelDeliveryNote(businessId);

  const canEdit = note.status === DeliveryNoteStatus.PENDING;
  const canMarkDelivered = note.status === DeliveryNoteStatus.PENDING;
  const canCancel = note.status === DeliveryNoteStatus.PENDING;
  const canDelete = note.status === DeliveryNoteStatus.PENDING;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{note.deliveryNoteNumber}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${DELIVERY_NOTE_STATUS_COLORS[note.status]}`}>
                  {DELIVERY_NOTE_STATUS_LABELS[note.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{note.client?.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement des détails...</div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Infos générales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-medium">{note.client?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date de livraison</p>
                  <p className="font-medium">{formatDate(note.deliveryDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="font-medium">{formatDate(note.createdAt)}</p>
                </div>
              </div>

              {/* Lignes */}
              <div>
                <button
                  onClick={() => setShowItems(v => !v)}
                  className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left"
                >
                  <Package className="h-4 w-4" />
                  Articles livrés ({note.items?.length ?? 0})
                  {showItems ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </button>
                {showItems && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-gray-500">Description</th>
                          <th className="text-center px-4 py-2 text-gray-500">Qté commandée</th>
                          <th className="text-center px-4 py-2 text-gray-500">Qté livrée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(note.items ?? []).map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-center font-medium">{item.deliveredQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes */}
              {note.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{note.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer - Actions */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <div className="flex flex-wrap gap-2">
              <PDFButton
                onClick={() => printDeliveryNote(note, (user as any)?.business?.name || 'Entreprise', (user as any)?.business?.matricule_fiscal, (user as any)?.business?.address)}
                label="Télécharger PDF"
                variant="ghost"
              />
              {canEdit && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
              )}
              {canMarkDelivered && (
                <button
                  onClick={() => markDelivered.mutate(note.id)}
                  disabled={markDelivered.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Truck className="h-4 w-4" />
                  Marquer livré
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => cancel.mutate(note.id)}
                  disabled={cancel.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Annuler
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <DeliveryNoteModal
          businessId={businessId}
          note={note}
          onClose={() => {
            setEditOpen(false);
            onClose();
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Supprimer le bon de livraison"
          message={`Êtes-vous sûr de vouloir supprimer le bon de livraison ${note.deliveryNoteNumber} ?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(false)}
        />
      )}
    </>
  );
}
