// src/components/FingerScrollControl.tsx
// Contrôle par geste : scroll + pinch-to-zoom via caméra MediaPipe
//
// Gestes disponibles :
// - Index finger   → déplace le curseur
// - Haut/Bas       → défilement de la page
// - Pince 1 main   → clic
// - Pince 2 mains  → pinch-to-zoom (écarter = zoom+, rapprocher = zoom-)

import { useEffect, useRef, useState } from 'react';
import { X, Video, Minimize2, Maximize2, ZoomIn } from 'lucide-react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface FingerScrollControlProps {
  isActive: boolean;
  onClose:  () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dist2D(a: {x:number;y:number}, b: {x:number;y:number}): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function applyZoom(zoom: number) {
  const clamped = Math.max(50, Math.min(200, Math.round(zoom)));
  document.body.style.zoom = `${clamped}%`;
  // Fallback Firefox
  if (!document.body.style.zoom) {
    document.body.style.transform       = `scale(${clamped / 100})`;
    document.body.style.transformOrigin = 'top left';
    document.body.style.width           = `${10000 / clamped}%`;
  }
  // Sync avec AccessibilityContext si disponible
  try {
    const saved = localStorage.getItem('accessibility-settings');
    const settings = saved ? JSON.parse(saved) : {};
    settings.zoom = clamped;
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  } catch {}
  return clamped;
}

