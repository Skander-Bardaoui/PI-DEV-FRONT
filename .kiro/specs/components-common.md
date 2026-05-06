# Common Components Spec

## Overview
Reusable common components used across the application including form inputs, modals, status indicators, and utility components.

## Components

### AddressAutocomplete.tsx
Autocomplete input for address selection with geolocation support.

### Card.tsx
Generic card container component.

### ConfirmationModal.tsx
Modal for confirming user actions.

### ConfirmDialog.tsx
Dialog component for confirmation prompts.

### EmptyState.tsx
Empty state placeholder with icon and message.

### ErrorMessage.tsx
Error message display component.

### LoadingSpinner.tsx
Loading spinner indicator.

### LocationPicker.tsx
Interactive map-based location picker.

### PhoneInput.tsx
International phone number input with country code selector.

### StatusBadge.tsx
Badge component for displaying status (active, pending, completed, etc.).

### ValidationErrorDisplay.tsx
Component for displaying form validation errors.

## Key Features
- Form input components with validation
- Modal and dialog management
- Loading and error states
- Status indicators
- Location and address selection
- Phone number formatting
- Empty state handling

## State Management
- Local component state with useState
- Form state management
- Validation state

## Dependencies
- react
- react-hook-form
- zod (validation)
- lucide-react (icons)
- react-phone-number-input
- leaflet (maps)

## Testing
- EmptyState.test.tsx
- ErrorMessage.test.tsx
- LoadingSpinner.test.tsx
