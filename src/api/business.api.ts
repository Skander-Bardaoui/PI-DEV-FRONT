// src/api/business.api.ts
import axiosInstance from './axiosInstance';
import {
  Business,
  BusinessSettings,
  TaxRate,
  CreateBusinessDto,
  UpdateBusinessDto,
  UpdateBusinessSettingsDto,
  CreateTaxRateDto,
  UpdateTaxRateDto,
} from '../types/business.types';

// ─── Business CRUD ───────────────────────────────────────────────────────

export const createBusiness = async (data: CreateBusinessDto): Promise<Business> => {
  const response = await axiosInstance.post('/businesses', data);
  return response.data;
};

export const getBusinesses = async (tenantId?: string): Promise<{ businesses: Business[]; total: number }> => {
  const params = tenantId ? { tenant_id: tenantId } : {};
  const response = await axiosInstance.get('/businesses', { params });
  return response.data;
};

export const getBusinessById = async (id: string): Promise<Business> => {
  const response = await axiosInstance.get(`/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id: string, data: UpdateBusinessDto): Promise<Business> => {
  const response = await axiosInstance.patch(`/businesses/${id}`, data);
  return response.data;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/businesses/${id}`);
};

// ─── Business Settings ───────────────────────────────────────────────────

export const getBusinessSettings = async (businessId: string): Promise<BusinessSettings> => {
  const response = await axiosInstance.get(`/businesses/${businessId}/settings`);
  return response.data;
};

export const updateBusinessSettings = async (
  businessId: string,
  data: UpdateBusinessSettingsDto
): Promise<BusinessSettings> => {
  const response = await axiosInstance.patch(`/businesses/${businessId}/settings`, data);
  return response.data;
};

// ─── Tax Rates ───────────────────────────────────────────────────────────

export const createTaxRate = async (businessId: string, data: CreateTaxRateDto): Promise<TaxRate> => {
  const response = await axiosInstance.post(`/businesses/${businessId}/tax-rates`, data);
  return response.data;
};

export const getTaxRates = async (businessId: string): Promise<TaxRate[]> => {
  const response = await axiosInstance.get(`/businesses/${businessId}/tax-rates`);
  return response.data;
};

export const updateTaxRate = async (
  businessId: string,
  taxRateId: string,
  data: UpdateTaxRateDto
): Promise<TaxRate> => {
  const response = await axiosInstance.patch(`/businesses/${businessId}/tax-rates/${taxRateId}`, data);
  return response.data;
};

export const deleteTaxRate = async (businessId: string, taxRateId: string): Promise<void> => {
  await axiosInstance.delete(`/businesses/${businessId}/tax-rates/${taxRateId}`);
};
