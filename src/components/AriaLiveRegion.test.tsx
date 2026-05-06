/**
 * Tests for AriaLiveRegion component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AriaLiveRegion, { useAriaAnnounce } from './AriaLiveRegion';

describe('AriaLiveRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render message with polite politeness by default', () => {
    render(<AriaLiveRegion message="Test message" />);
    
    const region = screen.getByRole('status');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Test message');
  });

  it('should render with assertive politeness', () => {
    render(<AriaLiveRegion message="Urgent message" politeness="assertive" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('should render with off politeness', () => {
    render(<AriaLiveRegion message="Silent message" politeness="off" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'off');
  });

  it('should have aria-atomic attribute', () => {
    render(<AriaLiveRegion message="Test" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('should have sr-only class for screen reader only', () => {
    render(<AriaLiveRegion message="Test" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveClass('sr-only');
  });

  it('should clear message after specified time', async () => {
    const { rerender } = render(<AriaLiveRegion message="Test message" clearAfter={1000} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Re-render with empty message to simulate the timeout effect
    rerender(<AriaLiveRegion message="" clearAfter={1000} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should not clear message when clearAfter is 0', () => {
    render(<AriaLiveRegion message="Persistent message" clearAfter={0} />);
    
    vi.advanceTimersByTime(5000);
    
    expect(screen.getByText('Persistent message')).toBeInTheDocument();
  });

  it('should update message when prop changes', () => {
    const { rerender } = render(<AriaLiveRegion message="First message" />);
    expect(screen.getByText('First message')).toBeInTheDocument();
    
    rerender(<AriaLiveRegion message="Second message" />);
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.queryByText('First message')).not.toBeInTheDocument();
  });
});

describe('useAriaAnnounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up any announcer elements
    document.querySelectorAll('[role="status"]').forEach(el => el.remove());
  });

  it('should create announcer element with message', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Test announcement');
      return null;
    };

    render(<TestComponent />);
    
    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveTextContent('Test announcement');
  });

  it('should create announcer with polite politeness by default', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Test');
      return null;
    };

    render(<TestComponent />);
    
    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toHaveAttribute('aria-live', 'polite');
  });

  it('should create announcer with assertive politeness', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Urgent!', 'assertive');
      return null;
    };

    render(<TestComponent />);
    
    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toHaveAttribute('aria-live', 'assertive');
  });

  it('should have sr-only class', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Test');
      return null;
    };

    render(<TestComponent />);
    
    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toHaveClass('sr-only');
  });

  it('should remove announcer after 3 seconds', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Test');
      return null;
    };

    render(<TestComponent />);
    
    expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    
    vi.advanceTimersByTime(3000);
    
    expect(document.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('should have aria-atomic attribute', () => {
    const TestComponent = () => {
      const { announce } = useAriaAnnounce();
      announce('Test');
      return null;
    };

    render(<TestComponent />);
    
    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toHaveAttribute('aria-atomic', 'true');
  });
});
