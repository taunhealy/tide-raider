"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { QuestLogForm } from "@/app/components/QuestLogForm";
import { RandomLoader } from "@/app/components/ui/RandomLoader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Beach } from "@/types/beaches";
import { getBeaches } from "@/app/lib/data";

export default function RaidLogPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadBeaches = async () => {
      const beachData = await getBeaches();
      setBeaches(beachData);
    };
    loadBeaches();
  }, []);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["questLog", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/quest-log/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch log");
      return res.json();
    },
  });

  if (isLoading) return <RandomLoader isLoading={true} />;

  const isAuthor = entry?.surferEmail === session?.user?.email;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {isAuthor ? (
        <QuestLogForm
          isOpen={true}
          onClose={() => router.push("/raidlogs")}
          entry={entry}
          isEditing={true}
          beaches={beaches}
          userEmail={session?.user?.email || ""}
        />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>You can only edit your own surf logs</p>
        </div>
      )}
    </div>
  );
}
