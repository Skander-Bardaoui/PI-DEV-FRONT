// src/components/purchases/OcrInvoiceModal.tsx
//
// Modal d'import automatique de facture par OCR
// 1. Upload du scan → Google Vision extrait le texte
// 2. Parsing tunisien → champs pré-remplis avec niveau de confiance
// 3. Vérification par l'utilisateur → création de la facture

import { useState, useCallback } from 'react';
import { useDropzone }           from 'react-dropzone';
import {
  X, Upload, FileText, CheckCircle,
  AlertTriangle, AlertCircle, Zap, RefreshCw,
} from 'lucide-react';
import { useOcrExtract, OcrResult, ConfidenceLevel } from '@/hooks/useOcr';
import { useSuppliers }     from '@/hooks/useSuppliers';
import { useCreatePurchaseInvoice } from '@/hooks/usePurchaseInvoices';

// ─── Config confiance ─────────────────────────────────────────────────────────
const CONF_CONFIG: Record<ConfidenceLevel, {
  icon: 'ok' | 'warn' | 'err'; color: string; bg: string; label: string;
}> = {
  high:      { icon: 'ok',   color: '#16A34A', bg: '#F0FDF4', label: 'Haute confiance'   },
  medium:    { icon: 'warn', color: '#D97706', bg: '#FFFBEB', label: 'Confiance moyenne'  },
  low:       { icon: 'err',  color: '#DC2626', bg: '#FEF2F2', label: 'Faible confiance'   },
  not_found: { icon: 'err',  color: '#9CA3AF', bg: '#F9FAFB', label: 'Non détecté'        },
};

function ConfIcon({ level }: { level: ConfidenceLevel }) {
  const cfg = CONF_CONFIG[level];
  if (cfg.icon === 'ok')   return <CheckCircle  size={14} color={cfg.color} />;
  if (cfg.icon === 'warn') return <AlertTriangle size={14} color={cfg.color} />;
  return <AlertCircle size={14} color={cfg.color} />;
}

