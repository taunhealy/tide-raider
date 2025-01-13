import { Search } from 'lucide-react';
import { Inter } from 'next/font/google';
import { cn } from '@/app/lib/utils';

const inter = Inter({ subsets: ["latin"] });

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search breaks..." }: SearchBarProps) {
  return (
    <div className={cn(
      "relative w-full max-w-md",
      inter.className
    )}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent
                 placeholder-gray-400 transition-all"
      />
    </div>
  );
} 