import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentStatusScreen } from './PaymentStatusScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe('PaymentStatusScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders active subscription status', () => {
    renderWithRouter(<PaymentStatusScreen status="active" />);
    
    expect(screen.getByText('Subscription Active')).toBeInTheDocument();
    expect(screen.getByText(/Your subscription is already active/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
  });

  it('navigates to login on active status button click', () => {
    renderWithRouter(<PaymentStatusScreen status="active" />);
    
    const button = screen.getByText('Go to Login');
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders suspended subscription status', () => {
    renderWithRouter(<PaymentStatusScreen status="suspended" />);
    
    expect(screen.getByText('Subscription Suspended')).toBeInTheDocument();
    expect(screen.getByText(/Your subscription has been suspended/i)).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('opens email client on suspended status button click', () => {
    const originalLocation = window.location.href;
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    renderWithRouter(<PaymentStatusScreen status="suspended" />);
    
    const button = screen.getByText('Contact Support');
    fireEvent.click(button);
    
    expect(window.location.href).toBe('mailto:support@noventra.com');
    
    window.location.href = originalLocation;
  });

  it('renders cancelled subscription status', () => {
    renderWithRouter(<PaymentStatusScreen status="cancelled" />);
    
    expect(screen.getByText('Subscription Cancelled')).toBeInTheDocument();
    expect(screen.getByText(/Your subscription has been cancelled/i)).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('renders invalid payment link status for unknown status', () => {
    renderWithRouter(<PaymentStatusScreen status="unknown" />);
    
    expect(screen.getByText('Invalid Payment Link')).toBeInTheDocument();
    expect(screen.getByText(/This payment link is no longer valid/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('navigates to home on invalid status button click', () => {
    renderWithRouter(<PaymentStatusScreen status="invalid" />);
    
    const button = screen.getByText('Go to Home');
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays appropriate icons for each status', () => {
    const { rerender } = renderWithRouter(<PaymentStatusScreen status="active" />);
    expect(screen.getByText('Subscription Active')).toBeInTheDocument();
    
    rerender(<BrowserRouter><PaymentStatusScreen status="suspended" /></BrowserRouter>);
    expect(screen.getByText('Subscription Suspended')).toBeInTheDocument();
    
    rerender(<BrowserRouter><PaymentStatusScreen status="cancelled" /></BrowserRouter>);
    expect(screen.getByText('Subscription Cancelled')).toBeInTheDocument();
    
    rerender(<BrowserRouter><PaymentStatusScreen status="invalid" /></BrowserRouter>);
    expect(screen.getByText('Invalid Payment Link')).toBeInTheDocument();
  });
});
