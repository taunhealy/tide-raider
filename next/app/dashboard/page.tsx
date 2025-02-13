"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { useHandleSubscribe } from "../hooks/useHandleSubscribe";
import { useHandleTrial } from "../hooks/useHandleTrial";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const { isSubscribed, hasActiveTrial } = useSubscription();
  const [activeTab, setActiveTab] = useState<"account" | "billing">("account");
  const [username, setUsername] = useState(session?.user?.name || "");
  const queryClient = useQueryClient();
  const handleSubscribe = useHandleSubscribe();
  const { mutate: handleTrial } = useHandleTrial();
  const { mutate: handleUnsubscribe } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe" }),
      });
      if (!response.ok) throw new Error("Failed to unsubscribe");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: userLogs } = useQuery({
    queryKey: ["userLogs"],
    queryFn: async () => {
      const response = await fetch("/api/quest-log/user");
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
  });

  const handleUsernameUpdate = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update username");
      }

      const data = await response.json();
      await update();
      setUsername(data.name);
      toast.success("Username updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 font-primary">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="flex gap-4 mb-6 font-primary">
        <Button
          variant={activeTab === "account" ? "default" : "outline"}
          onClick={() => setActiveTab("account")}
        >
          Account
        </Button>
        <Button
          variant={activeTab === "billing" ? "default" : "outline"}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </Button>
      </div>

      <div className="min-h-[400px] min-w-[500px] max-w-[500px]">
        {activeTab === "account" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 font-primary">
                Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="flex-1 p-2 border rounded-md"
                />
                <Button onClick={handleUsernameUpdate} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2 font-primary">
                  User ID
                </label>
                <input
                  type="text"
                  value={session?.user?.id || ""}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  disabled
                />
              </div>
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold font-primary">
              Subscription Status
            </h2>
            {isSubscribed ? (
              <div className="p-4 border rounded-md bg-green-50">
                <p className="font-medium">Active Subscription</p>
                <Button
                  variant="destructive"
                  className="mt-2"
                  onClick={() => handleUnsubscribe()}
                >
                  Unsubscribe
                </Button>
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-yellow-50">
                <p className="mb-2">
                  {hasActiveTrial
                    ? "Your free trial is active. 🐟🐟🐟 "
                    : "No active subscription"}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    hasActiveTrial
                      ? (window.location.href = "/pricing")
                      : handleTrial()
                  }
                >
                  {hasActiveTrial
                    ? "Continue to Subscription"
                    : "Start Free Trial"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
