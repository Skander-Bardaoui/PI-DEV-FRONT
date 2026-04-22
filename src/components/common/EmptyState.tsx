/**
 * Reusable Empty State Component
 * Reduces code duplication for empty data displays
 */

import { FileQuestion } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  title = 'No Data', 
  message, 
  icon,
  action 
}: EmptyStateProps) {
  const IconComponent = icon || <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />;
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {IconComponent}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
