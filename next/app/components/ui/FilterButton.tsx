import { cn } from "@/app/lib/utils";

interface FilterButtonProps {
  label: React.ReactNode;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  variant: "continent" | "country" | "region";
}

export function FilterButton({
  label,
  count,
  isSelected,
  onClick,
  variant,
}: FilterButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "continent":
        return isSelected
          ? "bg-white text-black border-black"
          : "bg-white text-black border-gray-100 hover:bg-gray-50";
      case "country":
        return isSelected
          ? "bg-white text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
          : "bg-white text-black border-gray-100 hover:bg-gray-50";
      case "region":
        return isSelected
          ? "bg-white text-black border-gray-400"
          : "bg-white text-black border-gray-100 hover:bg-gray-50";
    }
  };

  const getCountStyles = () => {
    return "bg-[var(--color-bg-tertiary)] text-white";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative rounded-[32px] flex items-center",
        "px-[16px] py-1 gap-2",
        "border whitespace-nowrap",
        getVariantStyles()
      )}
    >
      {label}
      {count > 0 && (
        <div className={cn("px-3 py-1 rounded-full", getCountStyles())}>
          {count}
        </div>
      )}
    </button>
  );
}
