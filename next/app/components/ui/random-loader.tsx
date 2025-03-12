"use client";

import React from "react";

interface RandomLoaderProps {
  isLoading: boolean;
}

export const RandomLoader: React.FC<RandomLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50 font-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-tertiary)]"></div>
    </div>
  );
};
