import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AiPOGeneratorModal from './AiPOGeneratorModal';
import axiosInstance from '../../api/axiosInstance';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/axiosInstance');

const mockAxios = axiosInstance as any;

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

describe('AiPOGeneratorModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with header and examples', () => {
    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Assistant IA - Création de BC')).toBeInTheDocument();
    expect(screen.getByText('Décrivez votre commande en langage naturel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Commander 500 kg de farine/)).toBeInTheDocument();
  });

  it('should display example buttons and populate textarea on click', () => {
    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const exampleButton = screen.getByText(/Commander 500 kg de farine/);
    fireEvent.click(exampleButton);

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Commander 500 kg de farine');
  });

  it('should handle text input changes', () => {
    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test commande' } });

    expect(textarea).toHaveValue('Test commande');
  });

  it('should submit form and generate PO successfully', async () => {
    const mockGeneratedPO = {
      supplier_id: 'supplier-1',
      supplier_name: 'Ali Boulangerie',
      delivery_date: '2026-04-15',
      items: [
        {
          description: 'Farine',
          quantity: 500,
          unit_price_ht: 2.5,
          tax_rate_value: 19,
        },
      ],
      notes: 'Commande urgente',
      confidence: 95,
    };

    mockAxios.post.mockResolvedValueOnce({ data: mockGeneratedPO });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Commander 500 kg de farine chez Ali Boulangerie' } });

    const submitButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        `/businesses/${businessId}/supplier-pos/generate-from-text`,
        { text: 'Commander 500 kg de farine chez Ali Boulangerie' }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('BC généré avec succès !')).toBeInTheDocument();
      expect(screen.getByText('Ali Boulangerie')).toBeInTheDocument();
      expect(screen.getByText(/95%/)).toBeInTheDocument();
    });
  });

  it('should display error message on generation failure', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Service temporairement indisponible' },
      },
    });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test commande' } });

    const submitButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Service temporairement indisponible/)).toBeInTheDocument();
    });
  });

  it('should handle 503 error with specific message', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 503,
        data: { message: 'Service unavailable' },
      },
    });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const submitButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/intelligence artificielle est temporairement surchargée/)).toBeInTheDocument();
    });
  });

  it('should create PO from generated result', async () => {
    const mockGeneratedPO = {
      supplier_id: 'supplier-1',
      supplier_name: 'Ali Boulangerie',
      delivery_date: '2026-04-15',
      items: [
        {
          description: 'Farine',
          quantity: 500,
          unit_price_ht: 2.5,
          tax_rate_value: 19,
        },
      ],
      notes: 'Commande urgente',
      confidence: 95,
    };

    mockAxios.post
      .mockResolvedValueOnce({ data: mockGeneratedPO })
      .mockResolvedValueOnce({ data: { id: 'po-123' } });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Commander 500 kg de farine' } });

    const generateButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('BC généré avec succès !')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        `/businesses/${businessId}/supplier-pos`,
        expect.objectContaining({
          supplier_id: 'supplier-1',
          delivery_date: '2026-04-15',
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should allow modifying generated PO', async () => {
    const mockGeneratedPO = {
      supplier_id: 'supplier-1',
      supplier_name: 'Ali Boulangerie',
      delivery_date: '2026-04-15',
      items: [
        {
          description: 'Farine',
          quantity: 500,
          unit_price_ht: 2.5,
          tax_rate_value: 19,
        },
      ],
      notes: 'Commande urgente',
      confidence: 95,
    };

    mockAxios.post.mockResolvedValueOnce({ data: mockGeneratedPO });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const generateButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('BC généré avec succès !')).toBeInTheDocument();
    });

    const modifyButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(modifyButton);

    await waitFor(() => {
      expect(screen.queryByText('BC généré avec succès !')).not.toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state during generation', async () => {
    mockAxios.post.mockImplementation(() => new Promise(() => {}));

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const submitButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Génération en cours/)).toBeInTheDocument();
    });
  });

  it('should calculate totals correctly', async () => {
    const mockGeneratedPO = {
      supplier_id: 'supplier-1',
      supplier_name: 'Ali Boulangerie',
      delivery_date: '2026-04-15',
      items: [
        {
          description: 'Farine',
          quantity: 100,
          unit_price_ht: 10,
          tax_rate_value: 19,
        },
        {
          description: 'Sucre',
          quantity: 50,
          unit_price_ht: 5,
          tax_rate_value: 7,
        },
      ],
      notes: '',
      confidence: 90,
    };

    mockAxios.post.mockResolvedValueOnce({ data: mockGeneratedPO });

    render(
      <AiPOGeneratorModal
        businessId={businessId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Commander 500 kg de farine/);
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const submitButton = screen.getByRole('button', { name: /Créer le BC/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Total HT/)).toBeInTheDocument();
      expect(screen.getByText(/Total TVA/)).toBeInTheDocument();
      expect(screen.getByText(/Total TTC/)).toBeInTheDocument();
    });
  });
});
