import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

// Mock Radix UI Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: any) => <div data-testid="dialog-root">{children}</div>,
  Trigger: ({ children }: any) => <button>{children}</button>,
  Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ children, ...props }: any) => <div data-testid="dialog-overlay" {...props}>{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 data-testid="dialog-title" {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p data-testid="dialog-description" {...props}>{children}</p>,
  Close: ({ children }: any) => <button data-testid="dialog-close">{children}</button>,
}));

describe('Dialog Components', () => {
  it('renders dialog with content', () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Body')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    render(
      <Dialog>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('custom-content');
  });
});
