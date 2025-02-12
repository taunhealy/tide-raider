"use client";

import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function LogVisibilityToggle({
  isPrivate,
  onChange,
  className,
}: {
  isPrivate: boolean;
  onChange: (isPrivate: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={!isPrivate ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(false)}
        className={cn(
          !isPrivate
            ? "bg-[var(--color-bg-tertiary)]"
            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-gray-100"
        )}
      >
        Public
      </Button>
      <Button
        variant={isPrivate ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(true)}
        className={cn(
          isPrivate
            ? "bg-[var(--color-bg-tertiary)]"
            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-gray-100"
        )}
      >
        Private
      </Button>
    </div>
  );
}
