'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useHandleSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ action, userId }: { action: 'subscribe' | 'unsubscribe', userId: string }) => {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })
      if (!response.ok) throw new Error(`Failed to ${action}`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    }
  })
} 