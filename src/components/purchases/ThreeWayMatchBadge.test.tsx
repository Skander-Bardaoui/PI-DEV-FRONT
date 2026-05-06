import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreeWayMatchBadge from './ThreeWayMatchBadge';

describe('ThreeWayMatchBadge', () => {
  it('should render MATCHED status', () => {
    render(<ThreeWayMatchBadge status="MATCHED" />);

    expect(screen.getByText('Rapproché')).toBeInTheDocument();
  });

  it('should render PARTIAL_MATCH status', () => {
    render(<ThreeWayMatchBadge status="PARTIAL_MATCH" />);

    expect(screen.getByText('Partiel')).toBeInTheDocument();
  });

  it('should render MISMATCH status', () => {
    render(<ThreeWayMatchBadge status="MISMATCH" />);

    expect(screen.getByText('Écart détecté')).toBeInTheDocument();
  });

  it('should render MISSING_PO status', () => {
    render(<ThreeWayMatchBadge status="MISSING_PO" />);

    expect(screen.getByText('Sans BC')).toBeInTheDocument();
  });

  it('should render MISSING_GR status', () => {
    render(<ThreeWayMatchBadge status="MISSING_GR" />);

    expect(screen.getByText('Sans réception')).toBeInTheDocument();
  });

  it('should render OVER_INVOICED status', () => {
    render(<ThreeWayMatchBadge status="OVER_INVOICED" />);

    expect(screen.getByText('Sur-facturé')).toBeInTheDocument();
  });

  it('should render UNDER_INVOICED status', () => {
    render(<ThreeWayMatchBadge status="UNDER_INVOICED" />);

    expect(screen.getByText('Sous-facturé')).toBeInTheDocument();
  });

  it('should apply correct styles for MATCHED status', () => {
    const { container } = render(<ThreeWayMatchBadge status="MATCHED" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ background: '#EAF3DE', color: '#3B6D11' });
  });

  it('should apply correct styles for MISMATCH status', () => {
    const { container } = render(<ThreeWayMatchBadge status="MISMATCH" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ background: '#FCEBEB', color: '#A32D2D' });
  });

  it('should display status dot', () => {
    const { container } = render(<ThreeWayMatchBadge status="MATCHED" />);

    const dot = container.querySelector('span span');
    expect(dot).toHaveStyle({ width: '6px', height: '6px', borderRadius: '50%' });
  });

  it('should have inline-flex display', () => {
    const { container } = render(<ThreeWayMatchBadge status="MATCHED" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ display: 'inline-flex' });
  });

  it('should have correct font size and weight', () => {
    const { container } = render(<ThreeWayMatchBadge status="MATCHED" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ fontSize: '11px', fontWeight: '500' });
  });
});
