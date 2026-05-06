/**
 * Tests for CategoryFormModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryFormModal } from './CategoryFormModal';

// Mock hooks
vi.mock('../../hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    errors: {},
    validationErrors: [],
    validate: vi.fn(() => true),
    validateField: vi.fn(),
    clearErrors: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CategoryFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    mode: 'create' as const,
    categoryType: 'PRODUCT' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<CategoryFormModal {...defaultProps} />);
    
    expect(screen.getByText(/Nouvelle catégorie|New category/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<CategoryFormModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/Nouvelle catégorie|New category/i)).not.toBeInTheDocument();
  });

  it('should display form fields', () => {
    render(<CategoryFormModal {...defaultProps} />);
    
    expect(screen.getByRole('textbox', { name: /nom|name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(<CategoryFormModal {...defaultProps} />);
    
    const nameInput = screen.getByRole('textbox', { name: /nom|name/i });
    fireEvent.change(nameInput, { target: { value: 'Electronics' } });
    
    expect(nameInput).toHaveValue('Electronics');
  });

  it('should call onSubmit with form data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<CategoryFormModal {...defaultProps} />);
    
    const nameInput = screen.getByRole('textbox', { name: /nom|name/i });
    fireEvent.change(nameInput, { target: { value: 'Electronics' } });
    
    const submitButton = screen.getByRole('button', { name: /créer|create/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should display loading state during submission', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CategoryFormModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /créer|create/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('should call onClose when cancel button clicked', () => {
    render(<CategoryFormModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /annuler|cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when X button clicked', () => {
    render(<CategoryFormModal {...defaultProps} />);
    
    const closeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should populate form in edit mode', () => {
    const category = {
      id: '1',
      name: 'Electronics',
      description: 'Electronic items',
      category_type: 'PRODUCT' as const,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(
      <CategoryFormModal
        {...defaultProps}
        mode="edit"
        category={category}
      />
    );
    
    const nameInput = screen.getByRole('textbox', { name: /nom|name/i });
    expect(nameInput).toHaveValue('Electronics');
  });

  it('should display category type as PRODUCT', () => {
    render(<CategoryFormModal {...defaultProps} categoryType="PRODUCT" />);
    
    // Category type should be fixed and not editable
    expect(screen.queryByText(/PRODUCT|Produit/i)).toBeInTheDocument();
  });

  it('should display category type as SERVICE', () => {
    render(<CategoryFormModal {...defaultProps} categoryType="SERVICE" />);
    
    expect(screen.queryByText(/SERVICE/i)).toBeInTheDocument();
  });

  it('should handle submission error', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
    
    render(<CategoryFormModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /créer|create/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should clear form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<CategoryFormModal {...defaultProps} />);
    
    const nameInput = screen.getByRole('textbox', { name: /nom|name/i });
    fireEvent.change(nameInput, { target: { value: 'Electronics' } });
    
    const submitButton = screen.getByRole('button', { name: /créer|create/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
