import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export interface LabelProps extends ComponentPropsWithoutRef<"label"> {
  htmlFor?: string;
}

export function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none text-gray-900",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}
