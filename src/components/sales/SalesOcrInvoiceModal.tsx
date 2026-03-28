// src/components/sales/SalesOcrInvoiceModal.tsx
//
// Modal d'import automatique de facture client par OCR
// 1. Upload du scan → Tesseract extrait le texte
// 2. Parsing → champs pré-remplis avec niveau de confiance
// 3. Vérification par l'utilisateur → création de la facture

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  X, Upload, FileText, CheckCircle,
  AlertTriangle, AlertCircle, Zap, RefreshCw,
} from 'lucide-react';
import { useSalesOcrExtract, SalesOcrResult, ConfidenceLevel } from '@/hooks/useSalesOcr';
import { useClients } from '@/hooks/useClients';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';

// ─── Config confiance ─────────────────────────────────────────────────────────
const CONF_CONFIG: Record<ConfidenceLevel, {
  icon: 'ok' | 'warn' | 'err'; color: string; bg: string; label: string;
}> = {
  high: { icon: 'ok', color: '#16A34A', bg: '#F0FDF4', label: 'Haute confiance' },
  medium: { icon: 'warn', color: '#D97706', bg: '#FFFBEB', label: 'Confiance moyenne' },
  low: { icon: 'err', color: '#DC2626', bg: '#FEF2F2', label: 'Faible confiance' },
  not_found: { icon: 'err', color: '#9CA3AF', bg: '#F9FAFB', label: 'Non détecté' },
};

function ConfIcon({ level }: { level: ConfidenceLevel }) {
  const cfg = CONF_CONFIG[level];
  if (cfg.icon === 'ok') return <CheckCircle size={14} color={cfg.color} />;
  if (cfg.icon === 'warn') return <AlertTriangle size={14} color={cfg.color} />;
  return <AlertCircle size={14} color={cfg.color} />;
}

// ─── Champ pré-rempli avec indicateur confiance ───────────────────────────────
function OcrField({
  label, value, confidence, onChange, type = 'text', required = false,
}: {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  const cfg = CONF_CONFIG[confidence];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}{required && ' *'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 10, background: cfg.bg, fontSize: 10, color: cfg.color }}>
          <ConfIcon level={confidence} />
          {cfg.label}
        </div>
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', fontSize: 13,
          border: `1px solid ${confidence === 'not_found' ? '#FCA5A5' : confidence === 'low' ? '#FCD34D' : '#D1D5DB'}`,
          borderRadius: 8, outline: 'none', boxSizing: 'border-box',
          background: confidence === 'not_found' ? '#FEF2F2' : '#fff',
        }}
      />
    </div>
  );
}

// ─── Zone de drop ─────────────────────────────────────────────────────────────
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onFile(files[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [], 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#4F46E5' : '#D1D5DB'}`,
        borderRadius: 12, padding: '40px 20px', textAlign: 'center',
        cursor: 'pointer', background: isDragActive ? '#EEF2FF' : '#FAFAFA',
        transition: 'all .2s',
      }}
    >
      <input {...getInputProps()} />
      <Upload size={32} color={isDragActive ? '#4F46E5' : '#9CA3AF'} style={{ margin: '0 auto 12px' }} />
      <p style={{ fontSize: 14, fontWeight: 500, color: isDragActive ? '#4F46E5' : '#374151', marginBottom: 4 }}>
        {isDragActive ? 'Déposez le fichier ici' : 'Déposez votre scan de facture client'}
      </p>
      <p style={{ fontSize: 12, color: '#9CA3AF' }}>PDF, JPG, PNG — max 10 Mo</p>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────
interface Props {
  businessId: string;
  onClose: () => void;
  onCreated?: () => void;
}

