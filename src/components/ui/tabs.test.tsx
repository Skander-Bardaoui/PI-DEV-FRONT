import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// Mock Radix UI Tabs
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="tabs-root" {...props}>{children}</div>,
  List: ({ children, ...props }: any) => <div data-testid="tabs-list" role="tablist" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="tabs-trigger" role="tab" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="tabs-content" role="tabpanel" {...props}>{children}</div>,
}));

describe('Tabs Components', () => {
  it('renders tabs with triggers and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('renders tabs list with correct role', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toBeInTheDocument();
  });

  it('renders tab triggers with correct role', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
  });

  it('applies custom className to components', () => {
    render(
      <Tabs>
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByTestId('tabs-list')).toHaveClass('custom-list');
    expect(screen.getByText('Tab 1')).toHaveClass('custom-trigger');
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });
});
