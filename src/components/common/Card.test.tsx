/**
 * Tests for Card components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply default padding', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('p-4');
  });

  it('should apply small padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('p-3');
  });

  it('should apply large padding', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('p-6');
  });

  it('should apply no padding', () => {
    const { container } = render(<Card padding="none">Content</Card>);
    const card = container.firstChild;
    expect(card).not.toHaveClass('p-3');
    expect(card).not.toHaveClass('p-4');
    expect(card).not.toHaveClass('p-6');
  });

  it('should apply hover effect when hover prop is true', () => {
    const { container } = render(<Card hover={true}>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('should not apply hover effect by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).not.toHaveClass('hover:shadow-lg');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should have default styling', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('rounded-lg');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should have border bottom', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('border-b');
  });

  it('should have padding and margin', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('pb-4');
    expect(header).toHaveClass('mb-4');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardHeader className="custom">Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('custom');
  });
});

describe('CardTitle', () => {
  it('should render children', () => {
    render(<CardTitle>Title Text</CardTitle>);
    expect(screen.getByText('Title Text')).toBeInTheDocument();
  });

  it('should have heading styling', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    const title = container.firstChild;
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-gray-900');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardTitle className="custom">Title</CardTitle>);
    const title = container.firstChild;
    expect(title).toHaveClass('custom');
  });

  it('should render as h3 element', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector('h3')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Content Text</CardContent>);
    expect(screen.getByText('Content Text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<CardContent className="custom">Content</CardContent>);
    const content = container.firstChild;
    expect(content).toHaveClass('custom');
  });

  it('should render as div element', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should have border top', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('border-t');
  });

  it('should have padding and margin', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('pt-4');
    expect(footer).toHaveClass('mt-4');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardFooter className="custom">Footer</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('custom');
  });
});

describe('Card composition', () => {
  it('should render complete card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });
});
