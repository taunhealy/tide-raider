import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useHandleTrial() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: {
      onMutate?: () => void;
      onSettled?: () => void;
    }) => {
      if (!session?.user) {
        throw new Error("Must be logged in to start trial");
      }

      const response = await fetch("/api/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start trial");
      }

      options?.onMutate?.();
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user session to update trial status
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onSettled: () => {
      // This is called when the mutation is complete, regardless of success or failure
      // You can use this to perform any cleanup or side effects
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
