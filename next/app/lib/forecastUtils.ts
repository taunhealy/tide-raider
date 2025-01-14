// ... existing utils ...

export const getWindEmoji = (speed: number): string => {
    if (speed < 5) return '🪶'; // Light
    if (speed < 12) return '💨'; // Moderate
    if (speed < 20) return '🌪️'; // Strong
    return '⛈️'; // Very strong
  };
  
  export const getSwellEmoji = (height: number): string => {
    if (height < 0.5) return '🥱'; // Flat
    if (height < 1) return '🌊'; // Small
    if (height < 2) return '🌊🌊'; // Medium
    return '🌊🌊🌊'; // Large
  };
  
  export const getDirectionEmoji = (degrees: number): string => {
    // Convert degrees to cardinal direction emoji
    const directions = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
    const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8;
    return directions[index];
  };