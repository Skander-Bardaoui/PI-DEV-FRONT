// src/pages/backoffice/purchases/PurchaseInvoicesPage.tsx

import { useState } from 'react';
import {
  Plus,
  Eye,
  Check,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Filter,
  Pencil,
  Scale,
  Zap,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';

import {
  usePurchaseInvoices,
  useApprovePurchaseInvoice,
  useDisputePurchaseInvoice,
  useResolveDispute,
  useUpdatePayment,
} from '@/hooks/usePurchaseInvoices';

import { useSuppliers } from '@/hooks/useSuppliers';
import { usePDFExport } from '@/hooks/usePDFExport';

import PurchaseInvoiceModal from '@/components/purchases/PurchaseInvoiceModal';
import CorrectInvoiceModal from '@/components/purchases/CorrectInvoiceModal';
import PDFButton from '@/components/purchases/PDFButton';
import ThreeWayMatchModal from '@/components/purchases/ThreeWayMatchModal';
import OcrInvoiceModal from '@/components/purchases/OcrInvoiceModal';

import {
  formatAmount,
  formatDate,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  InvoiceStatus,
  PurchaseInvoice,
} from '@/types';
import InvoiceDetailModal from '@/components/purchases/Invoicedetailmodal ';
import { PaymentModal } from '@/components/purchases/Paymentmodal';
import DisputeModal from '@/components/purchases/Disputemodal ';

type SortField =
  | 'invoice_number_supplier'
  | 'invoice_date'
  | 'due_date'
  | 'net_amount'
  | 'supplier';

type SortDir = 'asc' | 'desc';

export default function PurchaseInvoicesPage() {
  const { user } = useAuth();
  const businessId = (user as any)?.business_id ?? '';

  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<PurchaseInvoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<PurchaseInvoice | null>(null);
  const [disputeInvoice, setDisputeInvoice] = useState<PurchaseInvoice | null>(null);
  const [correctInvoice, setCorrectInvoice] = useState<PurchaseInvoice | null>(null);
  const [matchInvoice, setMatchInvoice] = useState<PurchaseInvoice | null>(null);

  const { data, isLoading } = usePurchaseInvoices(businessId, {
    page,
    limit: 20,
  });

  const approve = useApprovePurchaseInvoice(businessId);
  const dispute = useDisputePurchaseInvoice(businessId);
  const resolveDisp = useResolveDispute(businessId);
  const updatePayment = useUpdatePayment(businessId);

  const { exportFacture, loading: pdfLoading } = usePDFExport();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Factures fournisseurs</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setOcrOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center"
          >
            <Zap className="h-4 w-4" />
            Import OCR
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center"
          >
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">Chargement...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-4 text-left">N° Facture</th>
                <th className="px-4 py-4 text-left">Fournisseur</th>
                <th className="px-4 py-4 text-left">Date</th>
                <th className="px-4 py-4 text-right">Montant</th>
                <th className="px-4 py-4 text-center">Statut</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data?.data.map(inv => {
                return (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">

                    <td className="px-4 py-4 font-mono">
                      {inv.invoice_number_supplier}
                    </td>

                    <td className="px-4 py-4">
                      {inv.supplier?.name}
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(inv.invoice_date)}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      {formatAmount(inv.net_amount)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}
                      >
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">

                        {/* Détail */}
                        <button
                          onClick={() => setDetailInvoice(inv)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* PDF */}
                        <PDFButton
                          variant="icon"
                          loading={pdfLoading}
                          onClick={() => exportFacture(inv)}
                        />

                        {/* APPROBATION CORRIGÉE */}
                        {inv.status === InvoiceStatus.PENDING && (
                          <button
                            onClick={async () => {
                              if (inv.supplier_po_id) {
                                setMatchInvoice(inv);
                              } else {
                                if (
                                  window.confirm(
                                    `Approuver ${inv.invoice_number_supplier} sans rapprochement BC ?`
                                  )
                                ) {
                                  approve.mutate(inv.id);
                                }
                              }
                            }}
                            disabled={approve.isPending}
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                          >
                            {inv.supplier_po_id ? (
                              <Scale className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* PAIEMENT */}
                        <button
                          onClick={() => setPaymentInvoice(inv)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>

                        {/* LITIGE */}
                        <button
                          onClick={() => setDisputeInvoice(inv)}
                          className="p-1.5 hover:bg-orange-50 rounded-lg"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}

      {createOpen && (
        <PurchaseInvoiceModal
          businessId={businessId}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {ocrOpen && (
        <OcrInvoiceModal
          businessId={businessId}
          onClose={() => setOcrOpen(false)}
        />
      )}

      {detailInvoice && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          businessId={businessId}
          onClose={() => setDetailInvoice(null)}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onConfirm={(paid_amount) => {
            updatePayment.mutate({
              id: paymentInvoice.id,
              dto: { paid_amount },
            });
            setPaymentInvoice(null);
          }}
        />
      )}

      {disputeInvoice && (
        <DisputeModal
          invoice={disputeInvoice}
          onClose={() => setDisputeInvoice(null)}
          onConfirm={(reason) => {
            dispute.mutate({
              id: disputeInvoice.id,
              dto: { dispute_reason: reason },
            });
            setDisputeInvoice(null);
          }}
        />
      )}

      {correctInvoice && (
        <CorrectInvoiceModal
          businessId={businessId}
          invoice={correctInvoice}
          onClose={() => setCorrectInvoice(null)}
        />
      )}

      {matchInvoice && (
        <ThreeWayMatchModal
          businessId={businessId}
          invoiceId={matchInvoice.id}
          onClose={() => setMatchInvoice(null)}
        />
      )}
    </div>
  );
}