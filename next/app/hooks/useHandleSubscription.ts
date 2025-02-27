import { useRouter } from "next/navigation";
import { useSubscription } from "../context/SubscriptionContext";

export function useHandleSubscribe() {
  const router = useRouter();
  const { isSubscribed } = useSubscription();

  const handleSubscribe = async () => {
    if (!isSubscribed) {
      try {
        const response = await fetch("/api/subscriptions/create", {
          method: "POST",
        });
        const data = await response.json();

        if (data.url) {
          // Redirect to PayPal checkout
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Subscription creation failed:", error);
      }
    }
  };

  return handleSubscribe;
}
