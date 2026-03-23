import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
  title?: string;
}

export default function ImageCropModal({
  isOpen,
  imageFile,
  onClose,
  onSave,
  title = 'Ajuster votre image',
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load and compress image when file changes
  useEffect(() => {
    if (imageFile) {
      compressAndLoadImage(imageFile);
    }
  }, [imageFile]);

  const compressAndLoadImage = async (file: File) => {
    try {
      // Compression options
      const options = {
        maxSizeMB: 0.5, // Max 500KB
        maxWidthOrHeight: 1024, // Max dimension
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      // Compress image
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback: load original if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleSave = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (circular crop)
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create circular clip
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate image position and size
    const img = imageRef.current;
    const scaledWidth = img.naturalWidth * scale;
    const scaledHeight = img.naturalHeight * scale;
    
    // Center the image
    const x = (size - scaledWidth) / 2 + position.x;
    const y = (size - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    // Convert to base64
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImage);
    onClose();
  }, [scale, position, onSave, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Editor */}
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-600 text-center">
            Déplacez et zoomez pour ajuster votre image
          </div>

          {/* Preview Container */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden mx-auto"
               style={{ width: '400px', height: '400px' }}>
            {/* Circular mask overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <svg width="400" height="400" className="absolute inset-0">
                <defs>
                  <mask id="circleMask">
                    <rect width="400" height="400" fill="white" />
                    <circle cx="200" cy="200" r="200" fill="black" />
                  </mask>
                </defs>
                <rect width="400" height="400" fill="black" opacity="0.5" mask="url(#circleMask)" />
              </svg>
              {/* Circle border */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border-4 border-white rounded-full" />
              </div>
            </div>

            {/* Draggable Image */}
            <div
              className="absolute inset-0 cursor-move flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Preview"
                className="max-w-none select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.1s',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={handleZoomOut}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-48"
              />
              <span className="text-sm text-gray-600 w-12">{Math.round(scale * 100)}%</span>
            </div>

            <button
              onClick={handleZoomIn}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Valider
          </button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
