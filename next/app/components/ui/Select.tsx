"use client";

import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<ElementRef<"select">, SelectProps>(
  ({ children, value, onValueChange, ...props }, ref) => (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="w-full p-2 border rounded-lg bg-white"
      {...props}
    >
      {children}
    </select>
  )
);

export const SelectItem = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"option">) => (
  <option {...props}>{children}</option>
);
