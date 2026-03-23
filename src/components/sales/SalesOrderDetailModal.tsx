// src/components/sales/SalesOrderDetailModal.tsx
import { X, Package, ChevronDown, ChevronUp, Edit, Trash2, Play, Truck, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesOrder, SALES_ORDER_STATUS_COLORS, SALES_ORDER_STATUS_LABELS, SalesOrderStatus } from '@/types/sales-order';
import {
  useStartProgressSalesOrder,
  useMarkDeliveredSalesOrder,
  useMarkInvoicedSalesOrder,
  useConvertSalesOrderToInvoice,
  useCancelSalesOrder,
  useSalesOrder,
} from '@/hooks/useSalesOrders';
import SalesOrderModal from './SalesOrderModal';
import ConfirmModal from '../ui/ConfirmModal';
import PDFButton from '../purchases/PDFButton';
import { printSalesOrder } from '@/utils/sales-order-print';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

interface Props {
  order: SalesOrder;
  businessId: string;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function SalesOrderDetailModal({ order: initialOrder, businessId, onClose, onDelete }: Props) {
  const [showItems, setShowItems] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch full order details with items
  const { data: fullOrder, isLoading } = useSalesOrder(businessId, initialOrder.id);
  const order = fullOrder || initialOrder;

  const startProgress = useStartProgressSalesOrder(businessId);
  const markDelivered = useMarkDeliveredSalesOrder(businessId);
  const markInvoiced = useMarkInvoicedSalesOrder(businessId);
  const convertToInvoice = useConvertSalesOrderToInvoice(businessId);
  const cancel = useCancelSalesOrder(businessId);

  const handleConvertToInvoice = async () => {
    try {
      const result = await convertToInvoice.mutateAsync(order.id);
      toast.success('Facture créée', 'La facture a été créée avec succès. Rafraîchissez la page pour voir les changements.');
      onClose();
    } catch (error: any) {
      console.error('Conversion error:', error);
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la conversion';
      toast.error('Erreur de conversion', errorMessage);
    }
  };

  const canEdit = order.status === SalesOrderStatus.CONFIRMED;
  const canStartProgress = order.status === SalesOrderStatus.CONFIRMED;
  const canMarkDelivered = order.status === SalesOrderStatus.IN_PROGRESS;
  const canMarkInvoiced = order.status === SalesOrderStatus.DELIVERED;
  const canCancel = [SalesOrderStatus.CONFIRMED, SalesOrderStatus.IN_PROGRESS].includes(order.status);
  const canDelete = order.status === SalesOrderStatus.CONFIRMED || order.status === SalesOrderStatus.INVOICED;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount: number) => {
    return Number(amount).toFixed(3);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(order.id);
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
                <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${SALES_ORDER_STATUS_COLORS[order.status]}`}>
                  {SALES_ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{order.client?.name}</p>
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
                <p className="font-medium">{order.client?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Date de commande</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
              {order.expectedDelivery && (
                <div>
                  <p className="text-gray-500">Livraison prévue</p>
                  <p className="font-medium">{formatDate(order.expectedDelivery)}</p>
                </div>
              )}
            </div>

            {/* Lignes */}
            <div>
              <button
                onClick={() => setShowItems(v => !v)}
                className="flex items-center gap-2 font-semibold text-gray-900 mb-3 w-full text-left"
              >
                <Package className="h-4 w-4" />
                Lignes de la commande ({order.items?.length ?? 0})
                {showItems ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
              </button>
              {showItems && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-gray-500">Description</th>
                        <th className="text-center px-4 py-2 text-gray-500">Qté</th>
                        <th className="text-right px-4 py-2 text-gray-500">Prix HT</th>
                        <th className="text-center px-4 py-2 text-gray-500">TVA</th>
                        <th className="text-right px-4 py-2 text-gray-500">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(order.items ?? []).map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">{formatAmount(item.unitPrice)} DT</td>
                          <td className="px-4 py-2 text-center">{item.taxRate}%</td>
                          <td className="px-4 py-2 text-right">{formatAmount(item.total)} DT</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-xl p-4 ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span><span>{formatAmount(order.subtotal)} DT</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span><span>{formatAmount(order.taxAmount)} DT</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Timbre fiscal</span><span>{formatAmount(order.timbreFiscal)} DT</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                <span>Net TTC</span><span>{formatAmount(order.netAmount)} DT</span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
          )}

          {/* Footer - Actions */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <div className="flex flex-wrap gap-2">
              <PDFButton
                onClick={() => printSalesOrder(order, (user as any)?.business?.name || 'Entreprise', (user as any)?.business?.matricule_fiscal, (user as any)?.business?.address)}
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
              {canStartProgress && (
                <button
                  onClick={() => startProgress.mutate(order.id)}
                  disabled={startProgress.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  Démarrer
                </button>
              )}
              {canMarkDelivered && (
                <button
                  onClick={() => markDelivered.mutate(order.id)}
                  disabled={markDelivered.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Truck className="h-4 w-4" />
                  Marquer livré
                </button>
              )}
              {canMarkInvoiced && (
                <button
                  onClick={handleConvertToInvoice}
                  disabled={convertToInvoice.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  {convertToInvoice.isPending ? 'Conversion...' : 'Convertir en facture'}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => cancel.mutate(order.id)}
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
        <SalesOrderModal
          businessId={businessId}
          order={order}
          onClose={() => {
            setEditOpen(false);
            onClose();
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Supprimer la commande"
          message={`Êtes-vous sûr de vouloir supprimer la commande ${order.orderNumber} ?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(false)}
        />
      )}
    </>
  );
}
