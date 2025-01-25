export interface FlightCost {
  from: string;
  to: string;
  price: number;
  airline: string;
  duration: string;
}

export interface DailyExpenses {
  food: number;
  transport: number;
  activities: number;
  medical: number;
}

export interface TripExpenses {
  flights: FlightCost[];
  accommodation: {
    costPerNight: number;
    numberOfNights: number;
  };
  dailyExpenses: DailyExpenses;
  totalCost: number;
}

export function calculateTotalTripCost(
  expenses: Omit<TripExpenses, "totalCost">
): TripExpenses {
  const flightsCost = expenses.flights.reduce(
    (total, flight) => total + flight.price,
    0
  );
  const accommodationCost =
    expenses.accommodation.costPerNight * expenses.accommodation.numberOfNights;
  const dailyCosts = Object.values(expenses.dailyExpenses).reduce(
    (sum, cost) => sum + cost,
    0
  );
  const totalDailyCosts = dailyCosts * expenses.accommodation.numberOfNights;

  return {
    ...expenses,
    totalCost: flightsCost + accommodationCost + totalDailyCosts,
  };
}
