"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="rounded-md bg-blue-500 px-4 py-2 text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}