export default function SalesOcrInvoiceModal({ businessId, onClose, onCreated }: Props) {
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [ocrData, setOcrData] = useState<SalesOcrResult | null>(null);
  const [error, setError] = useState('');

  // Formulaire pré-rempli par l'OCR (éditable)
  const [form, setForm] = useState({
    invoice_number: '',
    date: '',
    due_date: '',
    client_id: '',
    subtotal_ht: '',
    tax_amount: '',
    discount: '0',
    net_amount: '',
    payment_terms: '',
    notes: '',
  });

  // Niveaux de confiance pour chaque champ
  const [conf, setConf] = useState<Record<string, ConfidenceLevel>>({
    invoice_number: 'not_found',
    date: 'not_found',
    client_name: 'not_found',
    subtotal_ht: 'not_found',
    tax_amount: 'not_found',
    total_ttc: 'not_found',
  });

  const [clientSearch, setClientSearch] = useState('');

  const ocr = useSalesOcrExtract(businessId, 'invoice');
  const queryClient = useQueryClient();
  
  const { data: clientsData, isLoading: clientsLoading } = useClients(businessId, { 
    limit: 100
  });

  // Debug: log clients data
  console.log('Clients data:', clientsData);
  console.log('Clients loading:', clientsLoading);
  console.log('Clients array:', clientsData?.clients);

  const createInvoice = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        `/businesses/${businessId}/invoices`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices', businessId] });
    },
  });

  const handleFile = async (file: File) => {
    setError('');
    try {
      const result = await ocr.mutateAsync(file);
      setOcrData(result);

      // Calculer la date d'échéance (30 jours par défaut)
      const invoiceDate = result.document_date.value || new Date().toISOString().split('T')[0];
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Pré-remplir le formulaire avec les données extraites
      setForm({
        invoice_number: result.document_number.value ?? '',
        date: invoiceDate,
        due_date: dueDate.toISOString().split('T')[0],
        client_id: '',
        subtotal_ht: result.subtotal_ht.value?.toString() ?? '',
        tax_amount: result.tax_amount.value?.toString() ?? '',
        discount: '0',
        net_amount: result.total_ttc.value?.toString() ?? '',
        payment_terms: result.payment_terms.value ?? '',
        notes: result.notes.value ?? '',
      });

      // Pré-remplir les niveaux de confiance
      setConf({
        invoice_number: result.document_number.confidence,
        date: result.document_date.confidence,
        client_name: result.client_name.confidence,
        subtotal_ht: result.subtotal_ht.confidence,
        tax_amount: result.tax_amount.confidence,
        total_ttc: result.total_ttc.confidence,
      });

      // Si un nom de client a été extrait → pré-remplir la recherche
      if (result.client_name.value) {
        setClientSearch(result.client_name.value);
      }

      setStep('review');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur OCR');
    }
  };

  const handleCreate = async () => {
    if (!form.invoice_number || !form.date || !form.client_id) {
      setError('Veuillez remplir les champs obligatoires : N° facture, date, client.');
      return;
    }
    setError('');
    try {
      // Préparer les items - utiliser les items OCR ou créer un item par défaut
      const items = ocrData?.items && ocrData.items.length > 0
        ? ocrData.items.map(item => ({
            description: item.description || 'Article',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_rate_value: 19,
          }))
        : [{
            description: 'Article',
            quantity: 1,
            unit_price: parseFloat(form.subtotal_ht) || 0,
            tax_rate_value: 19,
          }];

      await createInvoice.mutateAsync({
        invoice_number: form.invoice_number,
        date: form.date,
        due_date: form.due_date,
        client_id: form.client_id,
        subtotal_ht: parseFloat(form.subtotal_ht) || 0,
        tax_amount: parseFloat(form.tax_amount) || 0,
        discount: parseFloat(form.discount) || 0,
        net_amount: parseFloat(form.net_amount) || 0,
        payment_terms: form.payment_terms || undefined,
        notes: form.notes || undefined,
        status: 'DRAFT',
        items,
      });
      setStep('done');
      onCreated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création.');
    }
  };

  const upd = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const net = (parseFloat(form.subtotal_ht) || 0)
    + (parseFloat(form.tax_amount) || 0)
    - (parseFloat(form.discount) || 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60 }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <Zap size={20} color="#4F46E5" />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Import automatique par OCR</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
              {step === 'upload' ? 'Uploadez le scan de votre facture client' : step === 'review' ? 'Vérifiez et corrigez les données extraites' : 'Facture créée avec succès'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>

          {/* Étape 1 — Upload */}
          {step === 'upload' && (
            <>
              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
                  {error}
                </div>
              )}
              {ocr.isPending ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>Analyse en cours...</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Tesseract extrait le texte de votre facture</p>
                </div>
              ) : (
                <>
                  <DropZone onFile={handleFile} />
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 12, color: '#3730A3' }}>
                    <strong>Comment ça marche :</strong> uploadez le scan ou PDF de la facture → l'IA extrait automatiquement tous les champs → vous vérifiez et validez en quelques secondes.
                  </div>
                </>
              )}
            </>
          )}

          {/* Étape 2 — Vérification */}
          {step === 'review' && ocrData && (
            <>
              {/* Score OCR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ocrData.ocr_confidence >= 60 ? '#F0FDF4' : '#FFFBEB', borderRadius: 10, marginBottom: 16, border: `1px solid ${ocrData.ocr_confidence >= 60 ? '#86EFAC' : '#FCD34D'}` }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: ocrData.ocr_confidence >= 60 ? '#16A34A' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {ocrData.ocr_confidence}%
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: ocrData.ocr_confidence >= 60 ? '#166534' : '#92400E' }}>
                    {ocrData.ocr_confidence >= 80 ? 'Extraction excellente' : ocrData.ocr_confidence >= 60 ? 'Extraction correcte' : 'Extraction partielle — vérifiez les champs'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7280' }}>
                    Traité en {ocrData.processing_time_ms}ms — {ocrData.file_name}
                  </p>
                  {/* Afficher la confiance AI si disponible */}
                  {ocrData.ai_enrichment && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#4F46E5', fontWeight: 500 }}>
                      🤖 AI enrichment confidence: {ocrData.ai_enrichment.confidence}%
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setStep('upload')}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                >
                  <RefreshCw size={14} /> Nouveau scan
                </button>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* N° facture */}
                <OcrField label="N° Facture" value={form.invoice_number}
                  confidence={conf.invoice_number} onChange={upd('invoice_number')} required />

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <OcrField label="Date de facture" value={form.date}
                    confidence={conf.date} onChange={upd('date')} type="date" required />
                  <OcrField label="Date d'échéance" value={form.due_date}
                    confidence="medium" onChange={upd('due_date')} type="date" />
                </div>

                {/* Client */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Client *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 10, background: CONF_CONFIG[conf.client_name].bg, fontSize: 10, color: CONF_CONFIG[conf.client_name].color }}>
                      <ConfIcon level={conf.client_name} />
                      {ocrData.client_name.value ? `Détecté : "${ocrData.client_name.value}"` : 'Non détecté'}
                    </div>
                  </div>
                  
                  {clientsLoading ? (
                    <div style={{ width: '100%', padding: '12px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8, textAlign: 'center', color: '#6B7280', background: '#F9FAFB' }}>
                      Chargement des clients...
                    </div>
                  ) : (
                    <select 
                      value={form.client_id} 
                      onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        fontSize: 13, 
                        border: '1px solid #D1D5DB', 
                        borderRadius: 8, 
                        outline: 'none', 
                        boxSizing: 'border-box',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">— Sélectionner un client —</option>
                      {(clientsData?.clients ?? []).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  
                  {!clientsLoading && (clientsData?.clients ?? []).length === 0 && (
                    <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>
                      Aucun client disponible. Créez d'abord un client.
                    </p>
                  )}
                </div>

                {/* Montants */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <OcrField label="HT" value={form.subtotal_ht} confidence={conf.subtotal_ht}
                    onChange={upd('subtotal_ht')} type="number" />
                  <OcrField label="TVA" value={form.tax_amount} confidence={conf.tax_amount}
                    onChange={upd('tax_amount')} type="number" />
                  <OcrField label="Remise" value={form.discount} confidence="not_found"
                    onChange={upd('discount')} type="number" />
                </div>

                {/* Net calculé */}
                <div style={{ background: '#EEF2FF', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#3730A3', fontWeight: 500 }}>Net TTC calculé</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#3730A3', fontFamily: 'monospace' }}>
                    {net.toFixed(3)} TND
                  </span>
                </div>

                {ocrData.total_ttc.value && Math.abs(net - ocrData.total_ttc.value) > 0.01 && (
                  <div style={{ padding: '8px 12px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
                    ⚠️ Écart détecté : OCR a lu {ocrData.total_ttc.value.toFixed(3)} TND, calcul donne {net.toFixed(3)} TND. Vérifiez les montants.
                  </div>
                )}

                {/* Articles détectés */}
                {ocrData.items && ocrData.items.length > 0 && (
                  <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      Articles détectés ({ocrData.items.length})
                    </p>
                    <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: 11, color: '#6B7280' }}>
                      {ocrData.items.map((item, idx) => (
                        <div key={idx} style={{ padding: '4px 0', borderBottom: idx < ocrData.items.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                          <div style={{ fontWeight: 500, color: '#374151' }}>{item.description}</div>
                          <div>Qté: {item.quantity} × {item.unit_price?.toFixed(3)} = {item.total?.toFixed(3)} TND</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditions de paiement */}
                {form.payment_terms && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>Conditions de paiement</label>
                    <input
                      type="text"
                      value={form.payment_terms}
                      onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {/* Notes */}
                {form.notes && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '11px', border: '1px solid #D1D5DB', borderRadius: 10, cursor: 'pointer', background: '#fff', fontSize: 14 }}>
                  Annuler
                </button>
                <button onClick={handleCreate} disabled={createInvoice.isPending}
                  style={{ flex: 2, padding: '11px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: createInvoice.isPending ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Zap size={16} />
                  {createInvoice.isPending ? 'Création...' : 'Créer la facture'}
                </button>
              </div>
            </>
          )}

          {/* Étape 3 — Succès */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle size={48} color="#16A34A" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Facture créée !</h3>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
                La facture <strong>{form.invoice_number}</strong> a été créée automatiquement depuis le scan OCR.
              </p>
              <button onClick={onClose}
                style={{ padding: '12px 32px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
