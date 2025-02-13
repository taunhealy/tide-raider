"use client";

import { QuestLogForm } from "@/app/components/QuestLogForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RandomLoader } from "@/app/components/ui/RandomLoader";
import { getBeaches } from "@/app/lib/data";
import { useState } from "react";
import type { Beach } from "@/app/types/beaches";
import { useEffect } from "react";

export default function NewRaidLogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [beaches, setBeaches] = useState<Beach[]>([]);

  useEffect(() => {
    const loadBeaches = async () => {
      const beachData = await getBeaches();
      setBeaches(beachData as Beach[]);
    };
    loadBeaches();
  }, []);

  if (status === "loading") return <RandomLoader isLoading={true} />;
  if (!session) return router.push("/login");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <QuestLogForm
        isOpen={true}
        onClose={() => router.push("/raidlogs")}
        userEmail={session.user?.email || ""}
        beaches={beaches}
      />
    </div>
  );
}
