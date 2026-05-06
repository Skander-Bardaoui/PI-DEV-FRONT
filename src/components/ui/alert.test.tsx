/**
 * Tests for Alert components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('should render children', () => {
    render(<Alert>Test Alert</Alert>);
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('should have role="alert"', () => {
    render(<Alert>Alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    const { container } = render(<Alert>Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-background');
  });

  it('should apply destructive variant', () => {
    const { container } = render(<Alert variant="destructive">Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('border-destructive/50');
  });

  it('should apply custom className', () => {
    const { container } = render(<Alert className="custom-class">Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('custom-class');
  });

  it('should have rounded corners', () => {
    const { container } = render(<Alert>Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('rounded-lg');
  });

  it('should have border', () => {
    const { container } = render(<Alert>Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('border');
  });

  it('should have padding', () => {
    const { container } = render(<Alert>Alert</Alert>);
    const alert = container.firstChild;
    expect(alert).toHaveClass('p-4');
  });
});

describe('AlertTitle', () => {
  it('should render children', () => {
    render(<AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('should render as h5 element', () => {
    const { container } = render(<AlertTitle>Title</AlertTitle>);
    expect(container.querySelector('h5')).toBeInTheDocument();
  });

  it('should have font-medium class', () => {
    const { container } = render(<AlertTitle>Title</AlertTitle>);
    const title = container.firstChild;
    expect(title).toHaveClass('font-medium');
  });

  it('should have margin bottom', () => {
    const { container } = render(<AlertTitle>Title</AlertTitle>);
    const title = container.firstChild;
    expect(title).toHaveClass('mb-1');
  });

  it('should apply custom className', () => {
    const { container } = render(<AlertTitle className="custom">Title</AlertTitle>);
    const title = container.firstChild;
    expect(title).toHaveClass('custom');
  });
});

describe('AlertDescription', () => {
  it('should render children', () => {
    render(<AlertDescription>Alert Description</AlertDescription>);
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
  });

  it('should render as div element', () => {
    const { container } = render(<AlertDescription>Description</AlertDescription>);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should have text-sm class', () => {
    const { container } = render(<AlertDescription>Description</AlertDescription>);
    const description = container.firstChild;
    expect(description).toHaveClass('text-sm');
  });

  it('should apply custom className', () => {
    const { container } = render(<AlertDescription className="custom">Description</AlertDescription>);
    const description = container.firstChild;
    expect(description).toHaveClass('custom');
  });
});

describe('Alert composition', () => {
  it('should render complete alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render destructive alert with title and description', () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    const alert = container.firstChild;
    expect(alert).toHaveClass('border-destructive/50');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