// ─── Champ pré-rempli avec indicateur confiance ───────────────────────────────
function OcrField({
  label, value, confidence, onChange, type = 'text', required = false,
}: {
  label:      string;
  value:      string;
  confidence: ConfidenceLevel;
  onChange:   (v: string) => void;
  type?:      string;
  required?:  boolean;
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
        {isDragActive ? 'Déposez le fichier ici' : 'Déposez votre scan de facture'}
      </p>
      <p style={{ fontSize: 12, color: '#9CA3AF' }}>PDF, JPG, PNG — max 10 Mo</p>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────
interface Props {
  businessId: string;
  onClose:    () => void;
  onCreated?: () => void;
}

export default function OcrInvoiceModal({ businessId, onClose, onCreated }: Props) {
  const [step,    setStep]    = useState<'upload' | 'review' | 'done'>('upload');
  const [ocrData, setOcrData] = useState<OcrResult | null>(null);
  const [error,   setError]   = useState('');

  // Formulaire pré-rempli par l'OCR (éditable)
  const [form, setForm] = useState({
    invoice_number_supplier: '',
    invoice_date:            '',
    supplier_id:             '',
    subtotal_ht:             '',
    tax_amount:              '',
    timbre_fiscal:           '1.000',
    net_amount:              '',
    receipt_url:             '',
  });

  // Niveaux de confiance pour chaque champ
  const [conf, setConf] = useState<Record<string, ConfidenceLevel>>({
    invoice_number_supplier: 'not_found',
    invoice_date:            'not_found',
    supplier_name:           'not_found',
    subtotal_ht:             'not_found',
    tax_amount:              'not_found',
    timbre_fiscal:           'not_found',
    net_amount:              'not_found',
  });

  const [supplierSearch, setSupplierSearch] = useState('');

  const ocr     = useOcrExtract(businessId);
  const create  = useCreatePurchaseInvoice(businessId);
  const { data: suppliersData } = useSuppliers(businessId, { is_active: true, limit: 100, search: supplierSearch || undefined });

  const handleFile = async (file: File) => {
    setError('');
    try {
      const result = await ocr.mutateAsync(file);
      setOcrData(result);

      // Pré-remplir le formulaire avec les données extraites
      setForm({
        invoice_number_supplier: result.invoice_number_supplier.value ?? '',
        invoice_date:            result.invoice_date.value            ?? '',
        supplier_id:             '',
        subtotal_ht:             result.subtotal_ht.value?.toString() ?? '',
        tax_amount:              result.tax_amount.value?.toString()  ?? '',
        timbre_fiscal:           result.timbre_fiscal.value?.toString() ?? '1.000',
        net_amount:              result.net_amount.value?.toString()  ?? '',
        receipt_url:             result.file_url,
      });

      // Pré-remplir les niveaux de confiance
      setConf({
        invoice_number_supplier: result.invoice_number_supplier.confidence,
        invoice_date:            result.invoice_date.confidence,
        supplier_name:           result.supplier_name.confidence,
        subtotal_ht:             result.subtotal_ht.confidence,
        tax_amount:              result.tax_amount.confidence,
        timbre_fiscal:           result.timbre_fiscal.confidence,
        net_amount:              result.net_amount.confidence,
      });

      // Si un nom de fournisseur a été extrait → pré-remplir la recherche
      if (result.supplier_name.value) {
        setSupplierSearch(result.supplier_name.value);
      }

      setStep('review');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur OCR');
    }
  };

  const handleCreate = async () => {
    if (!form.invoice_number_supplier || !form.invoice_date || !form.supplier_id) {
      setError('Veuillez remplir les champs obligatoires : N° facture, date, fournisseur.');
      return;
    }
    setError('');
    try {
      await create.mutateAsync({
        invoice_number_supplier: form.invoice_number_supplier,
        invoice_date:            form.invoice_date,
        supplier_id:             form.supplier_id,
        subtotal_ht:             parseFloat(form.subtotal_ht) || 0,
        tax_amount:              parseFloat(form.tax_amount)  || 0,
        timbre_fiscal:           parseFloat(form.timbre_fiscal) || 1,
        net_amount:              parseFloat(form.net_amount)  || 0,
        receipt_url:             form.receipt_url || undefined,
      });
      setStep('done');
      onCreated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création.');
    }
  };

  const upd = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const net = (parseFloat(form.subtotal_ht) || 0)
            + (parseFloat(form.tax_amount)  || 0)
            + (parseFloat(form.timbre_fiscal) || 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60 }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <Zap size={20} color="#4F46E5" />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Import automatique par OCR</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
              {step === 'upload' ? 'Uploadez le scan de votre facture' : step === 'review' ? 'Vérifiez et corrigez les données extraites' : 'Facture créée avec succès'}
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
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Google Vision extrait le texte de votre facture</p>
                </div>
              ) : (
                <>
                  <DropZone onFile={handleFile} />
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 12, color: '#3730A3' }}>
                    <strong>Comment ça marche :</strong> uploadez le scan ou PDF de la facture papier → l'IA extrait automatiquement tous les champs → vous vérifiez et validez en quelques secondes.
                  </div>
                </>
              )}
            </>
          )}

          {/* Étape 2 — Vérification */}
          {step === 'review' && ocrData && (
            <>
              {/* Score OCR + Validation IA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {/* Score OCR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ocrData.ocr_confidence >= 60 ? '#F0FDF4' : '#FFFBEB', borderRadius: 10, border: `1px solid ${ocrData.ocr_confidence >= 60 ? '#86EFAC' : '#FCD34D'}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: ocrData.ocr_confidence >= 60 ? '#16A34A' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {ocrData.ocr_confidence}%
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: ocrData.ocr_confidence >= 60 ? '#166534' : '#92400E' }}>
                      {ocrData.ocr_confidence >= 80 ? 'Extraction excellente' : ocrData.ocr_confidence >= 60 ? 'Extraction correcte' : 'Extraction partielle — vérifiez les champs'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7280' }}>
                      Traité en {ocrData.processing_time_ms}ms — {ocrData.file_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('upload')}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                  >
                    <RefreshCw size={14} /> Nouveau scan
                  </button>
                </div>

                {/* Validation IA */}
                {ocrData.ai_validation && (
                  <div style={{ 
                    padding: '12px 14px', 
                    background: ocrData.ai_validation.isValid ? '#EFF6FF' : '#FEF2F2', 
                    borderRadius: 10, 
                    border: `1px solid ${ocrData.ai_validation.isValid ? '#BFDBFE' : '#FCA5A5'}` 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: ocrData.ai_validation.isValid ? '#3B82F6' : '#EF4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 12 
                      }}>
                        {ocrData.ai_validation.confidence}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: ocrData.ai_validation.isValid ? '#1E40AF' : '#991B1B' }}>
                          🤖 Validation IA {ocrData.ai_validation.isValid ? 'réussie' : 'avec erreurs'}
                        </p>
                        {ocrData.ai_validation.hasCorrections && (
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#059669', fontWeight: 500 }}>
                            ✓ Corrections automatiques appliquées
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Erreurs */}
                    {ocrData.ai_validation.errors.length > 0 && (
                      <div style={{ marginTop: 8, padding: '8px 10px', background: '#FEE2E2', borderRadius: 6 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#991B1B' }}>❌ Erreurs détectées:</p>
                        {ocrData.ai_validation.errors.map((err, i) => (
                          <p key={i} style={{ margin: '2px 0', fontSize: 11, color: '#7F1D1D' }}>• {err}</p>
                        ))}
                      </div>
                    )}

                    {/* Avertissements */}
                    {ocrData.ai_validation.warnings.length > 0 && (
                      <div style={{ marginTop: 8, padding: '8px 10px', background: '#FEF9C3', borderRadius: 6 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#92400E' }}>⚠️ Avertissements:</p>
                        {ocrData.ai_validation.warnings.map((warn, i) => (
                          <p key={i} style={{ margin: '2px 0', fontSize: 11, color: '#78350F' }}>• {warn}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* N° facture */}
                <OcrField label="N° Facture fournisseur" value={form.invoice_number_supplier}
                  confidence={conf.invoice_number_supplier} onChange={upd('invoice_number_supplier')} required />

                {/* Date */}
                <OcrField label="Date de facture" value={form.invoice_date}
                  confidence={conf.invoice_date} onChange={upd('invoice_date')} type="date" required />

                {/* Fournisseur */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Fournisseur *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 10, background: CONF_CONFIG[conf.supplier_name].bg, fontSize: 10, color: CONF_CONFIG[conf.supplier_name].color }}>
                      <ConfIcon level={conf.supplier_name} />
                      {ocrData.supplier_name.value ? `Détecté : "${ocrData.supplier_name.value}"` : 'Non détecté'}
                    </div>
                  </div>
                  <input type="text" placeholder="Rechercher un fournisseur..." value={supplierSearch}
                    onChange={e => setSupplierSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: '8px 8px 0 0', outline: 'none', boxSizing: 'border-box' }} />
                  <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                    size={3}
                    style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #D1D5DB', borderTop: 'none', borderRadius: '0 0 8px 8px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">— Sélectionner —</option>
                    {(suppliersData?.data ?? []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Montants */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <OcrField label="HT" value={form.subtotal_ht} confidence={conf.subtotal_ht}
                    onChange={upd('subtotal_ht')} type="number" />
                  <OcrField label="TVA" value={form.tax_amount} confidence={conf.tax_amount}
                    onChange={upd('tax_amount')} type="number" />
                  <OcrField label="Timbre" value={form.timbre_fiscal} confidence={conf.timbre_fiscal}
                    onChange={upd('timbre_fiscal')} type="number" />
                </div>

                {/* Net calculé */}
                <div style={{ background: '#EEF2FF', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#3730A3', fontWeight: 500 }}>Net TTC calculé</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#3730A3', fontFamily: 'monospace' }}>
                    {net.toFixed(3)} TND
                  </span>
                </div>

                {ocrData.net_amount.value && Math.abs(net - ocrData.net_amount.value) > 0.01 && (
                  <div style={{ padding: '8px 12px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
                    ⚠️ Écart détecté : OCR a lu {ocrData.net_amount.value.toFixed(3)} TND, calcul donne {net.toFixed(3)} TND. Vérifiez les montants.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '11px', border: '1px solid #D1D5DB', borderRadius: 10, cursor: 'pointer', background: '#fff', fontSize: 14 }}>
                  Annuler
                </button>
                <button onClick={handleCreate} disabled={create.isPending}
                  style={{ flex: 2, padding: '11px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: create.isPending ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Zap size={16} />
                  {create.isPending ? 'Création...' : 'Créer la facture'}
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
                La facture <strong>{form.invoice_number_supplier}</strong> a été créée automatiquement depuis le scan OCR.
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