// src/hooks/useOcr.ts
import { useMutation } from '@tanstack/react-query';
import axiosInstance   from '@/api/axiosInstance';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'not_found';

export interface ExtractedField<T> {
  value:      T | null;
  confidence: ConfidenceLevel;
  raw:        string | null;
}

export interface OcrResult {
  invoice_number_supplier: ExtractedField<string>;
  invoice_date:            ExtractedField<string>;
  supplier_name:           ExtractedField<string>;
  subtotal_ht:             ExtractedField<number>;
  tax_amount:              ExtractedField<number>;
  timbre_fiscal:           ExtractedField<number>;
  net_amount:              ExtractedField<number>;
  raw_text:                string;
  ocr_confidence:          number;
  processing_time_ms:      number;
  file_url:                string;
  file_name:               string;
  file_size:               number;
}

export function useOcrExtract(businessId: string) {
  return useMutation({
    mutationFn: async (file: File): Promise<OcrResult> => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axiosInstance.post(
        `/businesses/${businessId}/ocr/extract`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data as OcrResult;
    },
  });
}