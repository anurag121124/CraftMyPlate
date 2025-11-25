import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const Popover = ({ open, onOpenChange, children }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ className, asChild, children, onClick, ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'data-popover-trigger': true,
      ...props,
    } as any);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      data-popover-trigger
      className={cn('', className)}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'bottom' | 'left' | 'right';
  }
>(({ className, align = 'center', side = 'bottom', children, ...props }, _ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      // Find the trigger element
      const trigger = document.activeElement?.closest('[data-popover-trigger]') as HTMLElement;
      triggerRef.current = trigger;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          trigger &&
          !trigger.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  React.useEffect(() => {
    if (open && contentRef.current && triggerRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (!contentRef.current || !triggerRef.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const content = contentRef.current;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top: number;
        let left: number;
        
        // Calculate vertical position
        if (side === 'top') {
          // Always try to show on top first
          top = triggerRect.top - content.offsetHeight - 8;
          // Only fall back to bottom if there's really no space above
          if (top < 8 && triggerRect.bottom + content.offsetHeight + 8 < viewportHeight) {
            // Only if there's more space below than above
            const spaceAbove = triggerRect.top;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            if (spaceBelow > spaceAbove) {
              top = triggerRect.bottom + 8;
            } else {
              // Keep it on top, just adjust to viewport edge
              top = 8;
            }
          } else if (top < 8) {
            // Not enough space above, but also not enough below - keep at top edge
            top = 8;
          }
        } else if (side === 'bottom') {
          top = triggerRect.bottom + 8;
          // If not enough space below, show above instead
          if (top + content.offsetHeight > viewportHeight - 8) {
            top = triggerRect.top - content.offsetHeight - 8;
            // If still not enough space, position at top of viewport
            if (top < 8) {
              top = 8;
            }
          }
        } else {
          top = triggerRect.bottom + 8;
        }
        
        // Calculate horizontal position
        if (align === 'end') {
          left = triggerRect.right - content.offsetWidth;
        } else if (align === 'center') {
          left = triggerRect.left + (triggerRect.width - content.offsetWidth) / 2;
        } else {
          left = triggerRect.left;
        }
        
        // Ensure content doesn't go off screen horizontally
        if (left + content.offsetWidth > viewportWidth - 8) {
          left = viewportWidth - content.offsetWidth - 8;
        }
        if (left < 8) {
          left = 8;
        }

        if (contentRef.current) {
          contentRef.current.style.top = `${top}px`;
          contentRef.current.style.left = `${left}px`;
        }
      });
    }
  }, [open, align, side]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-lg outline-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };

