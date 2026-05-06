import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageCropModal from './ImageCropModal';

// Mock react-easy-crop
vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete, image }: any) => (
    <div data-testid="cropper" data-image={image}>
      <button
        onClick={() => onCropComplete(
          { x: 0, y: 0, width: 100, height: 100 },
          { x: 0, y: 0, width: 100, height: 100 }
        )}
      >
        Trigger Crop
      </button>
    </div>
  ),
}));

describe('ImageCropModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCropComplete = vi.fn();
  const testImageSrc = 'data:image/png;base64,test';

  const defaultProps = {
    isOpen: true,
    imageSrc: testImageSrc,
    onClose: mockOnClose,
    onCropComplete: mockOnCropComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock canvas and image
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
      putImageData: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
    })) as any;
    
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(['test'], { type: 'image/jpeg' }));
    });
    
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      width = 800;
      height = 600;
      
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;
  });

  it('does not render when isOpen is false', () => {
    render(<ImageCropModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Ajuster votre photo')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    expect(screen.getByText('Ajuster votre photo')).toBeInTheDocument();
    expect(screen.getByTestId('cropper')).toBeInTheDocument();
  });

  it('displays zoom control', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays rotation control', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.getByText('0°')).toBeInTheDocument();
  });

  it('updates zoom value when slider changes', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const zoomSlider = screen.getAllByRole('slider')[0];
    fireEvent.change(zoomSlider, { target: { value: '2' } });
    
    expect(screen.getByText('200%')).toBeInTheDocument();
  });

  it('updates rotation value when slider changes', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const rotationSlider = screen.getAllByRole('slider')[1];
    fireEvent.change(rotationSlider, { target: { value: '90' } });
    
    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/70');
    fireEvent.click(backdrop!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const modalContent = screen.getByText('Ajuster votre photo').closest('.bg-white');
    fireEvent.click(modalContent!);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles crop and save', async () => {
    render(<ImageCropModal {...defaultProps} />);
    
    // Trigger crop complete
    const triggerButton = screen.getByText('Trigger Crop');
    fireEvent.click(triggerButton);
    
    // Click save
    const saveButton = screen.getByText('Appliquer');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnCropComplete).toHaveBeenCalled();
    });
  });

  it('passes correct image src to cropper', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    const cropper = screen.getByTestId('cropper');
    expect(cropper).toHaveAttribute('data-image', testImageSrc);
  });

  it('displays action buttons', () => {
    render(<ImageCropModal {...defaultProps} />);
    
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Appliquer')).toBeInTheDocument();
  });
});
