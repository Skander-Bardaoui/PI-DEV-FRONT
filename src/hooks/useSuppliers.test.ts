import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers } from './useSuppliers';
import axiosInstance from '@/api/axiosInstance';

// Mock axios
vi.mock('@/api/axiosInstance');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSuppliers', () => {
  const mockBusinessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetSuppliers', () => {
    it('should fetch suppliers successfully', async () => {
      const mockSuppliers = {
        data: [
          {
            id: '1',
            name: 'Supplier 1',
            email: 'supplier1@test.com',
            is_active: true,
          },
          {
            id: '2',
            name: 'Supplier 2',
            email: 'supplier2@test.com',
            is_active: true,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockSuppliers,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useGetSuppliers({}),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSuppliers);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers`,
        expect.any(Object),
      );
    });

    it('should handle error when fetching suppliers', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(mockError);

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useGetSuppliers({}),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should filter suppliers by search term', async () => {
      const searchTerm = 'Test';
      const mockSuppliers = {
        data: [
          {
            id: '1',
            name: 'Test Supplier',
            email: 'test@supplier.com',
            is_active: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockSuppliers,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useGetSuppliers({ search: searchTerm }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers`,
        expect.objectContaining({
          params: expect.objectContaining({ search: searchTerm }),
        }),
      );
    });
  });

  describe('useGetSupplier', () => {
    it('should fetch a single supplier by id', async () => {
      const supplierId = 'supplier-123';
      const mockSupplier = {
        id: supplierId,
        name: 'Test Supplier',
        email: 'test@supplier.com',
        phone: '123456789',
        is_active: true,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockSupplier,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useGetSupplier(supplierId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSupplier);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers/${supplierId}`,
      );
    });

    it('should not fetch if supplierId is not provided', () => {
      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useGetSupplier(''),
        { wrapper: createWrapper() },
      );

      expect(result.current.data).toBeUndefined();
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateSupplier', () => {
    it('should create a supplier successfully', async () => {
      const newSupplier = {
        name: 'New Supplier',
        email: 'new@supplier.com',
        phone: '987654321',
      };

      const createdSupplier = {
        id: 'new-id',
        ...newSupplier,
        is_active: true,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: createdSupplier,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useCreateSupplier(),
        { wrapper: createWrapper() },
      );

      result.current.mutate(newSupplier);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers`,
        newSupplier,
      );
    });
  });

  describe('useUpdateSupplier', () => {
    it('should update a supplier successfully', async () => {
      const supplierId = 'supplier-123';
      const updateData = {
        name: 'Updated Supplier',
        email: 'updated@supplier.com',
      };

      const updatedSupplier = {
        id: supplierId,
        ...updateData,
        is_active: true,
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: updatedSupplier,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useUpdateSupplier(),
        { wrapper: createWrapper() },
      );

      result.current.mutate({ id: supplierId, data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers/${supplierId}`,
        updateData,
      );
    });
  });

  describe('useArchiveSupplier', () => {
    it('should archive a supplier successfully', async () => {
      const supplierId = 'supplier-123';
      const response = { message: 'Supplier archived successfully' };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: response,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useArchiveSupplier(),
        { wrapper: createWrapper() },
      );

      result.current.mutate(supplierId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers/${supplierId}/archive`,
      );
    });
  });

  describe('useRestoreSupplier', () => {
    it('should restore an archived supplier successfully', async () => {
      const supplierId = 'supplier-123';
      const restoredSupplier = {
        id: supplierId,
        name: 'Restored Supplier',
        is_active: true,
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: restoredSupplier,
      });

      const { result } = renderHook(
        () => useSuppliers(mockBusinessId).useRestoreSupplier(),
        { wrapper: createWrapper() },
      );

      result.current.mutate(supplierId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/businesses/${mockBusinessId}/suppliers/${supplierId}/restore`,
      );
    });
  });
});
