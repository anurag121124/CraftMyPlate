import * as React from 'react';
import { cn } from '@/lib/utils';

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => onOpenChange?.(false)}
        />
        <div
          ref={ref}
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card p-6 shadow-lg transition-transform',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
Sheet.displayName = 'Sheet';

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  )
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4', className)} {...props} />
  )
);
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetHeader, SheetTitle, SheetContent };

