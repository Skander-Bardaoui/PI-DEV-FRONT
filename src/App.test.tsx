import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // App already includes BrowserRouter, so we don't wrap it again
    render(<App />);
    expect(document.body).toBeTruthy();
  });
});
