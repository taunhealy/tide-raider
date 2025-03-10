"use client";

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/app/lib/utils";

// Context for the select component
const SelectContext = createContext<{
  open: boolean;
  value: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  value: "",
  searchQuery: "",
  onSearchChange: () => {},
  onValueChange: () => {},
  onOpenChange: () => {},
});

interface SelectProps extends ComponentPropsWithoutRef<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Select = forwardRef<ElementRef<"div">, SelectProps>(
  (
    {
      children,
      value,
      defaultValue = "",
      onValueChange,
      open,
      onOpenChange,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? value : defaultValue
    );
    const [internalOpen, setInternalOpen] = useState(
      open !== undefined ? open : false
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    useEffect(() => {
      if (open !== undefined) {
        setInternalOpen(open);
      }
    }, [open]);

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const handleOpenChange = (newOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
    };

    return (
      <SelectContext.Provider
        value={{
          open: internalOpen,
          value: internalValue,
          searchQuery,
          onSearchChange: handleSearchChange,
          onValueChange: handleValueChange,
          onOpenChange: handleOpenChange,
        }}
      >
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

interface SelectTriggerProps extends ComponentPropsWithoutRef<"button"> {}

export const SelectTrigger = forwardRef<
  ElementRef<"button">,
  SelectTriggerProps
>(({ children, className, ...props }, ref) => {
  const { open, onOpenChange } = useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenChange(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 font-primary",
        className
      )}
      aria-expanded={open}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = forwardRef<
  ElementRef<"span">,
  ComponentPropsWithoutRef<"span"> & { placeholder?: string }
>(({ children, className, placeholder, ...props }, ref) => {
  const { value } = useContext(SelectContext);

  return (
    <span
      ref={ref}
      className={cn("block truncate font-primary", className)}
      {...props}
    >
      {value ? (
        children
      ) : (
        <span className="text-gray-400">
          {placeholder || "Select an option"}
        </span>
      )}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

interface SelectContentProps extends ComponentPropsWithoutRef<"div"> {}

export const SelectContent = forwardRef<ElementRef<"div">, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, onOpenChange, searchQuery, onSearchChange } =
      useContext(SelectContext);

    // Use a callback ref instead of useRef + direct assignment
    const setContentRef = useCallback(
      (node: HTMLDivElement | null) => {
        // Handle click outside detection
        if (node) {
          const handleClickOutside = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) {
              onOpenChange(false);
            }
          };

          document.addEventListener("mousedown", handleClickOutside);

          // Return cleanup function
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }
      },
      [onOpenChange]
    );

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          // Set the forwarded ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            // Use type assertion to avoid TypeScript error
            (ref as any).current = node;
          }

          // Set up click outside detection
          if (node) setContentRef(node);
        }}
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg",
          "border border-gray-200 focus:outline-none",
          className
        )}
        {...props}
      >
        <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-primary"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="py-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  disabled?: boolean;
}

export const SelectItem = forwardRef<ElementRef<"div">, SelectItemProps>(
  ({ children, className, value, disabled, ...props }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      onOpenChange,
    } = useContext(SelectContext);
    const isSelected = selectedValue === value;

    const handleClick = () => {
      if (disabled) return;
      onValueChange(value);
      onOpenChange(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex select-none items-center px-3 py-2 text-sm font-primary",
          "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
          isSelected && "bg-gray-100 font-medium",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onClick={handleClick}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {children}
        {isSelected && !disabled && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-auto h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

interface SelectItemsContainerProps {
  children: React.ReactNode;
  maxItems?: number;
}

export const SelectItemsContainer = ({
  children,
  maxItems = 7,
}: SelectItemsContainerProps) => {
  const { searchQuery } = useContext(SelectContext);

  // Filter and limit children based on search query
  const childrenArray = React.Children.toArray(children);

  const filteredChildren = searchQuery
    ? childrenArray.filter((child) => {
        if (React.isValidElement(child) && child.props.children) {
          const childText = String(child.props.children);
          return childText.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      })
    : childrenArray;

  const limitedChildren = filteredChildren.slice(0, maxItems);

  return <>{limitedChildren}</>;
};
SelectItemsContainer.displayName = "SelectItemsContainer";
