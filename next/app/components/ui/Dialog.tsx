"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  // Use a ref to track first render
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    // Skip the first render to avoid auto-opening
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only call onOpenChange when open changes after first render
    if (onOpenChange) {
      onOpenChange(!!open);
    }
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider
      value={{
        isOpen: !!open,
        setOpen: (newOpen) => {
          if (onOpenChange) onOpenChange(newOpen);
        },
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

const DialogContext = React.createContext<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setOpen: () => {},
});

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <button {...props} ref={ref} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDialogElement,
  React.HTMLAttributes<HTMLDialogElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, setOpen } = React.useContext(DialogContext);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    try {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    } catch (error) {
      console.error("Dialog operation failed:", error);
    }

    // Cleanup function to ensure dialog is closed when component unmounts
    return () => {
      try {
        // Only call close() if the dialog is open
        if (dialog.open) {
          dialog.close();
        }
      } catch (e) {
        // Silent catch for cleanup
      }
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "relative flex flex-col z-50 grid w-full max-w-[95vw] md:max-w-3xl gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg backdrop:bg-black/80 font-primary",
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          setOpen(false);
        }
      }}
      {...props}
    >
      {children}
      <button
        onClick={() => setOpen(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </dialog>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left font-primary",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight font-primary",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-primary", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
