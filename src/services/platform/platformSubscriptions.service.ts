// src/services/platform/platformSubscriptions.service.ts
import { platformAxios } from './platformAxios';
import { Subscription, Plan, PaginatedResponse } from '@/types/console.types';

export const platformSubscriptionsService = {
  async listSubscriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
  }): Promise<PaginatedResponse<Subscription>> {
    const { data } = await platformAxios.get('/subscriptions', { params });
    return data;
  },

  async getSubscription(id: string): Promise<Subscription> {
    const { data } = await platformAxios.get(`/subscriptions/${id}`);
    return data;
  },

  async updateSubscription(
    id: string,
    updates: {
      plan_id?: string;
      status?: string;
      billing_cycle?: string;
      notes?: string;
    }
  ): Promise<Subscription> {
    const { data } = await platformAxios.patch(`/subscriptions/${id}`, updates);
    return data;
  },

  async cancelSubscription(id: string): Promise<void> {
    await platformAxios.post(`/subscriptions/${id}/cancel`);
  },

  async listPlans(): Promise<Plan[]> {
    const { data } = await platformAxios.get('/plans');
    return data;
  },

  async createPlan(plan: Partial<Plan>): Promise<Plan> {
    const { data } = await platformAxios.post('/plans', plan);
    return data;
  },

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data } = await platformAxios.patch(`/plans/${id}`, updates);
    return data;
  },

  async deletePlan(id: string): Promise<void> {
    await platformAxios.delete(`/plans/${id}`);
  },
};
