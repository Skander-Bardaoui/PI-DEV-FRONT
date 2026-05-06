import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionButton, ActionSection } from './ActionButton';
import { Plus } from 'lucide-react';

describe('ActionButton', () => {
  const mockOnClick = vi.fn();

  it('renders button with label and description', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
      />
    );
    
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByText('Create a new item')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        disabled
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        loading
      />
    );
    
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies primary variant styles by default', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-blue-50');
  });

  it('applies success variant styles', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        variant="success"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-green-50');
  });

  it('applies danger variant styles', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        variant="danger"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-red-50');
  });

  it('applies custom className', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('does not call onClick when disabled', () => {
    render(
      <ActionButton
        icon={Plus}
        label="Add Item"
        description="Create a new item"
        onClick={mockOnClick}
        disabled
      />
    );
    
    const button = screen.getByRole('button');
    // The button is disabled, so the browser prevents the click
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });
});

describe('ActionSection', () => {
  it('renders section with title and children', () => {
    render(
      <ActionSection title="Actions">
        <div>Child 1</div>
        <div>Child 2</div>
      </ActionSection>
    );
    
    // Title is rendered as "Actions" but displayed as "ACTIONS" via CSS uppercase
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(
      <ActionSection title="Actions">
        <div>Content</div>
      </ActionSection>
    );
    
    const section = container.firstChild;
    expect(section).toHaveClass('border-gray-100');
  });

  it('applies danger variant styles', () => {
    const { container } = render(
      <ActionSection title="Danger Actions" variant="danger">
        <div>Content</div>
      </ActionSection>
    );
    
    const section = container.firstChild;
    expect(section).toHaveClass('border-red-100');
  });

  it('renders title in uppercase', () => {
    const { container } = render(
      <ActionSection title="my actions">
        <div>Content</div>
      </ActionSection>
    );
    
    // Title is rendered as "my actions" but has uppercase CSS class
    expect(screen.getByText('my actions')).toBeInTheDocument();
    const titleElement = container.querySelector('.uppercase');
    expect(titleElement).toBeInTheDocument();
  });
});
