import TravelExpensesCalculator from "@/app/components/TravelExpensesCalculator";

interface SidebarSelectorProps {
  contentType: string;
  sidebarData: any;
}

export default function SidebarSelector({
  contentType,
  sidebarData,
}: SidebarSelectorProps) {
  if (!sidebarData) return null;

  switch (contentType) {
    case "travelExpenses":
      return (
        <TravelExpensesCalculator
          destinationAirport={sidebarData.airports[0]}
          accommodation={sidebarData.accommodation}
          dailyExpenses={sidebarData.dailyExpenses}
        />
      );
    default:
      return null;
  }
}
