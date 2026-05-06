import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThreeWayMatchingAIPanel } from './ThreeWayMatchingAIPanel';

describe('ThreeWayMatchingAIPanel', () => {
  const mockOnApprove = vi.fn();
  const mockOnDispute = vi.fn();
  const mockOnContactSupplier = vi.fn();

  const mockAnalysis = {
    confidence_score: 85,
    risk_level: 'LOW' as const,
    recommended_action: 'AUTO_APPROVE' as const,
    explanation: 'All amounts match perfectly. No discrepancies detected.',
    key_findings: [
      'Invoice amount matches PO',
      'Quantities received match invoice',
      'No price discrepancies',
    ],
    suggested_next_steps: [
      'Approve the invoice',
      'Process payment',
    ],
    dispute_category: null,
    estimated_resolution_time: '1 day',
  };

  it('should render AI analysis panel', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Analyse IA')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Confiance')).toBeInTheDocument();
  });

  it('should display risk level', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Niveau de Risque')).toBeInTheDocument();
    expect(screen.getByText('Risque Faible')).toBeInTheDocument();
  });

  it('should display recommended action', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Action Recommandée')).toBeInTheDocument();
    expect(screen.getByText('Approbation Automatique')).toBeInTheDocument();
  });

  it('should display explanation', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Explication')).toBeInTheDocument();
    expect(
      screen.getByText('All amounts match perfectly. No discrepancies detected.')
    ).toBeInTheDocument();
  });

  it('should display key findings', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Points Clés')).toBeInTheDocument();
    expect(screen.getByText('Invoice amount matches PO')).toBeInTheDocument();
    expect(screen.getByText('Quantities received match invoice')).toBeInTheDocument();
    expect(screen.getByText('No price discrepancies')).toBeInTheDocument();
  });

  it('should display suggested next steps', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Actions Suggérées')).toBeInTheDocument();
    expect(screen.getByText('Approve the invoice')).toBeInTheDocument();
    expect(screen.getByText('Process payment')).toBeInTheDocument();
  });

  it('should display estimated resolution time', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Délai estimé:')).toBeInTheDocument();
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('should show approve button for AUTO_APPROVE action', () => {
    render(
      <ThreeWayMatchingAIPanel
        analysis={mockAnalysis}
        onApprove={mockOnApprove}
      />
    );

    const approveButton = screen.getByText('Approuver');
    expect(approveButton).toBeInTheDocument();
  });

  it('should call onApprove when approve button is clicked', () => {
    render(
      <ThreeWayMatchingAIPanel
        analysis={mockAnalysis}
        onApprove={mockOnApprove}
      />
    );

    const approveButton = screen.getByText('Approuver');
    fireEvent.click(approveButton);

    expect(mockOnApprove).toHaveBeenCalled();
  });

  it('should show dispute button for AUTO_DISPUTE action', () => {
    const disputeAnalysis = {
      ...mockAnalysis,
      risk_level: 'HIGH' as const,
      recommended_action: 'AUTO_DISPUTE' as const,
    };

    render(
      <ThreeWayMatchingAIPanel
        analysis={disputeAnalysis}
        onDispute={mockOnDispute}
      />
    );

    const disputeButton = screen.getByText('Litige');
    expect(disputeButton).toBeInTheDocument();
  });

  it('should call onDispute when dispute button is clicked', () => {
    const disputeAnalysis = {
      ...mockAnalysis,
      recommended_action: 'AUTO_DISPUTE' as const,
    };

    render(
      <ThreeWayMatchingAIPanel
        analysis={disputeAnalysis}
        onDispute={mockOnDispute}
      />
    );

    const disputeButton = screen.getByText('Litige');
    fireEvent.click(disputeButton);

    expect(mockOnDispute).toHaveBeenCalled();
  });

  it('should show contact supplier button', () => {
    render(
      <ThreeWayMatchingAIPanel
        analysis={mockAnalysis}
        onContactSupplier={mockOnContactSupplier}
      />
    );

    const contactButton = screen.getByText('Contacter');
    expect(contactButton).toBeInTheDocument();
  });

  it('should call onContactSupplier when contact button is clicked', () => {
    render(
      <ThreeWayMatchingAIPanel
        analysis={mockAnalysis}
        onContactSupplier={mockOnContactSupplier}
      />
    );

    const contactButton = screen.getByText('Contacter');
    fireEvent.click(contactButton);

    expect(mockOnContactSupplier).toHaveBeenCalled();
  });

  it('should display dispute category when present', () => {
    const analysisWithDispute = {
      ...mockAnalysis,
      dispute_category: 'PRICE_DISCREPANCY',
    };

    render(<ThreeWayMatchingAIPanel analysis={analysisWithDispute} />);

    expect(screen.getByText('Catégorie de Litige')).toBeInTheDocument();
    expect(screen.getByText('Écart de prix unitaire')).toBeInTheDocument();
  });

  it('should show high risk level correctly', () => {
    const highRiskAnalysis = {
      ...mockAnalysis,
      risk_level: 'HIGH' as const,
      confidence_score: 45,
    };

    render(<ThreeWayMatchingAIPanel analysis={highRiskAnalysis} />);

    expect(screen.getByText('Risque Élevé')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should show critical risk level correctly', () => {
    const criticalRiskAnalysis = {
      ...mockAnalysis,
      risk_level: 'CRITICAL' as const,
    };

    render(<ThreeWayMatchingAIPanel analysis={criticalRiskAnalysis} />);

    expect(screen.getByText('Risque Critique')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(
      <ThreeWayMatchingAIPanel
        analysis={mockAnalysis}
        onApprove={mockOnApprove}
        loading={true}
      />
    );

    const approveButton = screen.getByText('Approuver');
    expect(approveButton).toBeDisabled();
  });

  it('should show confidence progress bar', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('should display Gemini AI badge', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('should show footer note', () => {
    render(<ThreeWayMatchingAIPanel analysis={mockAnalysis} />);

    expect(
      screen.getByText(/Analyse générée par/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/En cas de doute, privilégiez la revue manuelle/)
    ).toBeInTheDocument();
  });
});
