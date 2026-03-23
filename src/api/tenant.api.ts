// src/api/tenant.api.ts
import axiosInstance from './axiosInstance';
import { Tenant, UpdateTenantDto } from '../types/tenant.types';

// Get my tenant (for BUSINESS_OWNER)
export const getMyTenant = async (): Promise<Tenant> => {
  const response = await axiosInstance.get('/tenants/my');
  return response.data;
};

// Get tenant by ID
export const getTenantById = async (id: string): Promise<Tenant> => {
  const response = await axiosInstance.get(`/tenants/${id}`);
  return response.data;
};

// Update tenant
export const updateTenant = async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
  const response = await axiosInstance.patch(`/tenants/${id}`, data);
  return response.data;
};
