import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from './select';

// Mock Radix UI Select
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children }: any) => <div data-testid="select-root">{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="select-trigger" {...props}>{children}</button>,
  Value: ({ ...props }: any) => <span data-testid="select-value" {...props} />,
  Icon: ({ children }: any) => <span>{children}</span>,
  Portal: ({ children }: any) => <div data-testid="select-portal">{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="select-content" {...props}>{children}</div>,
  Viewport: ({ children }: any) => <div data-testid="select-viewport">{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="select-item" {...props}>{children}</div>,
  ItemText: ({ children }: any) => <span>{children}</span>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  Label: ({ children, ...props }: any) => <div data-testid="select-label" {...props}>{children}</div>,
  Separator: ({ ...props }: any) => <div data-testid="select-separator" {...props} />,
  ScrollUpButton: ({ children }: any) => <div data-testid="scroll-up">{children}</div>,
  ScrollDownButton: ({ children }: any) => <div data-testid="scroll-down">{children}</div>,
  Group: ({ children }: any) => <div>{children}</div>,
}));

describe('Select Components', () => {
  it('renders select with trigger and content', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(screen.getByTestId('select-root')).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders select with label and separator', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Group Label</SelectLabel>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(screen.getByText('Group Label')).toBeInTheDocument();
    expect(screen.getByTestId('select-separator')).toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectItem value="option1" className="custom-item">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(screen.getByTestId('select-trigger')).toHaveClass('custom-trigger');
    expect(screen.getByTestId('select-content')).toHaveClass('custom-content');
  });
});
