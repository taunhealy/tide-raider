export function calculateRentalCost(weeks: number): {
  zarAmount: number;
  usdAmount: number;
} {
  // Ensure minimum 2 weeks
  const effectiveWeeks = Math.max(2, Math.ceil(weeks));

  // Base rates per week
  const ZAR_RATE_PER_WEEK = 700;
  const USD_RATE_PER_WEEK = 37.43;

  return {
    zarAmount: ZAR_RATE_PER_WEEK * effectiveWeeks,
    usdAmount: USD_RATE_PER_WEEK * effectiveWeeks,
  };
}
