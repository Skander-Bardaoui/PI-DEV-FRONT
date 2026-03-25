// src/components/sales/SendInvoiceEmailModal.tsx
import { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SendInvoiceEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  businessId: string;
  onSuccess?: () => void;
}

export default function SendInvoiceEmailModal({
  isOpen,
  onClose,
  invoice,
  businessId,
  onSuccess,
}: SendInvoiceEmailModalProps) {
  const [email, setEmail] = useState(invoice?.client?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/businesses/${businessId}/invoices/${invoice.id}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Send cookies automatically
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmail(invoice?.client?.email || '');
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Envoyer la facture par email</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Invoice Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Facture:</span>
                <span className="font-semibold">{invoice?.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Client:</span>
                <span className="font-semibold">{invoice?.client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Montant:</span>
                <span className="font-semibold text-indigo-600">
                  {Number(invoice?.net_amount || 0).toFixed(3)} TND
                </span>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email du destinataire
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSending || success}
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Email envoyé avec succès!</p>
                  <p className="text-sm text-green-700">
                    La facture a été envoyée à {email}
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Erreur</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Info */}
            {!success && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 La facture sera envoyée en pièce jointe au format PDF avec un email personnalisé.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSending}
              >
                {success ? 'Fermer' : 'Annuler'}
              </button>
              
              {!success && (
                <button
                  onClick={handleSend}
                  disabled={isSending || !email}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
