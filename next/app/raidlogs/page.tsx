"use client";

import { RaidLogsComponent } from "@/app/components/raid-logs/RaidLogsComponent";
import { useSession } from "next-auth/react";
import { beachData } from "@/app/types/beaches"; // Import beach data
import { RandomLoader } from "@/components/ui/RandomLoader";
import { RaidLogForm } from "@/components/raid-logs/RaidLogForm";
import { useRouter } from "next/navigation";

export default function RaidLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <RandomLoader isLoading={true} />;
  }

  // Allow access even without session
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      <RaidLogForm
        isOpen={true}
        onClose={() => router.push("/raidlogs")}
        userEmail={session?.user?.email || ""}
        beaches={beachData}
      />
    </div>
  );
}
