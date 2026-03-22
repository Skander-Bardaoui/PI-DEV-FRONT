import { X, Plus, Minus, RotateCcw, Eye, Type, Contrast, MousePointer, BookOpen, Volume2, Zap, Link as LinkIcon, Hand } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings, isAccessibilityPanelOpen, toggleAccessibilityPanel, isFingerScrollActive, toggleFingerScroll } = useAccessibility();

  if (!isAccessibilityPanelOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={toggleAccessibilityPanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[101] overflow-y-auto accessibility-panel"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-indigo-600 text-white p-4 flex items-center justify-between">
          <h2 id="accessibility-title" className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibilité
          </h2>
          <button
            onClick={toggleAccessibilityPanel}
            className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
            aria-label="Fermer le panneau d'accessibilité"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <Type className="inline h-4 w-4 mr-2" />
              Taille du texte
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Diminuer la taille du texte"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center font-medium">{settings.fontSize}px</span>
              <button
                onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Augmenter la taille du texte"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contrast */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <Contrast className="inline h-4 w-4 mr-2" />
              Contraste
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('contrast', 'normal')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.contrast === 'normal'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.contrast === 'normal'}
              >
                <div className="text-xs font-medium">Normal</div>
              </button>
              <button
                onClick={() => updateSetting('contrast', 'high')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.contrast === 'high'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.contrast === 'high'}
              >
                <div className="text-xs font-medium">Élevé</div>
              </button>
              <button
                onClick={() => updateSetting('contrast', 'dark')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.contrast === 'dark'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.contrast === 'dark'}
              >
                <div className="text-xs font-medium">Sombre</div>
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <label htmlFor="line-height" className="block text-sm font-medium text-gray-700">
              Hauteur de ligne
            </label>
            <input
              id="line-height"
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className="w-full"
              aria-valuemin={1}
              aria-valuemax={2.5}
              aria-valuenow={settings.lineHeight}
            />
            <div className="text-center text-sm text-gray-600">{settings.lineHeight.toFixed(1)}</div>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-3">
            <label htmlFor="letter-spacing" className="block text-sm font-medium text-gray-700">
              Espacement des lettres
            </label>
            <input
              id="letter-spacing"
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={settings.letterSpacing}
              onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
              className="w-full"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={settings.letterSpacing}
            />
            <div className="text-center text-sm text-gray-600">{settings.letterSpacing}px</div>
          </div>

          {/* Cursor Size */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <MousePointer className="inline h-4 w-4 mr-2" />
              Taille du curseur
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('cursorSize', 'normal')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.cursorSize === 'normal'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.cursorSize === 'normal'}
              >
                <div className="text-xs font-medium">Normal</div>
              </button>
              <button
                onClick={() => updateSetting('cursorSize', 'large')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.cursorSize === 'large'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.cursorSize === 'large'}
              >
                <div className="text-xs font-medium">Grand</div>
              </button>
              <button
                onClick={() => updateSetting('cursorSize', 'extra-large')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.cursorSize === 'extra-large'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={settings.cursorSize === 'extra-large'}
              >
                <div className="text-xs font-medium">Très grand</div>
              </button>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <ToggleOption
              icon={<Hand className="h-4 w-4" />}
              label="Contrôle par geste"
              checked={isFingerScrollActive}
              onChange={toggleFingerScroll}
            />
            <ToggleOption
              icon={<BookOpen className="h-4 w-4" />}
              label="Police dyslexie"
              checked={settings.dyslexiaFont}
              onChange={(checked) => updateSetting('dyslexiaFont', checked)}
            />
            <ToggleOption
              icon={<LinkIcon className="h-4 w-4" />}
              label="Surligner les liens"
              checked={settings.highlightLinks}
              onChange={(checked) => updateSetting('highlightLinks', checked)}
            />
            <ToggleOption
              icon={<Zap className="h-4 w-4" />}
              label="Réduire les animations"
              checked={settings.reduceAnimations}
              onChange={(checked) => updateSetting('reduceAnimations', checked)}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>
        </div>
      </div>
    </>
  );
}

interface ToggleOptionProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ icon, label, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
