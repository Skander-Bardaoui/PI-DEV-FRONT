import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';

// Créer un QueryClient pour les tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper avec tous les providers nécessaires
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Matcher personnalisé pour les nombres formatés
export function matchFormattedNumber(expectedNumber: string) {
  return (content: string, element: Element | null) => {
    if (!element) return false;
    const text = element.textContent || '';
    // Accepte les espaces, virgules, points
    const normalized = text.replace(/[\s,]/g, '');
    const expected = expectedNumber.replace(/[\s,]/g, '');
    return normalized.includes(expected);
  };
}

// Mock standard pour useAuth
export const mockUseAuth = (overrides: any = {}) => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'BUSINESS_OWNER',
    business_id: 'test-business-id',
    ...overrides
  },
  loading: false,
  error: null,
});

// Mock standard pour useCurrentBusinessMember
export const mockUseCurrentBusinessMember = (overrides: any = {}) => ({
  businessMember: {
    id: 'test-member-id',
    user_id: 'test-user-id',
    business_id: 'test-business-id',
    role: 'OWNER',
    purchase_permissions: {
      create_supplier: true,
      update_supplier: true,
      delete_supplier: true,
      invite_supplier: true,
      create_po: true,
      update_po: true,
      delete_po: true,
      ...(overrides.purchase_permissions || {})
    },
    sales_permissions: {
      create_client: true,
      update_client: true,
      delete_client: true,
      ...(overrides.sales_permissions || {})
    },
    ...overrides
  },
  loading: false,
  error: null,
});

export * from '@testing-library/react';
