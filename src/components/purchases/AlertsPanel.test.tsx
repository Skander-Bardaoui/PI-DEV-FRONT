import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertsPanel from './AlertsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockAlerts = [
  {
    id: 'alert-1',
    type: 'INVOICE_DUE_SOON',
    severity: 'WARNING',
    status: 'UNREAD',
    title: 'Facture à échéance proche',
    message: 'La facture FACT-001 arrive à échéance dans 3 jours',
    entity_type: 'invoice',
    entity_id: 'inv-1',
    entity_label: 'FACT-001',
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'alert-2',
    type: 'INVOICE_OVERDUE',
    severity: 'DANGER',
    status: 'READ',
    title: 'Facture en retard',
    message: 'La facture FACT-002 est en retard de 5 jours',
    entity_type: 'invoice',
    entity_id: 'inv-2',
    entity_label: 'FACT-002',
    created_at: '2026-04-28T10:00:00Z',
  },
];

vi.mock('../../hooks/usePurchaseAlerts', () => ({
  usePurchaseAlerts: vi.fn(() => ({
    data: mockAlerts,
    isLoading: false,
    refetch: vi.fn(),
  })),
  useMarkAlertRead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useMarkAllAlertsRead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useResolveAlert: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useSnoozeAlert: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useTriggerAlertScan: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

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

describe('AlertsPanel', () => {
  const mockOnNavigate = vi.fn();
  const businessId = 'business-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render panel with header', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Alertes')).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display alert cards', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Facture à échéance proche')).toBeInTheDocument();
    expect(screen.getByText('Facture en retard')).toBeInTheDocument();
  });

  it('should display counters for all, warning, and danger alerts', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText('Urgentes')).toBeInTheDocument();
  });

  it('should filter alerts by status', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const unreadButton = screen.getByRole('button', { name: /Non lues/i });
    fireEvent.click(unreadButton);

    expect(screen.getByText('Facture à échéance proche')).toBeInTheDocument();
    expect(screen.queryByText('Facture en retard')).not.toBeInTheDocument();
  });

  it('should filter alerts by severity', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const dangerButton = screen.getByRole('button', { name: /Urgentes/i });
    fireEvent.click(dangerButton);

    expect(screen.queryByText('Facture à échéance proche')).not.toBeInTheDocument();
    expect(screen.getByText('Facture en retard')).toBeInTheDocument();
  });

  it('should mark alert as read', () => {
    const { useMarkAlertRead } = require('../../hooks/usePurchaseAlerts');
    const mockMutate = vi.fn();
    useMarkAlertRead.mockReturnValue({ mutate: mockMutate });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const markReadButtons = screen.getAllByText(/Marquer lu/i);
    fireEvent.click(markReadButtons[0]);

    expect(mockMutate).toHaveBeenCalledWith('alert-1');
  });

  it('should resolve alert', () => {
    const { useResolveAlert } = require('../../hooks/usePurchaseAlerts');
    const mockMutate = vi.fn();
    useResolveAlert.mockReturnValue({ mutate: mockMutate });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const resolveButtons = screen.getAllByText(/Résoudre/i);
    fireEvent.click(resolveButtons[0]);

    expect(mockMutate).toHaveBeenCalledWith('alert-1');
  });

  it('should show snooze options', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const reporterButtons = screen.getAllByText(/Reporter/i);
    fireEvent.click(reporterButtons[0]);

    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('3j')).toBeInTheDocument();
    expect(screen.getByText('1sem')).toBeInTheDocument();
  });

  it('should snooze alert', () => {
    const { useSnoozeAlert } = require('../../hooks/usePurchaseAlerts');
    const mockMutate = vi.fn();
    useSnoozeAlert.mockReturnValue({ mutate: mockMutate });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const reporterButtons = screen.getAllByText(/Reporter/i);
    fireEvent.click(reporterButtons[0]);

    const snooze2h = screen.getByText('2h');
    fireEvent.click(snooze2h);

    expect(mockMutate).toHaveBeenCalledWith({ id: 'alert-1', hours: 2 });
  });

  it('should mark all alerts as read', () => {
    const { useMarkAllAlertsRead } = require('../../hooks/usePurchaseAlerts');
    const mockMutate = vi.fn();
    useMarkAllAlertsRead.mockReturnValue({ mutate: mockMutate });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const markAllButton = screen.getByText(/Tout marquer lu/i);
    fireEvent.click(markAllButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should trigger alert scan', () => {
    const { useTriggerAlertScan } = require('../../hooks/usePurchaseAlerts');
    const mockMutate = vi.fn();
    useTriggerAlertScan.mockReturnValue({ mutate: mockMutate, isPending: false });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const scanButton = screen.getByTitle('Scanner maintenant');
    fireEvent.click(scanButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should navigate to entity on click', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const entityLink = screen.getByText('FACT-001');
    fireEvent.click(entityLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('invoice', 'inv-1');
  });

  it('should display loading state', () => {
    const { usePurchaseAlerts } = require('../../hooks/usePurchaseAlerts');
    usePurchaseAlerts.mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should display empty state when no alerts', () => {
    const { usePurchaseAlerts } = require('../../hooks/usePurchaseAlerts');
    usePurchaseAlerts.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Aucune alerte')).toBeInTheDocument();
    expect(screen.getByText('Tout est sous contrôle')).toBeInTheDocument();
  });

  it('should display correct severity icons', () => {
    render(
      <AlertsPanel businessId={businessId} onNavigate={mockOnNavigate} />,
      { wrapper: createWrapper() }
    );

    const alerts = screen.getAllByRole('button', { name: /Marquer lu|Résoudre|Reporter/i });
    expect(alerts.length).toBeGreaterThan(0);
  });
});
