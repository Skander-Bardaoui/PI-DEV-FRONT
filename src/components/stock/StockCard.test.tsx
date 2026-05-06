/**
 * Tests for StockCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockCard from './StockCard';
import { Package } from 'lucide-react';

describe('StockCard', () => {
  const defaultProps = {
    title: 'Total Products',
    value: 150,
    icon: Package,
    color: 'indigo' as const,
  };

  it('should render card with title and value', () => {
    render(<StockCard {...defaultProps} />);
    
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render icon with correct color', () => {
    const { container } = render(<StockCard {...defaultProps} />);
    
    const iconContainer = container.querySelector('.bg-indigo-100');
    expect(iconContainer).toBeInTheDocument();
    
    const icon = container.querySelector('.text-indigo-600');
    expect(icon).toBeInTheDocument();
  });

  it('should display change and trend when provided', () => {
    render(
      <StockCard
        {...defaultProps}
        change="+12%"
        trend="up"
      />
    );
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toHaveClass('text-green-600');
  });

  it('should display red color for down trend', () => {
    render(
      <StockCard
        {...defaultProps}
        change="-5%"
        trend="down"
      />
    );
    
    expect(screen.getByText('-5%')).toHaveClass('text-red-600');
  });

  it('should display subtitle when provided', () => {
    render(
      <StockCard
        {...defaultProps}
        subtitle="Last updated 5 min ago"
      />
    );
    
    expect(screen.getByText('Last updated 5 min ago')).toBeInTheDocument();
  });

  it('should apply red color scheme', () => {
    const { container } = render(
      <StockCard {...defaultProps} color="red" />
    );
    
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).toBeInTheDocument();
  });

  it('should apply yellow color scheme', () => {
    const { container } = render(
      <StockCard {...defaultProps} color="yellow" />
    );
    
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
  });

  it('should apply green color scheme', () => {
    const { container } = render(
      <StockCard {...defaultProps} color="green" />
    );
    
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    expect(container.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('should apply emerald color scheme', () => {
    const { container } = render(
      <StockCard {...defaultProps} color="emerald" />
    );
    
    expect(container.querySelector('.bg-emerald-100')).toBeInTheDocument();
    expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
  });

  it('should render with string value', () => {
    render(
      <StockCard {...defaultProps} value="1,234" />
    );
    
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<StockCard {...defaultProps} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'p-6', 'border', 'border-gray-200');
  });

  it('should not display change when not provided', () => {
    const { container } = render(<StockCard {...defaultProps} />);
    
    const changeElement = container.querySelector('.text-green-600, .text-red-600');
    expect(changeElement).not.toBeInTheDocument();
  });

  it('should not display subtitle when not provided', () => {
    render(<StockCard {...defaultProps} />);
    
    const subtitles = screen.queryAllByText(/ago|updated/i);
    expect(subtitles.length).toBe(0);
  });
});
