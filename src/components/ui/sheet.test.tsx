import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './sheet';

// Mock Radix UI Dialog (Sheet uses Dialog primitives)
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: any) => <div data-testid="sheet-root">{children}</div>,
  Trigger: ({ children }: any) => <button>{children}</button>,
  Portal: ({ children }: any) => <div data-testid="sheet-portal">{children}</div>,
  Overlay: ({ ...props }: any) => <div data-testid="sheet-overlay" {...props} />,
  Content: ({ children, ...props }: any) => <div data-testid="sheet-content" {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 data-testid="sheet-title" {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p data-testid="sheet-description" {...props}>{children}</p>,
  Close: ({ children }: any) => <button data-testid="sheet-close">{children}</button>,
}));

describe('Sheet Components', () => {
  it('renders sheet with content', () => {
    render(
      <Sheet>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Body</div>
          <SheetFooter>
            <button>Close</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
    
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Body')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <Sheet>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    
    expect(screen.getByTestId('sheet-close')).toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    render(
      <Sheet>
        <SheetContent className="custom-content">
          <SheetHeader className="custom-header">
            <SheetTitle className="custom-title">Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    
    const content = screen.getByTestId('sheet-content');
    expect(content).toHaveClass('custom-content');
  });

  it('renders sheet with different sides', () => {
    const { rerender } = render(
      <Sheet>
        <SheetContent side="right">Content</SheetContent>
      </Sheet>
    );
    
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    
    rerender(
      <Sheet>
        <SheetContent side="left">Content</SheetContent>
      </Sheet>
    );
    
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
  });
});
