/**
 * Formats a country name to ensure consistent capitalization
 * (first letter of each word uppercase, rest lowercase)
 */
export function formatCountryName(country: string): string {
  if (!country) return "";

  // Split by spaces and hyphens, capitalize each part, then rejoin
  return country
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Formats an array of country names with consistent capitalization
 * and joins them with the specified separator
 */
export function formatCountryList(
  countries: string[],
  separator: string = ", "
): string {
  if (!countries || !countries.length) return "";
  return countries.map(formatCountryName).join(separator);
}
