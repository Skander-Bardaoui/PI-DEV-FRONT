# Product Type Filter Feature

## Overview
This feature adds the ability to filter products by type (Service vs Product) when creating sales documents (Quotes, Orders, Invoices).

## Implementation

### Components Updated
- `SalesInvoiceModal.tsx` - Sales invoices
- `QuoteModal.tsx` - Sales quotes  
- `SalesOrderModal.tsx` - Sales orders

### New UI Elements
Each line item now includes filter buttons above the product selector:
- **Tous** - Shows all products (default)
- **📦 Produit** - Shows only physical products (`ProductType.PHYSICAL`)
- **🔧 Service** - Shows only services (`ProductType.SERVICE`)

### User Experience
1. When adding a new line item, users see three filter buttons
2. Clicking a filter button updates the product dropdown to show only matching products
3. The selected filter is visually highlighted with colored backgrounds
4. Changing the filter clears any previously selected product
5. The product dropdown no longer shows type icons since the filter buttons provide this context

### Technical Details

#### State Management
- `itemTypeFilters`: Tracks the selected filter for each line item
- Filter state is independent per line item
- Clearing a filter resets the product selection for that line

#### ProductSelector Integration
- Uses existing `filterByType` prop to filter products
- Sets `showType={false}` to hide type icons in dropdown
- Maintains all existing functionality (stock warnings, price auto-fill, etc.)

#### Visual Design
- Filter buttons use consistent color coding:
  - Blue for Physical products
  - Green for Services  
  - Indigo for "All" filter
- Active filters have colored backgrounds and borders
- Inactive filters are gray with hover effects

## Benefits
- **Improved UX**: Users can quickly find the type of product they need
- **Reduced Clutter**: Shorter, more focused product lists
- **Visual Clarity**: Clear distinction between products and services
- **Consistent**: Same experience across all sales document types

## Future Enhancements
- Could add support for `ProductType.DIGITAL` if needed
- Could remember user's last filter preference per session
- Could add keyboard shortcuts for quick filter switching