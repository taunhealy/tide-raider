import { useRouter } from "next/navigation";
import { useSubscription } from "../context/SubscriptionContext";

export function useHandleSubscribe() {
  const router = useRouter();
  const { isSubscribed } = useSubscription();

  const handleSubscribe = () => {
    if (!isSubscribed) {
      router.push("/pricing");
    }
  };

  return handleSubscribe;
}
