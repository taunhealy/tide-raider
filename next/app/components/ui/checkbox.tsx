"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/app/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        className="peer absolute h-4 w-4 cursor-pointer opacity-0"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        {...props}
      />
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary ring-offset-background peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          checked && "bg-primary text-primary-foreground",
          className
        )}
      >
        {checked && <Check className="h-4 w-4" />}
      </div>
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
