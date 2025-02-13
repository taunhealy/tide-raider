// ... existing utils ...

export const getWindEmoji = (speed: number): string => {
  if (speed < 5) return "🪶"; // Light
  if (speed < 12) return "💨"; // Moderate
  if (speed < 20) return "🌪️"; // Strong
  return "⛈️"; // Very strong
};

export const getSwellEmoji = (height: number): string => {
  if (height < 0.5) return "🥱"; // Flat
  if (height < 1) return "🌊"; // Small
  if (height < 2) return "🌊🌊"; // Medium
  return "🌊🌊🌊"; // Large
};

export const getDirectionEmoji = (direction: string | number): string => {
  const deg =
    typeof direction === "string" ? parseInt(direction) || 0 : direction;
  const dirIndex = Math.round(deg / 45) % 8;
  return ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"][dirIndex] || "➿";
};
