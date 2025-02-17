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
import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import { client } from "@/lib/sanity";
import { groq } from "next-sanity";

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
      const response = await fetch("/api/raid-logs/user");
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
  });

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      return client.fetch(groq`*[_type == "dashboard"][0] {
        heroImage {
          image { ..., asset-> },
          alt
        }
      }`);
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
    <div className="container mx-auto p-4 sm:p-6 font-primary">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h1>

          <div className="flex flex-row sm:flex-row gap-2 sm:gap-4 mb-6">
            <Button
              variant={activeTab === "account" ? "default" : "outline"}
              onClick={() => setActiveTab("account")}
              className="w-full sm:w-auto"
            >
              Account
            </Button>
            <Button
              variant={activeTab === "billing" ? "default" : "outline"}
              onClick={() => setActiveTab("billing")}
              className="w-full sm:w-auto"
            >
              Billing
            </Button>
          </div>

          <div className="min-h-[400px] w-full max-w-full sm:min-w-[500px] sm:max-w-[500px]">
            {activeTab === "account" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 space-y-2 sm:space-y-0">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                    <Button
                      onClick={handleUsernameUpdate}
                      disabled={isLoading}
                      variant="outline"
                      className="max-w-[320px] sm:max-w-[540px]"
                    >
                      {isLoading ? "Updating..." : "Update"}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={session?.user?.id || ""}
                      className="w-full p-2 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Subscription Status
                </h2>
                {isSubscribed ? (
                  <div className="p-2 sm:p-4 border rounded-md bg-green-50">
                    <p className="font-medium">Active Subscription</p>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto mt-2"
                      onClick={() => handleUnsubscribe()}
                    >
                      Unsubscribe
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 sm:p-4 border rounded-md bg-yellow-50">
                    <p className="mb-2">
                      {hasActiveTrial
                        ? "Your free trial is active. 🐟🐟🐟 "
                        : "No active subscription"}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
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

        <div className="flex-none w-full sm:w-[800px] relative h-[600px]">
          <div className="absolute inset-0">
            <Image
              src={urlForImage(data?.heroImage?.image)?.url() || ""}
              alt={data?.heroImage?.alt || "Dashboard background"}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
