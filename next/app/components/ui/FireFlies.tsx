"use client";

import { useEffect, useState, useRef } from "react";

interface Firefly {
  id: number;
  left: number;
  top: number;
  duration: number;
}

export default function FireFlies() {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newFirefly = {
        id: counter.current++,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 2 + 1,
      };

      setFireflies((prev) => [...prev, newFirefly]);

      setTimeout(() => {
        setFireflies((prev) => prev.filter((f) => f.id !== newFirefly.id));
      }, 3000);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Temporary debug output
  console.log("CSS variables:", {
    tertiaryRGB: getComputedStyle(document.documentElement).getPropertyValue(
      "--color-tertiary-rgb"
    ),
    tertiary: getComputedStyle(document.documentElement).getPropertyValue(
      "--color-tertiary"
    ),
  });

  return (
    <div className="fireflies-container">
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className="firefly"
          style={{
            left: `${firefly.left}vw`,
            top: `${firefly.top}vh`,
            animationDuration: `${firefly.duration}s`,
          }}
        />
      ))}

      <style jsx>{`
        .fireflies-container {
          position: fixed;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          top: 0;
          left: 0;
        }

        .firefly {
          width: 4px;
          height: 4px;
          background-color: rgba(var(--color-tertiary-rgb), 0.3);
          border-radius: 50%;
          position: absolute;
          animation: fly 3s infinite ease-in-out;
          mix-blend-mode: screen;
        }

        @keyframes fly {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(50px, -50px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
