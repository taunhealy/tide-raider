import { signIn } from 'next-auth/react';

export function useHandleSubscribe() {
  return async () => {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (!session?.user) {
        await signIn('google');
        return;
      }

      const checkoutResponse = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!checkoutResponse.ok) throw new Error('Failed to create checkout');
      const { url } = await checkoutResponse.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout process. Please try again.');
    }
  };
} 