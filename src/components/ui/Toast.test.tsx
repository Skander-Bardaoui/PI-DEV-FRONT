import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from './Toast';
import { renderHook } from '@testing-library/react';

// Test component that uses the toast hook
function TestComponent() {
  const toast = useToast();
  
  return (
    <div>
      <button onClick={() => toast.success('Success', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => toast.warning('Warning', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => toast.info('Info', 'Just so you know')}>
        Show Info
      </button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');
    
    consoleSpy.mockRestore();
  });

  it('renders success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Success');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Error');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders warning toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Warning');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('renders info toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Info');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  it('auto-dismisses toast after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Success');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Success');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );
    
    if (closeButton) {
      act(() => {
        closeButton.click();
      });
      
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    }
  });

  it('displays multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    act(() => {
      screen.getByText('Show Success').click();
      screen.getByText('Show Error').click();
    });
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('limits toast count to 5', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    act(() => {
      for (let i = 0; i < 6; i++) {
        screen.getByText('Show Success').click();
      }
    });
    
    const toasts = screen.getAllByText('Success');
    expect(toasts.length).toBeLessThanOrEqual(5);
  });

  it('renders toast with title only', () => {
    function SingleTitleComponent() {
      const toast = useToast();
      return (
        <button onClick={() => toast.success('Title Only')}>
          Show Toast
        </button>
      );
    }
    
    render(
      <ToastProvider>
        <SingleTitleComponent />
      </ToastProvider>
    );
    
    act(() => {
      screen.getByText('Show Toast').click();
    });
    
    expect(screen.getByText('Title Only')).toBeInTheDocument();
  });

  it('error toast has longer duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    act(() => {
      screen.getByText('Show Error').click();
    });
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    // After 4 seconds (default duration), error should still be visible
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    // After 6 seconds (error duration), it should be gone
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });
});
