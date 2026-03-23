// src/types/tenant.types.ts

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings?: Record<string, any>;
  status: TenantStatus;
  ownerId: string;
  billingPlan?: string;
  contactEmail?: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantDto {
  name?: string;
  domain?: string;
  settings?: Record<string, any>;
  status?: TenantStatus;
  billingPlan?: string;
  contactEmail?: string;
  logoUrl?: string;
  description?: string;
}
