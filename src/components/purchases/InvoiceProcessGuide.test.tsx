import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InvoiceProcessGuide } from './InvoiceProcessGuide';

describe('InvoiceProcessGuide', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render guide modal', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Guide de Gestion des Factures')).toBeInTheDocument();
    expect(screen.getByText('Comprendre le processus étape par étape')).toBeInTheDocument();
  });

  it('should display all process steps', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Réception de la facture')).toBeInTheDocument();
    expect(screen.getByText('Facture avec Commande - Vérification Automatique')).toBeInTheDocument();
    expect(screen.getByText('Facture sans Commande - Vérification Manuelle')).toBeInTheDocument();
    expect(screen.getByText('Si la vérification détecte un problème')).toBeInTheDocument();
    expect(screen.getByText('Paiement de la facture')).toBeInTheDocument();
  });

  it('should show three-way matching explanation', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Commande')).toBeInTheDocument();
    expect(screen.getByText('Réception')).toBeInTheDocument();
    expect(screen.getByText('Facture')).toBeInTheDocument();
  });

  it('should display problem resolution options', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Option 1 : Approuver malgré le problème')).toBeInTheDocument();
    expect(screen.getByText('Option 2 : Contacter le fournisseur')).toBeInTheDocument();
  });

  it('should show process summary', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Résumé du Processus')).toBeInTheDocument();
    expect(screen.getByText('Réception')).toBeInTheDocument();
    expect(screen.getByText('Contrôle / Vérification')).toBeInTheDocument();
    expect(screen.getByText('Approbation')).toBeInTheDocument();
    expect(screen.getByText('Paiement')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when "J\'ai compris" button is clicked', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    const understoodButton = screen.getByText('J\'ai compris');
    fireEvent.click(understoodButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display invoice with PO badge', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText('Avec Commande')).toBeInTheDocument();
    expect(screen.getByText('Sans Commande')).toBeInTheDocument();
  });

  it('should show automatic vs manual verification', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText(/compare automatiquement 3 documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Vérifiez manuellement puis approuvez/i)).toBeInTheDocument();
  });

  it('should display payment instructions', () => {
    render(<InvoiceProcessGuide onClose={mockOnClose} />);

    expect(screen.getByText(/Une fois approuvée, payez la facture/i)).toBeInTheDocument();
    expect(screen.getByText(/paiements partiels/i)).toBeInTheDocument();
  });
});
