import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table';

describe('Table Components', () => {
  it('renders complete table structure', () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    
    expect(screen.getByText('Table Caption')).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Footer 1')).toBeInTheDocument();
  });

  it('renders table with correct HTML structure', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelector('th')).toBeInTheDocument();
    expect(container.querySelector('td')).toBeInTheDocument();
  });

  it('applies custom className to table components', () => {
    const { container } = render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow className="custom-row">
            <TableHead className="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow>
            <TableCell className="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(container.querySelector('.custom-table')).toBeInTheDocument();
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
    expect(container.querySelector('.custom-head')).toBeInTheDocument();
    expect(container.querySelector('.custom-cell')).toBeInTheDocument();
  });

  it('renders table caption', () => {
    render(
      <Table>
        <TableCaption>Test Caption</TableCaption>
      </Table>
    );
    
    const caption = screen.getByText('Test Caption');
    expect(caption.tagName).toBe('CAPTION');
  });
});
