# Profile Components Spec

## Overview
User profile management components including avatar upload and image cropping.

## Components

### ImageCropModal.tsx
Modal for cropping and adjusting profile images before upload.

## Key Features
- Image upload
- Image cropping
- Aspect ratio control
- Preview before save
- File size validation

## State Management
- Local state for crop area
- Image file state
- Upload progress state

## API Calls
- POST /api/profile/avatar - Upload profile avatar

## Dependencies
- react
- react-easy-crop
- canvas API for image processing

## File Validation
- Max file size: 5MB
- Allowed formats: JPEG, PNG, WebP
