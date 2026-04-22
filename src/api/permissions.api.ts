// src/api/permissions.api.ts

import axiosInstance from './axiosInstance';
import {
  BusinessMember,
  UpdatePermissionsDto,
} from '../types/permissions.types';

/**
 * API client for permission management operations
 */
export const permissionsApi = {
  /**
   * Update member permissions
   * @param businessId - The business ID
   * @param userId - The user ID to update permissions for
   * @param permissions - The new permission string
   * @returns The updated business member
   */
  async updateMemberPermissions(
    businessId: string,
    userId: string,
    permissions: string,
  ): Promise<BusinessMember> {
    const response = await axiosInstance.patch<BusinessMember>(
      `/businesses/${businessId}/members/${userId}/permissions`,
      { permissions } as UpdatePermissionsDto,
    );
    return response.data;
  },

  /**
   * Get business members (for fetching current permissions)
   * @param businessId - The business ID
   * @returns Array of business members
   */
  async getBusinessMembers(businessId: string): Promise<BusinessMember[]> {
    const response = await axiosInstance.get<BusinessMember[]>(
      `/businesses/${businessId}/members`,
    );
    return response.data;
  },

  /**
   * Get a specific business member
   * @param businessId - The business ID
   * @param userId - The user ID
   * @returns The business member
   */
  async getBusinessMember(
    businessId: string,
    userId: string,
  ): Promise<BusinessMember> {
    const response = await axiosInstance.get<BusinessMember>(
      `/businesses/${businessId}/members/${userId}`,
    );
    return response.data;
  },
};
