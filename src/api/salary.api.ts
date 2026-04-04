// src/api/salary.api.ts
import axiosInstance from './axiosInstance';

export interface SalaryMember {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    avatarUrl?: string;
    role: string;
  };
}

export interface SendProposalPayload {
  userId: string;
  amount: number;
  currency: string;
  message?: string;
  businessName: string;
}

export const salaryApi = {
  getMembers: async (businessId: string): Promise<SalaryMember[]> => {
    const res = await axiosInstance.get(`/salary/${businessId}/members`);
    return res.data;
  },

  sendProposal: async (
    businessId: string,
    payload: SendProposalPayload,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axiosInstance.post(`/salary/${businessId}/propose`, payload);
    return res.data;
  },
};
