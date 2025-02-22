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
import { useSubscriptionDetails } from "../hooks/useSubscriptionDetails";
import { formatDate } from "../lib/utils";
import { useSubscriptionManagement } from "../hooks/useSubscriptionManagement";

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
  const { data: subscriptionDetails, isLoading: isLoadingDetails } =
    useSubscriptionDetails();
  const subscriptionData = subscriptionDetails?.data?.attributes;
  const { mutate } = useSubscriptionManagement();

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

  const handleSubscriptionAction = async (action: string) => {
    if (!subscriptionData?.id) return;
    try {
      await mutate({ action, subscriptionId: subscriptionData.id });
    } catch (error) {
      console.error("Subscription action failed:", error);
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
                <h2 className="text-lg sm:text-xl font-semibold font-primary">
                  Subscription Status
                </h2>
                {isLoadingDetails ? (
                  <div className="p-4 text-center font-primary">
                    Loading subscription details...
                  </div>
                ) : subscriptionData ? (
                  <div className="p-6 border rounded-xl bg-white shadow-sm space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${
                            subscriptionData.status === "trialing"
                              ? "bg-blue-50 text-blue-700"
                              : subscriptionData.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {subscriptionData.status.charAt(0).toUpperCase() +
                            subscriptionData.status.slice(1)}
                        </span>
                      </div>

                      {(subscriptionData.trial_ends_at ||
                        subscriptionData.ends_at) && (
                        <p className="text-sm text-gray-600 font-primary">
                          {subscriptionData.trial_ends_at ? (
                            <>
                              Trial ends on:{" "}
                              {formatDate(subscriptionData.trial_ends_at)}
                            </>
                          ) : (
                            <>
                              Next billing date:{" "}
                              {formatDate(subscriptionData.ends_at)}
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto font-primary text-[12px]"
                        onClick={() => handleSubscriptionAction("pause")}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pause Subscription
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full sm:w-auto font-primary text-[12px]"
                        onClick={() => {
                          window.open(
                            subscriptionData?.urls?.update_payment_method,
                            "_blank"
                          );
                        }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Update Payment Method
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto font-primary text-[12px]"
                        onClick={() => handleUnsubscribe()}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel Subscription
                      </Button>
                    </div>

                    {subscriptionData.pause_resumes_at && (
                      <p className="text-sm text-gray-600 font-primary pt-4 border-t">
                        Subscription will resume on:{" "}
                        {formatDate(subscriptionData.pause_resumes_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 border rounded-xl bg-white shadow-sm">
                    <p className="mb-4 font-primary">
                      {hasActiveTrial &&
                      subscriptionDetails?.data?.attributes?.trial_ends_at &&
                      new Date(
                        subscriptionDetails.data.attributes.trial_ends_at
                      ) > new Date() ? (
                        <>
                          Your free trial is active. 🐟🐟🐟
                          <span className="block mt-2 text-sm text-gray-600">
                            Trial ends on:{" "}
                            {formatDate(
                              subscriptionDetails.data.attributes.trial_ends_at
                            )}
                          </span>
                        </>
                      ) : (
                        "No active subscription"
                      )}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto font-primary"
                      onClick={() =>
                        hasActiveTrial &&
                        subscriptionDetails?.data?.attributes?.trial_ends_at &&
                        new Date(
                          subscriptionDetails.data.attributes.trial_ends_at
                        ) > new Date()
                          ? (window.location.href = "/pricing")
                          : handleTrial()
                      }
                    >
                      {hasActiveTrial &&
                      subscriptionDetails?.data?.attributes?.trial_ends_at &&
                      new Date(
                        subscriptionDetails.data.attributes.trial_ends_at
                      ) > new Date()
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
