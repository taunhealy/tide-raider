"use client";

import { RaidLogForm } from "@/app/components/raid-logs/RaidLogForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RandomLoader } from "@/app/components/ui/RandomLoader";
import { useState } from "react";
import type { Beach } from "@/app/types/beaches";
import { beachData } from "@/app/types/beaches";

export default function NewRaidLogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [beaches, setBeaches] = useState<Beach[]>(beachData);

  if (status === "loading") return <RandomLoader isLoading={true} />;
  if (!session) return router.push("/login");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RaidLogForm
        isOpen={true}
        onClose={() => router.push("/raidlogs")}
        userEmail={session.user?.email || ""}
        beaches={beaches}
      />
    </div>
  );
}
