import RippleLoader from "./RippleLoader";
import { useEffect, useState, useRef } from "react";
import { SpritesLoader } from "./SpritesLoader";

export function RandomLoader({ isLoading }: { isLoading: boolean }) {
  const [selectedLoader, setSelectedLoader] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    setSelectedLoader(Math.floor(Math.random() * 2));
  }, []);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setIsVisible(true);
    } else {
      // Calculate remaining time to reach 1.5s minimum
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const remaining = Math.max(1500 - elapsed, 0);

      const timeout = setTimeout(() => setIsVisible(false), remaining);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <div
      className={`
      font-primary 
      fixed inset-0 z-50 flex items-center justify-center 
      bg-background transition-opacity duration-300 ease-in-out
      ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
    `}
    >
      {selectedLoader === 0 ? (
        <RippleLoader isLoading={isVisible} />
      ) : (
        <SpritesLoader />
      )}
    </div>
  );
}
