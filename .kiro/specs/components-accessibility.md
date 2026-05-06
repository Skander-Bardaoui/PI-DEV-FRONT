# Accessibility Components Spec

## Overview
Accessibility components provide comprehensive accessibility features including keyboard navigation, screen reader support, text-to-speech, focus management, and customizable UI controls for users with disabilities.

## Components

### AccessibilityButton.tsx
Global floating button to toggle accessibility panel.

### AccessibilityContext.tsx
React Context provider managing accessibility state (finger scroll, reading mode, focus mode, text-to-speech).

### AccessibilityPanel.tsx
Side panel with accessibility controls (font size, contrast, reading mode, TTS, keyboard shortcuts).

### AriaLiveRegion.tsx
ARIA live region for screen reader announcements.

### FingerScrollControl.tsx
Touch-based scrolling control for mobile accessibility.

### FocusModeManager.tsx
Manages focus mode to reduce distractions and highlight active elements.

### KeyboardShortcutsHelp.tsx
Modal displaying available keyboard shortcuts.

### ReadingModeToggle.tsx
Toggle button for simplified reading mode.

### TextToSpeechReader.tsx
Text-to-speech functionality for reading page content aloud.

## Key Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Text-to-speech engine
- High contrast modes
- Adjustable font sizes
- Focus indicators
- Touch-based controls
- Reading mode for reduced distractions

## State Management
- AccessibilityContext (React Context)
- Local state with useState
- LocalStorage for persistence

## Dependencies
- react
- react-icons
- Web Speech API (for TTS)
- CSS custom properties for theming

## Accessibility Standards
- ARIA labels and roles
- Semantic HTML
- Focus management
- Keyboard event handlers
- Screen reader announcements
