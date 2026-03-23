// src/types/business.types.ts

export interface Business {
  id: string;
  tenant_id: string;
  name: string;
  logo?: string;
  tax_id?: string;
  currency: string;
  tax_rate?: number;
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  business_id: string;
  tax_rate?: number;
  invoice_prefix?: string;
  payment_terms?: number;
  invoice_template?: Record<string, any>;
  other_settings?: Record<string, any>;
}

export interface TaxRate {
  id: string;
  business_id: string;
  name: string;
  rate: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessDto {
  tenant_id: string;
  name: string;
  logo?: string;
  tax_id?: string;
  currency?: string;
  tax_rate?: number;
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface UpdateBusinessDto {
  name?: string;
  logo?: string;
  tax_id?: string;
  currency?: string;
  tax_rate?: number;
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface UpdateBusinessSettingsDto {
  tax_rate?: number;
  invoice_prefix?: string;
  payment_terms?: number;
  invoice_template?: Record<string, any>;
  other_settings?: Record<string, any>;
}

export interface CreateTaxRateDto {
  name: string;
  rate: number;
  is_default: boolean;
}

export interface UpdateTaxRateDto {
  name?: string;
  rate?: number;
  is_default?: boolean;
}
