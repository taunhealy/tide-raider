"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    name?: string;
  }
>(
  (
    { className, children, value, defaultValue, onValueChange, name, ...props },
    ref
  ) => {
    return (
      <div
        className={cn("grid gap-2", className)}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(
              child as React.ReactElement<{
                name?: string;
                checked?: boolean;
                defaultChecked?: boolean;
                value: string;
                onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
              }>,
              {
                name,
                checked: child.props.value === value,
                defaultChecked: child.props.value === defaultValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onValueChange?.(e.target.value);
                  child.props.onChange?.(e);
                },
              }
            );
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    value: string;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <label className="relative flex items-center">
      <input type="radio" className="peer sr-only" ref={ref} {...props} />
      <div
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}
      >
        <div className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-current opacity-0 peer-checked:opacity-100" />
        </div>
      </div>
      {children && <span className="ml-2 font-primary">{children}</span>}
    </label>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
