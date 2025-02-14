"use client";

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export interface SwitchProps extends ComponentPropsWithoutRef<"button"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        role="switch"
        aria-checked={checked}
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors",
          "data-[state=checked]:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
        ref={ref}
      >
        <div
          className={cn(
            "h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
            "data-[state=checked]:translate-x-[1.625rem]"
          )}
          data-state={checked ? "checked" : "unchecked"}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
