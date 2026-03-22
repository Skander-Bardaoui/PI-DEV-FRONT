import { useEffect, useRef, useState } from 'react';
import { X, Video, Minimize2, Maximize2 } from 'lucide-react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface FingerScrollControlProps {
  isActive: boolean;
  onClose: () => void;
}

export default function FingerScrollControl({ isActive, onClose }: FingerScrollControlProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayVideoRef = useRef<HTMLVideoElement>(null); // For showing in UI
  const [status, setStatus] = useState('Initialisation...');
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollSpeedRef = useRef(0);
  const isPinchingRef = useRef(false);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Cleanup when deactivated
      if (cameraRef.current) {
        cameraRef.current.stop?.();
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.display = 'none';
      }
      scrollSpeedRef.current = 0;
      return;
    }

    // Create cursor dot
    const cursorDot = document.createElement('div');
    cursorDot.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: red;
      border: 3px solid white;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      display: none;
      box-shadow: 0 0 10px rgba(255,0,0,0.5);
      transition: transform 0.1s;
    `;
    document.body.appendChild(cursorDot);
    cursorDotRef.current = cursorDot;

    // Load MediaPipe scripts
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeHandTracking = async () => {
      try {
        // Load MediaPipe scripts
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 320;
        canvas.height = 240;

        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handsRef.current = hands;

        hands.onResults((results: any) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const hand = results.multiHandLandmarks[0];

            // Index finger (8) - for cursor control
            const indexFingerTip = hand[8];
            const indexX = indexFingerTip.x;
            const indexY = indexFingerTip.y;

            // Thumb tip (4) - for click detection
            const thumbTip = hand[4];

            // Draw index finger (green)
            ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(indexX * 320, indexY * 240, 10, 0, 2 * Math.PI);
            ctx.fill();

            // Show cursor on screen based on index finger
            const screenX = (1 - indexX) * window.innerWidth; // Invert X for mirrored video
            const screenY = indexY * window.innerHeight;
            cursorDot.style.left = screenX + 'px';
            cursorDot.style.top = screenY + 'px';
            cursorDot.style.display = 'block';

            // Check for pinch gesture (thumb and index finger close together) for click
            const distance = Math.sqrt(
              Math.pow(thumbTip.x - indexFingerTip.x, 2) +
              Math.pow(thumbTip.y - indexFingerTip.y, 2)
            );

            if (distance < 0.08) {
              if (!isPinchingRef.current) {
                isPinchingRef.current = true;
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorDot.style.background = 'lime';
                const elementAtPoint = document.elementFromPoint(screenX, screenY);
                if (elementAtPoint) {
                  // Click on buttons, links, and interactive elements
                  if (elementAtPoint.tagName === 'BUTTON' || 
                      elementAtPoint.tagName === 'A' ||
                      (elementAtPoint as any).onclick ||
                      elementAtPoint.classList.contains('cursor-pointer')) {
                    (elementAtPoint as HTMLElement).click();
                  }
                }
              }
            } else {
              isPinchingRef.current = false;
              cursorDot.style.transform = 'translate(-50%, -50%)';
              cursorDot.style.background = 'red';
            }

            // Draw center line
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 120);
            ctx.lineTo(320, 120);
            ctx.stroke();

            // Scroll logic with sidebar detection - based on vertical position
            const centerY = 0.5;
            const deadZone = 0.1;

            if (Math.abs(indexY - centerY) > deadZone) {
              const distance = indexY - centerY;
              const scrollAmount = distance * 40;

              // Check if cursor is over sidebar or scrollable element
              const elementAtCursor = document.elementFromPoint(screenX, screenY);
              let scrollTarget: HTMLElement | null = null;

              if (elementAtCursor) {
                // Find the nearest scrollable parent
                let current = elementAtCursor as HTMLElement;
                while (current && current !== document.body) {
                  const overflowY = window.getComputedStyle(current).overflowY;
                  const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
                  const hasScroll = current.scrollHeight > current.clientHeight;
                  
                  if (isScrollable && hasScroll) {
                    scrollTarget = current;
                    break;
                  }
                  current = current.parentElement as HTMLElement;
                }
              }

              if (scrollTarget) {
                // Scroll the specific element (sidebar, modal, etc.) with smooth behavior
                const currentScroll = scrollTarget.scrollTop;
                const newScroll = currentScroll + (scrollAmount * 0.5); // Reduce speed for smoothness
                scrollTarget.scrollTo({
                  top: newScroll,
                  behavior: 'auto' // Use auto for manual control
                });
                scrollSpeedRef.current = 0; // Don't scroll the window
                setStatus(`Défilement élément ${scrollAmount > 0 ? '⬇️ BAS' : '⬆️ HAUT'}`);
              } else {
                // Scroll the main window
                scrollSpeedRef.current = scrollAmount * 0.5; // Reduce speed
                setStatus(`Défilement page ${scrollAmount > 0 ? '⬇️ BAS' : '⬆️ HAUT'}`);
              }
            } else {
              scrollSpeedRef.current = 0;
              setStatus('Main détectée - Bougez le doigt pour défiler');
            }
          } else {
            scrollSpeedRef.current = 0;
            cursorDot.style.display = 'none';
            setStatus('Aucune main détectée');
          }
        });

        // Animation loop with throttling
        let lastScrollTime = 0;
        const scrollThrottle = 16; // ~60fps
        
        const animate = () => {
          const now = Date.now();
          if (now - lastScrollTime >= scrollThrottle) {
            if (scrollSpeedRef.current !== 0) {
              window.scrollBy(0, scrollSpeedRef.current);
            }
            lastScrollTime = now;
          }
          requestAnimationFrame(animate);
        };
        animate();

        // Start camera
        const camera = new window.Camera(video, {
          onFrame: async () => {
            await hands.send({ image: video });
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;
        await camera.start();
        
        // Get the video stream and clone it for display
        if (video.srcObject) {
          streamRef.current = video.srcObject as MediaStream;
          if (displayVideoRef.current) {
            displayVideoRef.current.srcObject = streamRef.current;
          }
        }
        
        setStatus('Caméra prête! Montrez votre main.');
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing hand tracking:', err);
        setStatus('Erreur: ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    initializeHandTracking();

    return () => {
      // Only cleanup cursor dot, keep camera running
      if (!isActive && cursorDotRef.current && cursorDotRef.current.parentNode) {
        document.body.removeChild(cursorDotRef.current);
        cursorDotRef.current = null;
      }
    };
  }, [isActive]);

  // Update display video when stream is available or when minimized state changes
  useEffect(() => {
    if (streamRef.current && displayVideoRef.current && isActive) {
      displayVideoRef.current.srcObject = streamRef.current;
    }
  }, [isActive, isMinimized]);

  if (!isActive) return null;

  return (
    <>
      {/* Hidden video and canvas for processing - always rendered at original size */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '640px', height: '480px' }}
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
        />
      </div>

      {/* Minimized view - floating video preview with actual camera feed */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 z-[102] bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="relative w-48 h-36">
            {/* Display video feed */}
            <video
              ref={displayVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full bg-gray-900 object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg"
                aria-label="Agrandir"
                title="Agrandir"
              >
                <Maximize2 className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg"
                aria-label="Désactiver"
                title="Désactiver"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs text-white font-medium truncate">{status}</p>
            </div>
            {/* Active indicator */}
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>ACTIF</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full modal view with camera feed */
        <div className="fixed inset-0 bg-black/50 z-[102] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                Contrôle par geste
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Réduire"
                  title="Réduire"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Désactiver"
                  title="Désactiver"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '240px' }}>
                {/* Display video feed */}
                <video
                  ref={displayVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Active indicator */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-2 bg-green-500 text-white text-sm px-3 py-1.5 rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-medium">DÉTECTION ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Instructions:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Index</strong>: Contrôle le curseur (point rouge)</li>
                  <li>• <strong>Haut/Bas</strong>: Défilement automatique</li>
                  <li>• <strong>Pince (pouce+index)</strong>: Clic</li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm text-indigo-900">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Chargement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-green-600">✓</span> {status}
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Astuce:</strong> Cliquez sur "Réduire" pour continuer à utiliser le contrôle par geste tout en naviguant sur le site.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
