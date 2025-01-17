"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="rounded-md bg-black px-4 py-2 text-white"
    >
      Sign in with Google
    </button>
  );
}

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
