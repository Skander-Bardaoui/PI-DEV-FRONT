import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock scroll-area component since it uses Radix UI
vi.mock('@radix-ui/react-scroll-area', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="scroll-area-root" {...props}>{children}</div>,
  Viewport: ({ children, ...props }: any) => <div data-testid="scroll-area-viewport" {...props}>{children}</div>,
  ScrollAreaScrollbar: ({ children, ...props }: any) => <div data-testid="scroll-area-scrollbar" {...props}>{children}</div>,
  ScrollAreaThumb: ({ ...props }: any) => <div data-testid="scroll-area-thumb" {...props} />,
  Corner: ({ ...props }: any) => <div data-testid="scroll-area-corner" {...props} />,
}));

describe('ScrollArea', () => {
  it('renders scroll area component', async () => {
    const { ScrollArea } = await import('./scroll-area');
    
    render(
      <ScrollArea>
        <div>Scrollable Content</div>
      </ScrollArea>
    );
    
    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
  });

  it('applies custom className', async () => {
    const { ScrollArea } = await import('./scroll-area');
    
    render(
      <ScrollArea className="custom-scroll">
        <div>Content</div>
      </ScrollArea>
    );
    
    const scrollArea = screen.getByTestId('scroll-area-root');
    expect(scrollArea).toHaveClass('custom-scroll');
  });
});
