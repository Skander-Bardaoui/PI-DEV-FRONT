// src/components/purchases/SupplierPODetailModal.tsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useGoodsReceiptsByPO } from '../../hooks/useGoodsReceipts';
import GoodsReceiptModal from './GoodsReceiptModal';
import { formatAmount, formatDate, PO_STATUS_COLORS, PO_STATUS_LABELS, POStatus, SupplierPO } from '@/types';

interface Props {
  businessId: string;
  po:         SupplierPO;
  onClose:    () => void;
}

export default function SupplierPODetailModal({ businessId, po, onClose }: Props) {
  const [grModalOpen, setGRModalOpen] = useState(false);
  const { data: receipts } = useGoodsReceiptsByPO(businessId, po.id);

  const canReceive = [POStatus.CONFIRMED, POStatus.PARTIALLY_RECEIVED].includes(po.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{po.po_number}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${PO_STATUS_COLORS[po.status]}`}>
              {PO_STATUS_LABELS[po.status]}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Fournisseur :</span> <span className="font-medium">{po.supplier?.name}</span></div>
            <div><span className="text-gray-500">Créé le :</span> {formatDate(po.created_at)}</div>
            {po.expected_delivery && (
              <div><span className="text-gray-500">Livraison prévue :</span> {formatDate(po.expected_delivery)}</div>
            )}
          </div>

          {/* Lignes */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Lignes du BC</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500">Description</th>
                    <th className="text-center px-4 py-3 text-gray-500">Commandé</th>
                    <th className="text-center px-4 py-3 text-gray-500">Reçu</th>
                    <th className="text-right px-4 py-3 text-gray-500">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {po.items?.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.quantity_ordered}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={Number(item.quantity_received) >= Number(item.quantity_ordered) ? 'text-green-600 font-medium' : 'text-orange-600'}>
                          {item.quantity_received}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatAmount(item.line_total_ht)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 rounded-xl p-4 max-w-xs ml-auto">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>HT</span><span>{formatAmount(po.subtotal_ht)}</span></div>
              <div className="flex justify-between text-gray-600"><span>TVA</span><span>{formatAmount(po.tax_amount)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Timbre</span><span>{formatAmount(po.timbre_fiscal)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Net</span><span>{formatAmount(po.net_amount)}</span></div>
            </div>
          </div>

          {/* Bons de réception */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Bons de réception ({receipts?.length ?? 0})</h3>
              {canReceive && (
                <button onClick={() => setGRModalOpen(true)}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  <Plus className="h-4 w-4" /> Créer un BR
                </button>
              )}
            </div>

            {receipts?.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Aucune réception enregistrée</p>
            ) : receipts?.map(gr => (
              <div key={gr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div>
                  <p className="font-medium text-gray-900">{gr.gr_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(gr.receipt_date)}</p>
                </div>
                <span className="text-sm text-gray-600">{gr.items?.length} ligne(s)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button onClick={onClose}
            className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>

      {grModalOpen && (
        <GoodsReceiptModal
          businessId={businessId}
          po={po}
          onClose={() => setGRModalOpen(false)}
        />
      )}
    </div>
  );
}