import { AlertsList } from "@/app/components/alerts/AlertsList";
import { Button } from "@/app/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Alerts | Surf Forecast",
  description: "Manage your surf forecast alerts",
};

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-primary">Alerts</h1>
          <p className="text-gray-500 font-primary">
            Get notified when surf conditions match your preferences
          </p>
        </div>
        <Link href="/alerts/new">
          <Button className="font-primary flex items-center gap-2">
            <Bell className="h-4 w-4" />
            New Alert
          </Button>
        </Link>
      </div>

      <AlertsList />
    </div>
  );
}
