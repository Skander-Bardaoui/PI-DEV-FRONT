import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
} from './dropdown-menu';

// Mock Radix UI DropdownMenu
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: any) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children }: any) => <button data-testid="dropdown-trigger">{children}</button>,
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="dropdown-content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="dropdown-item" {...props}>{children}</div>,
  Label: ({ children, ...props }: any) => <div data-testid="dropdown-label" {...props}>{children}</div>,
  Separator: ({ ...props }: any) => <div data-testid="dropdown-separator" {...props} />,
  CheckboxItem: ({ children, ...props }: any) => <div data-testid="dropdown-checkbox-item" {...props}>{children}</div>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  RadioItem: ({ children, ...props }: any) => <div data-testid="dropdown-radio-item" {...props}>{children}</div>,
  Group: ({ children }: any) => <div>{children}</div>,
  Sub: ({ children }: any) => <div>{children}</div>,
  SubTrigger: ({ children }: any) => <div data-testid="dropdown-sub-trigger">{children}</div>,
  SubContent: ({ children }: any) => <div data-testid="dropdown-sub-content">{children}</div>,
  RadioGroup: ({ children }: any) => <div>{children}</div>,
}));

describe('DropdownMenu Components', () => {
  it('renders dropdown menu with trigger and content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders dropdown with label and separator', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByText('Menu Label')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('renders checkbox items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByTestId('dropdown-checkbox-item')).toBeInTheDocument();
    expect(screen.getByText('Checkbox Item')).toBeInTheDocument();
  });

  it('renders radio items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioItem value="option1">
            Radio Item
          </DropdownMenuRadioItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByTestId('dropdown-radio-item')).toBeInTheDocument();
    expect(screen.getByText('Radio Item')).toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByTestId('dropdown-content')).toHaveClass('custom-content');
  });
});
