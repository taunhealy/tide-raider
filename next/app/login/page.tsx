"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md font-primary">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-[var(--color-tertiary)] text-white rounded-md hover:opacity-90 transition-colors"
      >
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </button>

      <p className="mt-4 text-sm text-gray-600 text-center">
        You'll be redirected to: {callbackUrl}
      </p>
    </div>
  );
}