function getCurrentZoom(): number {
  try {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) return JSON.parse(saved).zoom ?? 100;
  } catch {}
  return 100;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function FingerScrollControl({ isActive, onClose }: FingerScrollControlProps) {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const displayVideoRef = useRef<HTMLVideoElement>(null);

  const [status,      setStatus]      = useState('Initialisation...');
  const [isLoading,   setIsLoading]   = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(getCurrentZoom);

  const scrollSpeedRef    = useRef(0);
  const isPinchingRef     = useRef(false);       // pince 1 main (clic)
  const pinchDistRef      = useRef<number|null>(null); // distance initiale pinch 2 mains
  const pinchZoomRef      = useRef<number>(100); // zoom au début du pinch
  const zoomIndicatorRef  = useRef<HTMLDivElement|null>(null);
  const cursorDotRef      = useRef<HTMLDivElement|null>(null);
  const cameraRef         = useRef<any>(null);
  const streamRef         = useRef<MediaStream|null>(null);

  // ─── Indicateur zoom flottant ──────────────────────────────────────────────
  const showZoomIndicator = (zoom: number) => {
    if (!zoomIndicatorRef.current) {
      const div = document.createElement('div');
      div.style.cssText = `
        position:fixed;bottom:80px;right:24px;
        background:rgba(79,70,229,0.92);color:#fff;
        padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;
        pointer-events:none;z-index:9999;
        transition:opacity .3s ease;opacity:0;
      `;
      document.body.appendChild(div);
      zoomIndicatorRef.current = div;
    }
    const el = zoomIndicatorRef.current;
    el.textContent = `Zoom ${zoom}%`;
    el.style.opacity = '1';
    clearTimeout((el as any)._hide);
    (el as any)._hide = setTimeout(() => { el.style.opacity = '0'; }, 1500);
  };

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) cameraRef.current.stop?.();
      if (cursorDotRef.current) cursorDotRef.current.style.display = 'none';
      scrollSpeedRef.current = 0;
      return;
    }

    // ── Créer le curseur point rouge ────────────────────────────────────────
    const cursorDot = document.createElement('div');
    cursorDot.style.cssText = `
      position:fixed;width:20px;height:20px;
      background:red;border:3px solid white;border-radius:50%;
      pointer-events:none;z-index:10000;
      transform:translate(-50%,-50%);display:none;
      box-shadow:0 0 10px rgba(255,0,0,0.5);
      transition:transform .1s, background .1s;
    `;
    document.body.appendChild(cursorDot);
    cursorDotRef.current = cursorDot;

    // ── Chargement scripts MediaPipe ────────────────────────────────────────
    const loadScript = (src: string): Promise<void> => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.crossOrigin = 'anonymous';
      s.onload = () => res(); s.onerror = rej;
      document.head.appendChild(s);
    });

    const init = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js');

        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx    = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width  = 320;
        canvas.height = 240;

        // ── MediaPipe Hands — 2 mains pour le pinch zoom ───────────────────
        const hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        });

        hands.setOptions({
          maxNumHands:           1,     // 1 seule main
          modelComplexity:       1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        });

        hands.onResults((results: any) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const allHands = results.multiHandLandmarks ?? [];

          // ── Aucune main ────────────────────────────────────────────────────
          if (allHands.length === 0) {
            scrollSpeedRef.current = 0;
            pinchDistRef.current   = null;
            cursorDot.style.display = 'none';
            setStatus('Aucune main détectée');
            return;
          }

          // ── 1 main → scroll + curseur + clic + pinch-to-zoom ─────────────────
          const hand           = allHands[0];
          const indexFingerTip = hand[8];  // bout index
          const thumbTip       = hand[4];  // bout pouce
          const ringTip        = hand[16]; // bout annulaire
          const ringKnuckle    = hand[14]; // articulation annulaire

          // Détection mode zoom : annulaire replié (tip plus bas que knuckle)
          // Cela distingue le geste zoom du scroll normal (index levé seul)
          const ringIsDown     = ringTip.y > ringKnuckle.y;
          const thumbIndexDist = dist2D(thumbTip, indexFingerTip);

          // ── PINCH TO ZOOM 1 main ──────────────────────────────────────────
          // Geste : annulaire replié + écarter/rapprocher pouce et index
          if (ringIsDown && thumbIndexDist > 0.05) {
            // Dessiner pouce et index en couleurs distinctes
            ctx.fillStyle = '#00FF88';
            ctx.beginPath();
            ctx.arc(thumbTip.x * 320, thumbTip.y * 240, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FF6600';
            ctx.beginPath();
            ctx.arc(indexFingerTip.x * 320, indexFingerTip.y * 240, 10, 0, 2 * Math.PI);
            ctx.fill();
            // Ligne pouce ↔ index
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth   = 3;
            ctx.beginPath();
            ctx.moveTo(thumbTip.x * 320,       thumbTip.y * 240);
            ctx.lineTo(indexFingerTip.x * 320, indexFingerTip.y * 240);
            ctx.stroke();

            if (pinchDistRef.current === null) {
              // Début du geste : mémoriser distance initiale + zoom actuel
              pinchDistRef.current = thumbIndexDist;
              pinchZoomRef.current = getCurrentZoom();
            } else {
              const ratio   = thumbIndexDist / pinchDistRef.current;
              const newZoom = Math.max(50, Math.min(200,
                Math.round(pinchZoomRef.current * ratio),
              ));
              const applied = applyZoom(newZoom);
              setCurrentZoom(applied);
              showZoomIndicator(applied);
              setStatus(`Zoom ${applied}% — ${ratio > 1 ? 'agrandir 🔍+' : 'réduire 🔍-'}`);
            }

            scrollSpeedRef.current  = 0;
            cursorDot.style.display = 'none';
            isPinchingRef.current   = false;
            return;
          }

          // Fin du geste zoom → reset
          pinchDistRef.current = null;

          const screenX = (1 - indexFingerTip.x) * window.innerWidth;
          const screenY = indexFingerTip.y        * window.innerHeight;

          cursorDot.style.left    = screenX + 'px';
          cursorDot.style.top     = screenY + 'px';
          cursorDot.style.display = 'block';

          // Dessiner l'index
          ctx.fillStyle = 'lime';
          ctx.beginPath();
          ctx.arc(indexFingerTip.x * 320, indexFingerTip.y * 240, 10, 0, 2 * Math.PI);
          ctx.fill();

          // Ligne centrale
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth   = 2;
          ctx.beginPath();
          ctx.moveTo(0, 120); ctx.lineTo(320, 120);
          ctx.stroke();

          // Détection pince (clic)
          const pinchDist = dist2D(thumbTip, indexFingerTip);
          if (pinchDist < 0.08) {
            if (!isPinchingRef.current) {
              isPinchingRef.current         = true;
              cursorDot.style.transform     = 'translate(-50%,-50%) scale(1.5)';
              cursorDot.style.background    = 'lime';
              const el = document.elementFromPoint(screenX, screenY);
              if (el) {
                if (
                  el.tagName === 'BUTTON' || el.tagName === 'A' ||
                  (el as any).onclick ||
                  el.classList.contains('cursor-pointer')
                ) {
                  (el as HTMLElement).click();
                }
              }
            }
          } else {
            isPinchingRef.current      = false;
            cursorDot.style.transform  = 'translate(-50%,-50%)';
            cursorDot.style.background = 'red';
          }

          // Scroll vertical
          const centerY  = 0.5;
          const deadZone = 0.1;
          if (Math.abs(indexFingerTip.y - centerY) > deadZone) {
            const delta        = indexFingerTip.y - centerY;
            const scrollAmount = delta * 40;

            const elAtCursor = document.elementFromPoint(screenX, screenY);
            let scrollTarget: HTMLElement | null = null;
            if (elAtCursor) {
              let cur = elAtCursor as HTMLElement;
              while (cur && cur !== document.body) {
                const oy = window.getComputedStyle(cur).overflowY;
                if ((oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight) {
                  scrollTarget = cur; break;
                }
                cur = cur.parentElement as HTMLElement;
              }
            }

            if (scrollTarget) {
              scrollTarget.scrollTop += scrollAmount * 0.5;
              scrollSpeedRef.current  = 0;
              setStatus(`Défilement élément ${scrollAmount > 0 ? '⬇' : '⬆'}`);
            } else {
              scrollSpeedRef.current = scrollAmount * 0.5;
              setStatus(`Défilement page ${scrollAmount > 0 ? '⬇' : '⬆'}`);
            }
          } else {
            scrollSpeedRef.current = 0;
            setStatus('Main détectée — bougez le doigt pour défiler');
          }
        });

        // ── Animation scroll ───────────────────────────────────────────────
        let lastScroll = 0;
        const animate = () => {
          const now = Date.now();
          if (now - lastScroll >= 16) {
            if (scrollSpeedRef.current !== 0) window.scrollBy(0, scrollSpeedRef.current);
            lastScroll = now;
          }
          requestAnimationFrame(animate);
        };
        animate();

        // ── Démarrer la caméra ─────────────────────────────────────────────
        const camera = new window.Camera(video, {
          onFrame: async () => { await hands.send({ image: video }); },
          width:  640,
          height: 480,
        });
        cameraRef.current = camera;
        await camera.start();

        if (video.srcObject) {
          streamRef.current = video.srcObject as MediaStream;
          if (displayVideoRef.current) displayVideoRef.current.srcObject = streamRef.current;
        }

        setStatus('Caméra prête — index : scroll / annulaire replié + pouce-index : zoom');
        setIsLoading(false);

      } catch (err) {
        setStatus('Erreur : ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (!isActive) {
        if (cursorDotRef.current?.parentNode) {
          document.body.removeChild(cursorDotRef.current);
          cursorDotRef.current = null;
        }
        if (zoomIndicatorRef.current?.parentNode) {
          document.body.removeChild(zoomIndicatorRef.current);
          zoomIndicatorRef.current = null;
        }
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (streamRef.current && displayVideoRef.current && isActive) {
      displayVideoRef.current.srcObject = streamRef.current;
    }
  }, [isActive, isMinimized]);

  if (!isActive) return null;

  return (
    <>
      {/* Vidéo + canvas cachés pour le traitement */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '640px', height: '480px' }} />
        <canvas ref={canvasRef} width={320} height={240} />
      </div>

      {/* Vue miniature */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 z-[102] bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="relative w-48 h-36">
            <video ref={displayVideoRef} autoPlay playsInline muted
              className="w-full h-full bg-gray-900 object-cover"
              style={{ transform: 'scaleX(-1)' }} />
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setIsMinimized(false)}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg"
                title="Agrandir">
                <Maximize2 className="h-4 w-4 text-gray-700" />
              </button>
              <button onClick={onClose}
                className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg"
                title="Désactiver">
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs text-white font-medium truncate">{status}</p>
            </div>
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ACTIF
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vue complète */
        <div className="fixed inset-0 bg-black/50 z-[102] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                Contrôle par geste
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Réduire">
                  <Minimize2 className="h-5 w-5" />
                </button>
                <button onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Désactiver">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '240px' }}>
                <video ref={displayVideoRef} autoPlay playsInline muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} />
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-2 bg-green-500 text-white text-sm px-3 py-1.5 rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    DÉTECTION ACTIVE
                  </div>
                </div>
                {/* Affichage zoom courant */}
                <div className="absolute top-3 right-3 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <ZoomIn className="h-3 w-3" />
                  {currentZoom}%
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Instructions :</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Index levé — haut/bas</strong> : défilement de la page</li>
                  <li>• <strong>Index — curseur</strong> : déplace le point rouge</li>
                  <li>• <strong>Pince pouce+index</strong> : clic</li>
                  <li>• <strong>Annulaire replié + écarter pouce/index</strong> : zoom avant 🔍+</li>
                  <li>• <strong>Annulaire replié + rapprocher pouce/index</strong> : zoom arrière 🔍-</li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm text-indigo-900">
                  {isLoading
                    ? <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Chargement...</span>
                    : <span className="flex items-center gap-2"><span className="text-green-600">✓</span> {status}</span>}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Astuce :</strong> Cliquez "Réduire" pour continuer à naviguer avec les gestes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}