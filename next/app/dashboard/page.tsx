"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { trialStatus, trialEndDate } = useSubscription();
  const [activeTab, setActiveTab] = useState<"account" | "billing">("account");
  const [username, setUsername] = useState<string>("");
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
    onMutate: () => {
      setLoadingStates((prev) => ({ ...prev, unsubscribe: true }));
    },
    onSettled: () => {
      setLoadingStates((prev) => ({ ...prev, unsubscribe: false }));
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: subscriptionDetails, isLoading: isLoadingDetails } =
    useSubscriptionDetails();
  const subscriptionData = subscriptionDetails?.data;
  const { mutate } = useSubscriptionManagement();

  // Add loading states
  const [loadingStates, setLoadingStates] = useState({
    trial: false,
    subscribe: false,
    unsubscribe: false,
    pause: false,
  });

  // Add query to fetch user data from database
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch(`/api/user/${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Update useEffect to use database username
  useEffect(() => {
    if (userData?.name) {
      setUsername(userData.name);
    }
  }, [userData?.name]);

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

  // Add this useEffect to refresh data when subscription changes
  useEffect(() => {
    const refreshData = async () => {
      await update(); // Update the session
      queryClient.invalidateQueries({ queryKey: ["subscriptionDetails"] });
      router.refresh(); // Refresh the page
    };

    // Set up event listener for subscription changes
    const channel = new BroadcastChannel("subscription-update");
    channel.onmessage = refreshData;

    return () => channel.close();
  }, [update, queryClient, router]);

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

  // Update the handleSubscribe to use loading state
  const handleSubscribeWithLoading = async () => {
    setLoadingStates((prev) => ({ ...prev, subscribe: true }));
    try {
      await handleSubscribe();
    } finally {
      setLoadingStates((prev) => ({ ...prev, subscribe: false }));
    }
  };

  const handleSubscriptionAction = async (
    action: "cancel" | "suspend" | "activate"
  ) => {
    if (!subscriptionData?.id) return;
    setLoadingStates((prev) => ({ ...prev, pause: true }));
    try {
      await mutate({ action, subscriptionId: subscriptionData.id });
    } catch (error) {
      console.error("Subscription action failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, pause: false }));
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
                    {isLoadingUser ? (
                      <div className="w-full h-[40px] bg-gray-200 animate-pulse rounded-md" />
                    ) : (
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError(null);
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                    )}
                    <Button
                      onClick={handleUsernameUpdate}
                      disabled={isLoading || isLoadingUser}
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
                                : subscriptionData.status === "suspended"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {subscriptionData.status.charAt(0).toUpperCase() +
                            subscriptionData.status.slice(1)}
                        </span>
                      </div>

                      {(trialEndDate ||
                        subscriptionData?.next_billing_time) && (
                        <p className="text-sm text-gray-600 font-primary">
                          {trialStatus === "active" ? (
                            <>
                              Trial ends on:{" "}
                              {trialEndDate
                                ? formatDate(trialEndDate.toString())
                                : "N/A"}
                            </>
                          ) : subscriptionData?.status === "CANCELLED" ? (
                            <>Subscription ended</>
                          ) : (
                            <>
                              Next billing date:{" "}
                              {formatDate(subscriptionData?.next_billing_time)}
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      {subscriptionData.status === "cancelled" ? (
                        <Button
                          variant="default"
                          className="w-full sm:w-auto font-primary"
                          onClick={handleSubscribeWithLoading}
                          disabled={loadingStates.subscribe}
                        >
                          {loadingStates.subscribe
                            ? "Processing..."
                            : "Resubscribe"}
                        </Button>
                      ) : (
                        <>
                          {subscriptionData.status === "active" && (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto font-primary text-[12px]"
                              onClick={() =>
                                handleSubscriptionAction("suspend")
                              }
                              disabled={loadingStates.pause}
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
                              {loadingStates.pause
                                ? "Processing..."
                                : "Suspend Subscription"}
                            </Button>
                          )}

                          {subscriptionData.status === "suspended" && (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto font-primary text-[12px]"
                              onClick={() =>
                                handleSubscriptionAction("activate")
                              }
                              disabled={loadingStates.pause}
                            >
                              Resume Subscription
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            className="w-full sm:w-auto font-primary text-[12px]"
                            onClick={() => handleUnsubscribe()}
                            disabled={loadingStates.unsubscribe}
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
                            {loadingStates.unsubscribe
                              ? "Cancelling..."
                              : "Cancel Subscription"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border rounded-xl bg-white shadow-sm">
                    {trialStatus === "active" && (
                      <div className="mb-4">
                        <p className="font-primary">
                          Your free trial is active 🐟🐟🐟
                          <span className="block mt-2 text-sm text-gray-600">
                            Trial ends on:{" "}
                            {trialEndDate
                              ? formatDate(trialEndDate.toString())
                              : "N/A"}
                          </span>
                        </p>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto font-primary mt-4"
                          onClick={() => (window.location.href = "/pricing")}
                        >
                          Continue to Subscription
                        </Button>
                      </div>
                    )}

                    {trialStatus === "ended" && (
                      <div className="mb-4">
                        <p className="font-primary text-red-600">
                          Your free trial has expired
                        </p>
                        <Button
                          variant="default"
                          className="w-full sm:w-auto font-primary mt-4 bg-blue-600 hover:bg-blue-700"
                          onClick={handleSubscribeWithLoading}
                          disabled={loadingStates.subscribe}
                        >
                          {loadingStates.subscribe
                            ? "Processing..."
                            : "Subscribe Now"}
                        </Button>
                      </div>
                    )}

                    {trialStatus === "available" && (
                      <div className="mb-4">
                        <p className="font-primary">
                          Ready to start your free trial?
                        </p>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto font-primary"
                          onClick={() =>
                            handleTrial({
                              onMutate: () =>
                                setLoadingStates((prev) => ({
                                  ...prev,
                                  trial: true,
                                })),
                              onSettled: () =>
                                setLoadingStates((prev) => ({
                                  ...prev,
                                  trial: false,
                                })),
                            })
                          }
                          disabled={loadingStates.trial}
                        >
                          {loadingStates.trial
                            ? "Starting Trial..."
                            : "Start 7-Day Free Trial"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-none w-full sm:w-[800px] relative h-[600px]">
          <div className="absolute inset-0">
            <Image
              src={
                data?.heroImage?.image
                  ? urlForImage(data.heroImage.image).url()
                  : "/fallback-image.jpg"
              }
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
