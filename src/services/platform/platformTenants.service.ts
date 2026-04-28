// src/services/platform/platformTenants.service.ts
import { platformAxios } from './platformAxios';
import { Tenant, PaginatedResponse, TenantApproval } from '@/types/console.types';

export const platformTenantsService = {
  async listTenants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
    search?: string;
  }): Promise<PaginatedResponse<Tenant>> {
    const { data } = await platformAxios.get('/tenants', { params });
    return data;
  },

  async getTenant(id: string): Promise<Tenant> {
    const { data} = await platformAxios.get(`/tenants/${id}`);
    return data;
  },

  async getTenantDetail(id: string): Promise<any> {
    const { data } = await platformAxios.get(`/tenants/${id}`);
    return data;
  },

  async approveTenant(id: string): Promise<void> {
    await platformAxios.post(`/tenants/${id}/approve`);
  },

  async rejectTenant(id: string, reason: string): Promise<void> {
    await platformAxios.post(`/tenants/${id}/reject`, { reason });
  },

  async suspendTenant(id: string, reason?: string): Promise<void> {
    await platformAxios.post(`/tenants/${id}/suspend`, { reason });
  },

  async unsuspendTenant(id: string): Promise<void> {
    await platformAxios.post(`/tenants/${id}/unsuspend`);
  },

  async deleteTenant(id: string): Promise<void> {
    await platformAxios.delete(`/tenants/${id}`);
  },

  async impersonateTenant(id: string): Promise<{ token: string }> {
    const { data } = await platformAxios.post(`/tenants/${id}/impersonate`);
    return data;
  },

  async getPendingApprovals(): Promise<TenantApproval[]> {
    const { data } = await platformAxios.get('/tenants', {
      params: { status: 'pending' },
    });
    return data.data || [];
  },
};
