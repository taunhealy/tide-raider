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
      <span className="text-sm font-medium text-gray-700">Visibility:</span>
      <Button
        variant={isPrivate ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(false)}
      >
        Public
      </Button>
      <Button
        variant={isPrivate ? "outline" : "default"}
        size="sm"
        onClick={() => onChange(true)}
      >
        Private
      </Button>
    </div>
  );
}
