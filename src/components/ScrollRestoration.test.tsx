/**
 * Tests for ScrollRestoration component
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ScrollRestoration from './ScrollRestoration';

describe('ScrollRestoration', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <ScrollRestoration />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render any visible content', () => {
    const { container } = render(
      <BrowserRouter>
        <ScrollRestoration />
      </BrowserRouter>
    );

    expect(container.innerHTML).toBe('');
  });

  it('should work with MemoryRouter', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollRestoration />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not throw error when location changes', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollRestoration />
      </MemoryRouter>
    );

    expect(() => {
      rerender(
        <MemoryRouter initialEntries={['/new-path']}>
          <ScrollRestoration />
        </MemoryRouter>
      );
    }).not.toThrow();
  });

  it('should be a valid React component', () => {
    expect(ScrollRestoration).toBeDefined();
    expect(typeof ScrollRestoration).toBe('function');
  });
});
