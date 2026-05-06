/**
 * Tests for PresenceIndicator component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PresenceIndicator } from './PresenceIndicator';

describe('PresenceIndicator', () => {
  it('should render online indicator', () => {
    const { container } = render(<PresenceIndicator isOnline={true} />);
    
    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('should render offline indicator', () => {
    const { container } = render(<PresenceIndicator isOnline={false} />);
    
    const indicator = container.querySelector('.bg-gray-400');
    expect(indicator).toBeInTheDocument();
  });

  it('should show label when showLabel is true', () => {
    render(<PresenceIndicator isOnline={true} showLabel={true} />);
    
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show offline label when offline', () => {
    render(<PresenceIndicator isOnline={false} showLabel={true} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should not show label by default', () => {
    render(<PresenceIndicator isOnline={true} />);
    
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('should render small size', () => {
    const { container } = render(<PresenceIndicator isOnline={true} size="sm" />);
    
    const indicator = container.querySelector('.w-2.h-2');
    expect(indicator).toBeInTheDocument();
  });

  it('should render medium size by default', () => {
    const { container } = render(<PresenceIndicator isOnline={true} />);
    
    const indicator = container.querySelector('.w-3.h-3');
    expect(indicator).toBeInTheDocument();
  });

  it('should render large size', () => {
    const { container } = render(<PresenceIndicator isOnline={true} size="lg" />);
    
    const indicator = container.querySelector('.w-4.h-4');
    expect(indicator).toBeInTheDocument();
  });

  it('should show ping animation when online', () => {
    const { container } = render(<PresenceIndicator isOnline={true} />);
    
    const pingAnimation = container.querySelector('.animate-ping');
    expect(pingAnimation).toBeInTheDocument();
  });

  it('should not show ping animation when offline', () => {
    const { container } = render(<PresenceIndicator isOnline={false} />);
    
    const pingAnimation = container.querySelector('.animate-ping');
    expect(pingAnimation).not.toBeInTheDocument();
  });
});
